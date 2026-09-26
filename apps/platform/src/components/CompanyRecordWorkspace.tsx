import { useState } from 'react';
import { Modal } from './UI';
import type { Project } from '../lib/model';
import { CompanyPlanningTools } from './CompanyPlanningTools';
import { CompanyDomainTools } from './CompanyDomainTools';
import { companySchemas, companyFeatures, type CompanyRecord } from '../lib/company-features';
import {
  recordMeta,
  requestReview,
  decideReview,
  hasApproval,
  companyEvidence,
  calculateVariance,
  companyRun,
  nextOccurrences,
  validateTeamGraph,
  type Actor,
  type CompanyMeta,
} from '../lib/company-workflows';
type Props = {
  projects: Project[];
  record: CompanyRecord;
  records: CompanyRecord[];
  actor: Actor;
  canManage: boolean;
  readOnly: boolean;
  demo: boolean;
  onSave: (r: CompanyRecord) => void;
  onOpen: (r: CompanyRecord) => void;
  onEdit: () => void;
  onClose: () => void;
  onContinue: () => void;
  onCreate: (feature: string, values: Record<string, string>, source: CompanyRecord) => void;
};
const exportRecord = (name: string, text: string, type = 'text/plain') => {
  const u = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
};
export function CompanyRecordWorkspace({
  projects,
  record: r,
  records,
  actor,
  canManage,
  readOnly,
  demo,
  onSave,
  onOpen,
  onEdit,
  onClose,
  onContinue,
  onCreate,
}: Props) {
  const [tab, setTab] = useState('Work'),
    [message, setMessage] = useState(''),
    [reviewer, setReviewer] = useState(''),
    [error, setError] = useState(''),
    [link, setLink] = useState(''),
    [relation, setRelation] = useState('Depends on'),
    [task, setTask] = useState(''),
    [taskOwner, setTaskOwner] = useState(actor.name),
    [simKind, setSimKind] = useState('workflow'),
    [compare, setCompare] = useState('');
  const m = recordMeta(r);
  const feature = companyFeatures.find((f) => f.id === r.feature)!;
  const schema = companySchemas[r.feature];
  const saveMeta = (patch: Partial<CompanyMeta>) => {
    if (!readOnly) onSave({ ...r, meta: { ...m, ...patch } });
  };
  const safe = (fn: () => void) => {
    try {
      setError('');
      fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const linked = records.filter(
    (x) =>
      x.id !== r.id &&
      (x.sourceId === r.id ||
        r.sourceId === x.id ||
        m.links.some((l) => l.id === x.id) ||
        (r.values.accountId && x.values.accountId === r.values.accountId) ||
        x.id === r.values.accountId),
  );
  const outcome = ['PLAN-N1', 'CX-N2', 'OPS-N4', 'BI-N3', 'BI-N4', 'AGENT-N1'].includes(r.feature);
  const difference = m.snapshots.find((s) => String(s.revision) === compare);
  return (
    <Modal title={r.title} onClose={onClose} wide>
      <div className="company-record-heading">
        <div>
          <span className="status">{r.feature}</span>
          <span className="muted">
            {' '}
            Revision {m.revision} · {r.owner} · {r.stage}
          </span>
        </div>
        <button className="button" disabled={readOnly} onClick={onEdit}>
          Edit fields
        </button>
      </div>
      <div className="segmented">
        {['Work', 'Linked work', 'Review', 'History'].map((t) => (
          <button aria-pressed={tab === t} key={t} onClick={() => setTab(t)}>
            {t}
            {t === 'Review' && m.review?.decision === 'Pending' ? ' · pending' : ''}
          </button>
        ))}
      </div>
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {tab === 'Work' && (
        <>
          <p>{feature.scope}</p>
          <div className="company-record-summary">
            <span>
              Record ID <code>{r.id}</code>
            </span>
            <span>
              {hasApproval(r)
                ? 'Current revision approved'
                : 'Current revision needs review before consequential handoffs'}
            </span>
          </div>
          <dl className="company-review-grid">
            {schema.fields
              .filter((f) => f.type !== 'project')
              .map((f) => (
                <div key={f.key}>
                  <dt>{f.label}</dt>
                  <dd>
                    {f.type === 'account'
                      ? records.find((x) => x.id === r.values[f.key])?.title || 'Not linked'
                      : r.values[f.key] || 'Not specified'}
                  </dd>
                </div>
              ))}
          </dl>
          {r.feature === 'FIN-N5' && (
            <div className="company-stats">
              {Object.entries(calculateVariance(r)).map(([k, v]) => (
                <div className="panel" key={k}>
                  <span>{k}</span>
                  <strong>
                    {v === null ? 'No baseline' : v.toFixed(2)}{' '}
                    {k === 'percent' ? '%' : r.values.currency}
                  </strong>
                </div>
              ))}
            </div>
          )}
          {r.feature === 'CRM-N3' && (
            <div className="notice">
              Weighted forecast:{' '}
              {(
                ((Number(r.values.amount) || 0) * (Number(r.values.probability) || 0)) /
                100
              ).toFixed(2)}{' '}
              {r.values.currency}. This is an estimate; Won is not booked revenue.
            </div>
          )}
          {r.feature === 'MKT-N5' && (
            <div className="company-stats">
              <div className="panel">
                Conversion rate
                <strong>
                  {Number(r.values.leads) > 0
                    ? (
                        ((Number(r.values.conversions) || 0) / Number(r.values.leads)) *
                        100
                      ).toFixed(1) + '%'
                    : 'Unknown — no lead baseline'}
                </strong>
              </div>
              <div className="panel">
                Cost per conversion
                <strong>
                  {Number(r.values.conversions) > 0
                    ? '$' +
                      ((Number(r.values.spend) || 0) / Number(r.values.conversions)).toFixed(2)
                    : 'Unknown'}
                </strong>
              </div>
            </div>
          )}
          {['BI-N1', 'BI-N3', 'BI-N4', 'BI-N6', 'OPS-N4'].includes(r.feature) && (
            <AnalysisPreview record={r} records={records} onOpen={onOpen} />
          )}
          {['CRM-N1', 'CRM-N2', 'CX-N1'].includes(r.feature) && (
            <section className="panel">
              <h3>Identity & duplicate review</h3>
              <p className="muted">
                Compare before linking. Linking preserves both records; it never silently merges
                their histories.
              </p>
              {records
                .filter(
                  (x) =>
                    x.id !== r.id &&
                    !x.archived &&
                    ((r.values.email &&
                      x.values.email?.toLowerCase() === r.values.email.toLowerCase()) ||
                      (r.values.company &&
                        x.values.company?.toLowerCase() === r.values.company.toLowerCase()) ||
                      (r.feature === 'CX-N1' &&
                        x.feature === 'CX-N1' &&
                        x.values.theme === r.values.theme)),
                )
                .map((x) => (
                  <div className="setting-row" key={x.id}>
                    <button className="text-button" onClick={() => onOpen(x)}>
                      {x.title}
                    </button>
                    <span>
                      {x.owner} · {x.stage}
                    </span>
                    <button
                      className="button"
                      disabled={readOnly || m.links.some((l) => l.id === x.id)}
                      onClick={() =>
                        saveMeta({
                          links: [
                            ...m.links,
                            { id: x.id, relation: 'Related / potential duplicate' },
                          ],
                        })
                      }
                    >
                      Link related record
                    </button>
                  </div>
                ))}
            </section>
          )}
          {[
            'PLAN-N1',
            'CX-N3',
            'PEOPLE-N2',
            'MKT-N1',
            'MKT-N3',
            'FIN-N2',
            'OPS-N2',
            'ORG-N4',
          ].includes(r.feature) && (
            <section className="panel">
              <h3>Owned checklist & readiness</h3>
              <p className="muted">
                Each completion needs an owner and evidence. These are internal confirmations, not
                provider-executed actions.
              </p>
              {m.checklist.map((item) => (
                <div className="company-checklist-item" key={item.id}>
                  <input
                    type="checkbox"
                    aria-label={'Complete ' + item.text}
                    checked={item.done}
                    disabled={readOnly || !item.evidence.trim()}
                    onChange={(e) =>
                      saveMeta({
                        checklist: m.checklist.map((i) =>
                          i.id === item.id ? { ...i, done: e.target.checked } : i,
                        ),
                      })
                    }
                  />
                  <div>
                    <strong>{item.text}</strong>
                    <small>{item.owner}</small>
                    <input
                      aria-label={'Evidence for ' + item.text}
                      placeholder="Evidence or verified result reference"
                      value={item.evidence}
                      disabled={readOnly}
                      onChange={(e) =>
                        saveMeta({
                          checklist: m.checklist.map((i) =>
                            i.id === item.id ? { ...i, evidence: e.target.value } : i,
                          ),
                        })
                      }
                    />
                  </div>
                  <button
                    className="button"
                    disabled={readOnly}
                    onClick={() =>
                      saveMeta({ checklist: m.checklist.filter((i) => i.id !== item.id) })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="row">
                <input
                  aria-label="Checklist task"
                  placeholder="Add a concrete readiness task"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                />
                <input
                  aria-label="Task owner"
                  value={taskOwner}
                  onChange={(e) => setTaskOwner(e.target.value)}
                />
                <button
                  className="button"
                  disabled={readOnly || !task.trim() || !taskOwner.trim()}
                  onClick={() => {
                    saveMeta({
                      checklist: [
                        ...m.checklist,
                        {
                          id: crypto.randomUUID(),
                          text: task,
                          owner: taskOwner,
                          done: false,
                          evidence: '',
                        },
                      ],
                    });
                    setTask('');
                  }}
                >
                  Add owned task
                </button>
              </div>
            </section>
          )}
          {['AGENT-N3', 'BI-N5', 'CRM-N4', 'MKT-N4'].includes(r.feature) && (
            <SchedulePreview record={r} readOnly={readOnly} onSave={saveMeta} />
          )}
          {['AGENT-N1', 'AGENT-N4'].includes(r.feature) && (
            <TeamGraph
              record={r}
              records={records}
              readOnly={readOnly}
              onSave={saveMeta}
              onOpen={onOpen}
            />
          )}
          <CompanyPlanningTools
            record={r}
            records={records}
            projects={projects}
            actor={actor}
            readOnly={readOnly}
            onSave={onSave}
            onOpen={onOpen}
            onContinue={onContinue}
          />
          <CompanyDomainTools
            record={r}
            records={records}
            actor={actor}
            readOnly={readOnly}
            onSave={onSave}
            onOpen={onOpen}
          />
          <section className="panel">
            <h3>Rehearse the complete next step</h3>
            <p className="muted">
              Simulated steps produce inspectable evidence states. They do not send messages, run
              tools, alter infrastructure or charge funds.
            </p>
            <div className="row">
              <select
                aria-label="Rehearsal scenario"
                value={simKind}
                onChange={(e) => setSimKind(e.target.value)}
              >
                {['workflow', 'analysis', 'sync', 'publish', 'experiment'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <button
                className="button"
                disabled={readOnly}
                onClick={() => saveMeta({ runs: [companyRun(r, simKind), ...m.runs] })}
              >
                Start labeled rehearsal
              </button>
            </div>
            {m.runs.map((run) => (
              <details key={run.id} className="company-editor-history">
                <summary>
                  {run.status} · revision {run.sourceRevision} · {new Date(run.at).toLocaleString()}
                </summary>
                {run.steps.map((step, i) => (
                  <div className="setting-row" key={i}>
                    <span>{step.name}</span>
                    <select
                      aria-label={step.name + ' state'}
                      value={step.state}
                      disabled={readOnly}
                      onChange={(e) =>
                        saveMeta({
                          runs: m.runs.map((x) =>
                            x.id === run.id
                              ? {
                                  ...x,
                                  steps: x.steps.map((s, n) =>
                                    n === i ? { ...s, state: e.target.value } : s,
                                  ),
                                }
                              : x,
                          ),
                        })
                      }
                    >
                      {[
                        'Simulated',
                        'Passed simulation',
                        'Failed simulation',
                        'Skipped',
                        'Unsupported',
                        'Needs evidence',
                      ].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                    <small>{step.evidence}</small>
                  </div>
                ))}
                <div className="row">
                  <button
                    className="button"
                    disabled={readOnly}
                    onClick={() =>
                      saveMeta({
                        runs: m.runs.map((x) =>
                          x.id === run.id ? { ...x, status: 'Cancelled' } : x,
                        ),
                      })
                    }
                  >
                    Cancel this rehearsal
                  </button>
                  <button
                    className="button"
                    disabled={readOnly}
                    onClick={() => saveMeta({ runs: [companyRun(r, simKind), ...m.runs] })}
                  >
                    Retry as a new attempt
                  </button>
                </div>
              </details>
            ))}
          </section>
          <div className="row">
            <button
              className="button"
              onClick={() =>
                exportRecord(
                  r.feature + '-' + r.id + '.json',
                  JSON.stringify(r, null, 2),
                  'application/json',
                )
              }
            >
              Export this record
            </button>
            {r.feature === 'BI-N5' && (
              <button
                className="button"
                onClick={() => {
                  const scope = linked.filter((x) => x.feature === 'BI-N1');
                  const format = r.values.format;
                  const payload =
                    format === 'CSV'
                      ? 'name,current,target,unit\n' +
                        scope
                          .map((x) =>
                            [x.title, x.values.current, x.values.target, x.values.unit]
                              .map((v) => JSON.stringify(v || ''))
                              .join(','),
                          )
                          .join('\n')
                      : format === 'Markdown'
                        ? scope
                            .map(
                              (x) =>
                                `- ${x.title}: ${x.values.current || 'unknown'} ${x.values.unit || ''} (target ${x.values.target || 'unset'})`,
                            )
                            .join('\n')
                        : JSON.stringify(scope, null, 2);
                  exportRecord(
                    'report-snapshot.' +
                      (format === 'CSV' ? 'csv' : format === 'Markdown' ? 'md' : 'json'),
                    payload,
                  );
                }}
              >
                Preview/export selected report snapshot
              </button>
            )}
            {r.feature === 'DATA-N1' && (
              <button
                className="button"
                onClick={() =>
                  exportRecord(
                    'architect-chatgpt-manifest.json',
                    JSON.stringify(
                      {
                        type: 'proposed-connection',
                        endpoint: r.values.endpoint,
                        authentication: r.values.auth,
                        scopes: r.values.scope?.split(','),
                        review: r.values.review,
                        returnProject: r.projectId,
                        notRegistered: true,
                      },
                      null,
                      2,
                    ),
                    'application/json',
                  )
                }
              >
                Export connection manifest
              </button>
            )}
          </div>
        </>
      )}
      {tab === 'Linked work' && (
        <>
          <p>Open the precise record. Context and return links travel with it.</p>
          {linked.map((x) => (
            <button className="company-activity" key={x.id} onClick={() => onOpen(x)}>
              <span>
                <strong>{x.title}</strong>
                <small>
                  {x.feature} · {x.stage} ·{' '}
                  {m.links.find((l) => l.id === x.id)?.relation ||
                    (x.id === r.sourceId ? 'Origin' : 'Related work')}
                </small>
              </span>
            </button>
          ))}
          <div className="row">
            <select
              aria-label="Link existing record"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            >
              <option value="">Choose an existing record</option>
              {records
                .filter((x) => x.id !== r.id && !x.archived)
                .map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.feature} · {x.title}
                  </option>
                ))}
            </select>
            <select
              aria-label="Relationship"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
            >
              {[
                'Depends on',
                'Parent epic / program',
                'Measures outcome',
                'Implements',
                'Related / potential duplicate',
                'Approved asset',
                'Required release',
                'Source evidence',
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <button
              className="button"
              disabled={readOnly || !link || m.links.some((x) => x.id === link)}
              onClick={() => {
                saveMeta({ links: [...m.links, { id: link, relation }] });
                setLink('');
              }}
            >
              Link record
            </button>
          </div>
          <h3>Create a connected next step</h3>
          <div className="row">
            {(r.feature.startsWith('CRM')
              ? [
                  ['CRM-N3', 'Opportunity'],
                  ['CRM-N5', 'Proposal'],
                ]
              : r.feature.startsWith('BI')
                ? [
                    ['PLAN-N1', 'Delivery task'],
                    ['MKT-N1', 'Rollout campaign'],
                  ]
                : r.feature.startsWith('MKT')
                  ? [
                      ['MKT-N4', 'Publishing review'],
                      ['BI-N1', 'Campaign metric'],
                    ]
                  : r.feature.startsWith('PEOPLE')
                    ? [
                        ['PLAN-N1', 'Owned task'],
                        ['BI-N1', 'Outcome metric'],
                      ]
                    : [
                        ['PLAN-N1', 'Delivery task'],
                        ['BI-N1', 'Outcome metric'],
                      ]
            ).map(([id, label]) => (
              <button
                key={id}
                className="button"
                disabled={readOnly}
                onClick={() =>
                  onCreate(
                    id,
                    {
                      accountId: r.values.accountId || (r.feature === 'CRM-N1' ? r.id : ''),
                      evidence: companyEvidence(r),
                      acceptance: companyEvidence(r),
                      source: r.id,
                      campaign: r.feature === 'MKT-N1' ? r.id : r.values.campaign || '',
                      goal: r.values.goal || r.title,
                    },
                    r,
                  )
                }
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
      {tab === 'Review' && (
        <>
          <h3>Decision on revision {m.revision}</h3>
          <p>
            Approvals identify the reviewer and exact content revision. Editing content invalidates
            prior approval.
          </p>
          {m.review ? (
            <div className="notice">
              <strong>{m.review.decision}</strong> · requested by {m.review.requestedBy.name} ·
              reviewer {m.review.reviewer}
              <p>{m.review.evidence}</p>
              {m.review.decidedBy && <small>Decided by {m.review.decidedBy.name}</small>}
            </div>
          ) : (
            <p className="muted">No review requested for this revision.</p>
          )}
          <label className="field">
            Assigned reviewer
            <input
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              placeholder="Member name or identifier"
            />
          </label>
          <button
            className="button"
            disabled={readOnly || !reviewer.trim()}
            onClick={() => safe(() => onSave(requestReview(r, actor, reviewer)))}
          >
            Request review
          </button>
          <label className="field">
            Decision evidence
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain the decision and link supporting evidence"
            />
          </label>
          <div className="row">
            {(['Approved', 'Changes requested', 'Rejected'] as const).map((d) => (
              <button
                key={d}
                className="button"
                disabled={readOnly || !m.review || !message.trim()}
                onClick={() =>
                  safe(() => onSave(decideReview(r, actor, d, message, canManage, false)))
                }
              >
                {d}
              </button>
            ))}
            {demo && (
              <button
                className="button"
                disabled={readOnly || !m.review || !message.trim()}
                onClick={() =>
                  safe(() => onSave(decideReview(r, actor, 'Approved', message, false, true)))
                }
              >
                Simulate independent approval
              </button>
            )}
          </div>
          <h3>Discussion</h3>
          {m.comments.map((c) => (
            <article className="company-comment" key={c.id}>
              <strong>{c.actor.name}</strong>
              <small>{new Date(c.at).toLocaleString()}</small>
              <p>{c.text}</p>
              <button
                className="text-button"
                disabled={readOnly}
                onClick={() =>
                  saveMeta({
                    comments: m.comments.map((x) =>
                      x.id === c.id ? { ...x, resolved: !x.resolved } : x,
                    ),
                  })
                }
              >
                {c.resolved ? 'Reopen' : 'Resolve'} comment
              </button>
            </article>
          ))}
          <button
            className="button"
            disabled={readOnly || !message.trim()}
            onClick={() => {
              saveMeta({
                comments: [
                  ...m.comments,
                  {
                    id: crypto.randomUUID(),
                    at: new Date().toISOString(),
                    actor,
                    text: message,
                    resolved: false,
                  },
                ],
              });
              setMessage('');
            }}
          >
            Add discussion note
          </button>
        </>
      )}
      {tab === 'History' && (
        <>
          <h3>Compare exact content revisions</h3>
          <select
            aria-label="Compare revision"
            value={compare}
            onChange={(e) => setCompare(e.target.value)}
          >
            <option value="">Choose previous revision</option>
            {m.snapshots.map((s) => (
              <option key={s.revision} value={s.revision}>
                Revision {s.revision} · {s.actor.name}
              </option>
            ))}
          </select>
          {difference && (
            <div className="grid-two">
              <section className="panel">
                <h4>Revision {difference.revision}</h4>
                <pre>{JSON.stringify(difference.values, null, 2)}</pre>
                <button
                  className="button"
                  disabled={readOnly}
                  onClick={() =>
                    onSave({ ...r, title: difference.title, values: { ...difference.values } })
                  }
                >
                  Restore as new revision
                </button>
              </section>
              <section className="panel">
                <h4>Current revision {m.revision}</h4>
                <pre>{JSON.stringify(r.values, null, 2)}</pre>
              </section>
            </div>
          )}
          {r.history.map((h, i) => (
            <p key={i}>
              {h.stage} · {h.note} · {new Date(h.at).toLocaleString()}
            </p>
          ))}
        </>
      )}
      <div className="modal-footer">
        <button className="button" onClick={onClose}>
          Back to workspace
        </button>
        <button className="button primary" onClick={onContinue}>
          {schema.nextLabel}
        </button>
      </div>
    </Modal>
  );
}
function AnalysisPreview({
  record: r,
  records,
  onOpen,
}: {
  record: CompanyRecord;
  records: CompanyRecord[];
  onOpen: (r: CompanyRecord) => void;
}) {
  const [filter, setFilter] = useState(''),
    [kind, setKind] = useState(r.values.chart || 'Bar');
  const m = recordMeta(r);
  const metrics = records.filter(
    (x) =>
      x.feature === 'BI-N1' &&
      !x.archived &&
      (!m.links.some((l) => records.find((z) => z.id === l.id)?.feature === 'BI-N1') ||
        m.links.some((l) => l.id === x.id)) &&
      (x.title + ' ' + x.values.cohort).toLowerCase().includes(filter.toLowerCase()),
  );
  const max = Math.max(1, ...metrics.map((x) => Math.abs(Number(x.values.current) || 0)));
  return (
    <section className="panel">
      <h3>Inspect the supplied measures</h3>
      <p className="muted">
        Entered data only. This view does not query a database or infer causation.
      </p>
      <div className="row">
        <input
          aria-label="Filter analysis measures"
          placeholder="Filter measure or cohort"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <select
          aria-label="Analysis visualization"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          {['Table', 'Bar', 'Metric', 'Line'].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>
      {metrics.length ? (
        metrics.map((x) => (
          <button className="company-analysis-row" key={x.id} onClick={() => onOpen(x)}>
            <span>
              {x.title}
              <small>
                {x.values.cohort} · {x.values.timeframe} · {x.values.source || 'No source'}
              </small>
            </span>
            {kind === 'Bar' && (
              <i style={{ width: `${(Math.abs(Number(x.values.current) || 0) / max) * 35}%` }} />
            )}
            <strong>
              {x.values.current || 'Unknown'} {x.values.unit}
            </strong>
            <small>Target {x.values.target || 'unset'} · Inspect source →</small>
          </button>
        ))
      ) : (
        <p>No matching metrics. Link a definition before drawing conclusions.</p>
      )}
      {kind === 'Line' && (
        <div className="notice">
          A time series requires timestamped observations. Current records contain one value each,
          so no fabricated trend line is drawn.
        </div>
      )}
    </section>
  );
}
function SchedulePreview({
  record: r,
  readOnly,
  onSave,
}: {
  record: CompanyRecord;
  readOnly: boolean;
  onSave: (p: Partial<CompanyMeta>) => void;
}) {
  const m = recordMeta(r),
    s = m.schedule || {
      cadence: 'Daily',
      time: '09:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      event: '',
      enabled: false,
    };
  return (
    <section className="panel">
      <h3>Schedule rehearsal</h3>
      <div className="grid-two">
        <label className="field">
          Cadence
          <select
            value={s.cadence}
            disabled={readOnly}
            onChange={(e) => onSave({ schedule: { ...s, cadence: e.target.value } })}
          >
            {['Daily', 'Weekly', 'Event-driven', 'Manual'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Local time
          <input
            type="time"
            value={s.time}
            disabled={readOnly}
            onChange={(e) => onSave({ schedule: { ...s, time: e.target.value } })}
          />
        </label>
        <label className="field">
          Timezone
          <input
            value={s.timezone}
            disabled={readOnly}
            onChange={(e) => onSave({ schedule: { ...s, timezone: e.target.value } })}
          />
        </label>
        <label className="field">
          Event and input snapshot
          <input
            value={s.event}
            disabled={readOnly}
            placeholder="issue.created · approved context revision"
            onChange={(e) => onSave({ schedule: { ...s, event: e.target.value } })}
          />
        </label>
      </div>
      {['Daily', 'Weekly'].includes(s.cadence) && (
        <p>
          Illustrative next occurrences in this browser timezone:{' '}
          {nextOccurrences(s.cadence, s.time)
            .map((x) => new Date(x).toLocaleString())
            .join(' · ')}
          . Confirm timezone with the runtime before activation.
        </p>
      )}
      <button
        className="button"
        disabled={readOnly}
        onClick={() => onSave({ schedule: { ...s, enabled: !s.enabled } })}
      >
        {s.enabled ? 'Pause future simulated triggers' : 'Enable simulated schedule'}
      </button>
      <p className="muted">
        This does not start a background job. Pausing this schedule does not cancel an existing
        rehearsal; use its separate Cancel action.
      </p>
    </section>
  );
}
function TeamGraph({
  record: r,
  records,
  readOnly,
  onSave,
  onOpen,
}: {
  record: CompanyRecord;
  records: CompanyRecord[];
  readOnly: boolean;
  onSave: (p: Partial<CompanyMeta>) => void;
  onOpen: (r: CompanyRecord) => void;
}) {
  const [graphError, setGraphError] = useState('');
  const m = recordMeta(r);
  const graph = m.graph || [
    {
      id: 'lead',
      name: r.values.lead || 'Team lead',
      role: r.values.goal || 'Coordinate the outcome',
      parent: '',
      dependsOn: '',
      model: 'Project default',
      tools: 'None',
      x: 0,
      y: 0,
    },
  ];
  const saveGraph = (next: NonNullable<typeof m.graph>) => {
    const error = validateTeamGraph(next);
    setGraphError(error);
    if (!error) onSave({ graph: next });
  };
  return (
    <section className="panel">
      <h3>This team’s communication & delegation graph</h3>
      <p className="muted">
        Management parent and execution dependency are separate. Changing either edits this team’s
        draft behavior. Canvas position is presentation only.
      </p>
      {graphError && (
        <div className="notice error" role="alert">
          {graphError}
        </div>
      )}
      <div
        className="company-graph-canvas"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (readOnly) return;
          const id = e.dataTransfer.getData('text/plain');
          const bounds = e.currentTarget.getBoundingClientRect();
          saveGraph(
            graph.map((n) =>
              n.id === id
                ? {
                    ...n,
                    x: Math.max(0, Math.min(bounds.width - 150, e.clientX - bounds.left)),
                    y: Math.max(0, Math.min(240, e.clientY - bounds.top)),
                  }
                : n,
            ),
          );
        }}
      >
        <svg aria-hidden="true">
          {graph.flatMap((n) =>
            [
              ['parent', n.parent],
              ['dependsOn', n.dependsOn],
            ].map(([type, id]) => {
              const parent = graph.find((x) => x.id === id);
              return parent ? (
                <line
                  key={n.id + type}
                  x1={(parent.x || 0) + 65}
                  y1={(parent.y || 0) + 25}
                  x2={(n.x || 0) + 65}
                  y2={(n.y || 0) + 25}
                  stroke={type === 'parent' ? 'var(--accent)' : 'var(--muted)'}
                  strokeDasharray={type === 'parent' ? undefined : '5 5'}
                />
              ) : null;
            }),
          )}
        </svg>
        {graph.map((n, i) => (
          <button
            type="button"
            className="company-graph-node"
            key={n.id}
            draggable={!readOnly}
            style={{ left: n.x, top: n.y }}
            onDragStart={(e) => e.dataTransfer.setData('text/plain', n.id)}
            onKeyDown={(e) => {
              const delta: Record<string, [number, number]> = {
                ArrowLeft: [-10, 0],
                ArrowRight: [10, 0],
                ArrowUp: [0, -10],
                ArrowDown: [0, 10],
              };
              if (delta[e.key] && !readOnly) {
                e.preventDefault();
                const [x, y] = delta[e.key];
                saveGraph(
                  graph.map((v) =>
                    v.id === n.id
                      ? { ...v, x: Math.max(0, (v.x || 0) + x), y: Math.max(0, (v.y || 0) + y) }
                      : v,
                  ),
                );
              }
            }}
          >
            {n.name}
            <small>Drag or use arrow keys</small>
          </button>
        ))}
      </div>
      <p className="muted">Solid: management · Dashed: execution dependency</p>
      <div className="company-team-node-grid">
        {graph.map((n) => (
          <article className="panel" key={n.id}>
            <label className="field">
              Bot name
              <input
                disabled={readOnly}
                value={n.name}
                onChange={(e) =>
                  onSave({
                    graph: graph.map((x) => (x.id === n.id ? { ...x, name: e.target.value } : x)),
                  })
                }
              />
            </label>
            <label className="field">
              Reports to
              <select
                disabled={readOnly || n.id === 'lead'}
                value={n.parent}
                onChange={(e) =>
                  saveGraph(
                    graph.map((x) => (x.id === n.id ? { ...x, parent: e.target.value } : x)),
                  )
                }
              >
                <option value="">Human owner</option>
                {graph
                  .filter((x) => x.id !== n.id)
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="field">
              Runs after
              <select
                disabled={readOnly}
                value={n.dependsOn}
                onChange={(e) =>
                  saveGraph(
                    graph.map((x) => (x.id === n.id ? { ...x, dependsOn: e.target.value } : x)),
                  )
                }
              >
                <option value="">No execution dependency</option>
                {graph
                  .filter((x) => x.id !== n.id)
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="field">
              Tools / permission reference
              <input
                disabled={readOnly}
                value={n.tools}
                onChange={(e) =>
                  onSave({
                    graph: graph.map((x) => (x.id === n.id ? { ...x, tools: e.target.value } : x)),
                  })
                }
              />
            </label>
          </article>
        ))}
      </div>
      <button
        className="button"
        disabled={readOnly}
        onClick={() =>
          onSave({
            graph: [
              ...graph,
              {
                id: crypto.randomUUID(),
                name: 'New specialist',
                role: 'Bounded task',
                parent: 'lead',
                dependsOn: '',
                model: 'Project default',
                tools: 'None',
                x: graph.length * 150,
                y: 60,
              },
            ],
          })
        }
      >
        Add specialist to this team
      </button>
      <h4>Child proposals & results</h4>
      {records
        .filter(
          (x) =>
            x.feature === 'AGENT-N4' &&
            (x.sourceId === r.id || recordMeta(x).links.some((l) => l.id === r.id)),
        )
        .map((x) => (
          <button key={x.id} className="company-activity" onClick={() => onOpen(x)}>
            {x.title} · {x.stage} →
          </button>
        ))}
    </section>
  );
}
