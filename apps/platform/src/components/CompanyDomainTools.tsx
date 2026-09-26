import { useState } from 'react';
import { makeCompanyRecord, type CompanyRecord } from '../lib/company-features';
import { recordMeta, parseImport, hasApproval, type Actor } from '../lib/company-workflows';
type Props = {
  record: CompanyRecord;
  records: CompanyRecord[];
  actor: Actor;
  readOnly: boolean;
  onSave: (r: CompanyRecord) => void;
  onOpen: (r: CompanyRecord) => void;
};
export function CompanyDomainTools({ record: r, records, actor, readOnly, onSave, onOpen }: Props) {
  const [text, setText] = useState(''),
    [preview, setPreview] = useState<Record<string, string>[] | null>(null),
    [error, setError] = useState(''),
    [selected, setSelected] = useState(''),
    [choice, setChoice] = useState('Architect'),
    [result, setResult] = useState('');
  const m = recordMeta(r);
  const patch = (v: Record<string, string>) => onSave({ ...r, values: { ...r.values, ...v } });
  const link = (id: string, relation: string) =>
    onSave({
      ...r,
      meta: { ...m, links: [...m.links.filter((l) => l.id !== id), { id, relation }] },
    });
  const safe = (fn: () => void) => {
    try {
      setError('');
      fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
  const accounts = records.filter((x) => x.feature === 'CRM-N1' && !x.archived);
  const work = records.filter(
    (x) => x.feature === 'PLAN-N1' && !x.archived && (!r.projectId || x.projectId === r.projectId),
  );
  const measures = records.filter((x) => x.feature === 'BI-N1' && !x.archived);
  const approvals = records.filter((x) => hasApproval(x) && !x.archived);
  const selector = (items: CompanyRecord[], label = 'Related record') => (
    <label className="field">
      {label}
      <select value={selected} onChange={(e) => setSelected(e.target.value)}>
        <option value="">Choose a record</option>
        {items.map((x) => (
          <option key={x.id} value={x.id}>
            {x.feature} · {x.title} · {x.stage}
          </option>
        ))}
      </select>
    </label>
  );
  const button = (label: string, fn: () => void, disabled = false) => (
    <button className="button" disabled={readOnly || disabled} onClick={() => safe(fn)}>
      {label}
    </button>
  );
  return (
    <div className="company-domain-tools">
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {['ORG-N2', 'PLAN-N1', 'PLAN-N5', 'PEOPLE-N3'].includes(r.feature) && (
        <section className="panel">
          <h3>
            {r.feature === 'ORG-N2'
              ? 'Program dependencies & delivery health'
              : r.feature === 'PEOPLE-N3'
                ? 'Match capacity to actual work'
                : 'Sprint scope & dependency impact'}
          </h3>
          <p className="muted">
            Connect real work items and inspect their state before committing. A text sprint name
            alone is not a capacity plan.
          </p>
          {selector(work, 'Add work to this scope')}
          {button(
            'Attach work item',
            () => link(selected, r.feature === 'ORG-N2' ? 'Product / program work' : 'Scope item'),
            !selected,
          )}
          {work
            .filter((x) => m.links.some((l) => l.id === x.id))
            .map((x) => (
              <button key={x.id} className="company-analysis-row" onClick={() => onOpen(x)}>
                <span>
                  {x.title}
                  <small>
                    {x.owner} · {x.values.sprint || 'No sprint'} ·{' '}
                    {x.values.blocker || 'No recorded blocker'}
                  </small>
                </span>
                <strong>{x.stage}</strong>
                <span>{x.values.estimate || '0'} points</span>
              </button>
            ))}
          <p>
            Linked estimate:{' '}
            {work
              .filter((x) => m.links.some((l) => l.id === x.id))
              .reduce((n, x) => n + (Number(x.values.estimate) || 0), 0)}{' '}
            points. Capacity: {r.values.capacity || 'unset'}{' '}
            {r.feature === 'PEOPLE-N3' ? 'hours — do not compare directly with points' : 'points'}.
          </p>
          <label className="field">
            Scope goal / change rationale
            <textarea
              value={r.values.scopeGoal || ''}
              disabled={readOnly}
              onChange={(e) => patch({ scopeGoal: e.target.value })}
            />
          </label>
          {r.feature === 'PLAN-N1' && (
            <>
              {selector(
                work.filter((x) => x.values.kind === 'Epic' && x.id !== r.id),
                'Parent epic',
              )}
              {button('Assign to epic', () => link(selected, 'Parent epic'), !selected)}
            </>
          )}
        </section>
      )}
      {r.feature === 'PLAN-N4' && (
        <section className="panel">
          <h3>Compare alternatives before deciding</h3>
          <p className="muted">
            Use one line per alternative: name | benefit | cost | evidence. Discussion and
            one-vote-per-member controls remain linked to the idea.
          </p>
          <textarea
            rows={4}
            aria-label="Decision alternatives"
            value={r.values.alternative || ''}
            disabled={readOnly}
            onChange={(e) => patch({ alternative: e.target.value })}
          />
          <div className="company-card-grid">
            {(r.values.alternative || '')
              .split('\n')
              .filter(Boolean)
              .map((line, i) => (
                <article className="panel" key={i}>
                  {line.split('|').map((v, n) => (
                    <p key={n}>{v}</p>
                  ))}
                </article>
              ))}
          </div>
          <label className="field">
            Decided option and reason
            <textarea
              value={r.values.decisionRationale || ''}
              disabled={readOnly}
              onChange={(e) => patch({ decisionRationale: e.target.value })}
            />
          </label>
        </section>
      )}
      {r.feature === 'CRM-N2' && (
        <section className="panel">
          <h3>Import, validate and qualify leads</h3>
          <p className="muted">
            Plain CSV: title,email,company,owner,source. Preview duplicates before saving. No
            outreach is sent.
          </p>
          <textarea
            aria-label="Lead CSV"
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="title,email,company,owner,source"
          />
          {button('Validate import preview', () => setPreview(parseImport(text)), !text.trim())}
          {preview && (
            <>
              <table className="company-table">
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Owner</th>
                    <th>Identity check</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((x, i) => (
                    <tr key={i}>
                      <td>{x.title}</td>
                      <td>{x.owner || 'Unassigned — needs review'}</td>
                      <td>
                        {records.some((a) => x.email && a.values.email === x.email)
                          ? 'Existing email — skip'
                          : 'New record'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {button('Save eligible leads', () => {
                for (const x of preview) {
                  if (records.some((a) => x.email && a.values.email === x.email)) continue;
                  onSave(
                    makeCompanyRecord(
                      'CRM-N2',
                      x.title,
                      x.owner || actor.name,
                      {
                        email: x.email || '',
                        company: x.company || '',
                        source: x.source || 'Import',
                        need: x.owner
                          ? 'Review qualification evidence'
                          : 'Exception: assign an accountable owner',
                        contact: 'Unknown — review',
                      },
                      r.projectId,
                    ),
                  );
                }
                setPreview(null);
                setResult(
                  'Eligible leads saved. Existing identities were skipped; missing assignment remains explicit.',
                );
              })}
            </>
          )}
          <label className="field">
            Qualification evidence and next action
            <textarea
              value={r.values.need || ''}
              disabled={readOnly}
              onChange={(e) => patch({ need: e.target.value })}
            />
          </label>
        </section>
      )}
      {['CRM-N1', 'CX-N1', 'CX-N4'].includes(r.feature) && (
        <section className="panel">
          <h3>Account timeline & linked evidence</h3>
          {(r.feature === 'CRM-N1'
            ? records.filter((x) => x.values.accountId === r.id)
            : records.filter((x) => x.values.accountId && x.values.accountId === r.values.accountId)
          ).map((x) => (
            <button className="company-activity" key={x.id} onClick={() => onOpen(x)}>
              {x.title} · {x.feature} · {x.stage}
            </button>
          ))}
          {r.feature === 'CX-N4' && (
            <>
              <label className="field">
                Signal observation / freshness
                <textarea
                  value={r.values.signals || ''}
                  disabled={readOnly}
                  onChange={(e) => patch({ signals: e.target.value })}
                  placeholder="Signal, observed date, source, limitations"
                />
              </label>
              <p>
                No fresh evidence means insufficient evidence, not healthy. Renewal evidence and
                actual customer acceptance remain separate.
              </p>
            </>
          )}
        </section>
      )}
      {['CRM-N4', 'CX-N5', 'MKT-N4', 'BI-N5'].includes(r.feature) && (
        <section className="panel">
          <h3>Review the intended audience and content</h3>
          {selector(accounts, 'Permitted recipient account')}
          {button(
            'Attach recipient context',
            () => {
              const a = accounts.find((x) => x.id === selected)!;
              if (a.values.preference === 'Do not contact')
                throw new Error('This account is marked Do not contact. Keep an internal draft.');
              patch({
                accountId: a.id,
                recipient: a.values.email || a.values.contact || a.title,
                contactPreference: a.values.preference || 'Needs review',
              });
            },
            !selected,
          )}
          <div className="notice">
            <strong>Recipient:</strong> {r.values.recipient || r.values.audience || 'Not selected'}
            <br />
            <strong>Authorization:</strong>{' '}
            {r.values.contactPreference || r.values.authorization || 'Needs review'}
            <br />
            <strong>Draft:</strong>
            <p>{r.values.message || r.values.content || 'No message content yet'}</p>
          </div>
          <label className="field">
            External result / failure evidence
            <input
              disabled={readOnly}
              value={r.values.external || r.values.outcome || ''}
              onChange={(e) => patch({ external: e.target.value, outcome: e.target.value })}
            />
          </label>
          {r.feature === 'MKT-N4' && (
            <>
              {selector(
                approvals.filter((x) => x.feature === 'MKT-N2'),
                'Approved content revision',
              )}
              {button(
                'Use approved content',
                () => {
                  const a = approvals.find((x) => x.id === selected)!;
                  patch({
                    asset: a.id,
                    assetRevision: String(recordMeta(a).revision),
                    content: a.values.content || '',
                    approval: 'true',
                    approver: recordMeta(a).review?.decidedBy?.name || '',
                  });
                },
                !selected,
              )}
            </>
          )}
        </section>
      )}
      {['FIN-N2', 'FIN-N3', 'FIN-N4'].includes(r.feature) && (
        <section className="panel">
          <h3>
            {r.feature === 'FIN-N2'
              ? 'Review against an approved budget'
              : 'Compare the originating commercial record'}
          </h3>
          {selector(
            records.filter((x) =>
              r.feature === 'FIN-N2'
                ? x.feature === 'FIN-N1' && x.stage === 'Approved'
                : ['CRM-N5', 'FIN-N2'].includes(x.feature),
            ),
            r.feature === 'FIN-N2' ? 'Approved allocation' : 'Proposal / purchase reference',
          )}
          {selected && records.find((x) => x.id === selected) && (
            <div className="notice">
              {records.find((x) => x.id === selected)!.title} ·{' '}
              {records.find((x) => x.id === selected)!.values.amount || '0'}{' '}
              {records.find((x) => x.id === selected)!.values.currency}. Remaining allocation:{' '}
              {(Number(records.find((x) => x.id === selected)!.values.amount) || 0) -
                (Number(records.find((x) => x.id === selected)!.values.spent) || 0)}
              . Requested: {r.values.amount} {r.values.currency}.
            </div>
          )}
          {button(
            'Confirm comparison link',
            () => {
              const x = records.find((x) => x.id === selected)!;
              if (x.values.currency !== r.values.currency)
                throw new Error(
                  'Currencies differ. Record an explicit conversion basis before matching.',
                );
              onSave({
                ...r,
                values: {
                  ...r.values,
                  match: x.id,
                  budget: r.feature === 'FIN-N2' ? x.id : r.values.budget || '',
                },
                meta: {
                  ...m,
                  links: [
                    ...m.links.filter((l) => l.id !== x.id),
                    {
                      id: x.id,
                      relation: r.feature === 'FIN-N2' ? 'Budget allocation' : 'Commercial source',
                    },
                  ],
                },
              });
            },
            !selected,
          )}
        </section>
      )}
      {['CX-N3', 'PEOPLE-N4', 'BI-N4', 'MKT-N1', 'MKT-N5'].includes(r.feature) && (
        <section className="panel">
          <h3>Reuse the outcome definition</h3>
          {selector(measures, 'Shared metric and revision')}
          {button(
            'Use this metric',
            () => {
              const x = measures.find((x) => x.id === selected)!;
              onSave({
                ...r,
                values: {
                  ...r.values,
                  metric: x.id,
                  metricRevision: String(recordMeta(x).revision),
                  baseline: x.values.current || '',
                  unit: x.values.unit || '',
                },
                meta: {
                  ...m,
                  links: [
                    ...m.links.filter((l) => l.id !== x.id),
                    { id: x.id, relation: 'Measures outcome' },
                  ],
                },
              });
            },
            !selected,
          )}
          {r.values.metric && (
            <button
              className="text-button"
              onClick={() => {
                const x = records.find((x) => x.id === r.values.metric);
                if (x) onOpen(x);
              }}
            >
              Inspect linked definition →
            </button>
          )}
          <label className="field">
            Next checkpoint
            <input
              type="date"
              disabled={readOnly}
              value={r.values.checkpoint || ''}
              onChange={(e) => patch({ checkpoint: e.target.value })}
            />
          </label>
        </section>
      )}
      {r.feature === 'BI-N1' && (
        <section className="panel">
          <h3>Validate a sample calculation</h3>
          <p>
            Use numerator / denominator. This deliberately supports a ratio only; other formulas
            remain documented, not falsely evaluated.
          </p>
          <div className="row">
            <input
              aria-label="Sample numerator"
              type="number"
              value={r.values.numerator || ''}
              onChange={(e) => patch({ numerator: e.target.value })}
              disabled={readOnly}
            />
            <input
              aria-label="Sample denominator"
              type="number"
              value={r.values.denominator || ''}
              onChange={(e) => patch({ denominator: e.target.value })}
              disabled={readOnly}
            />
          </div>
          <p>
            {Number(r.values.denominator)
              ? `Sample ratio: ${Number(r.values.numerator) / Number(r.values.denominator)} (${((Number(r.values.numerator) / Number(r.values.denominator)) * 100).toFixed(2)}%)`
              : 'A nonzero denominator is required; unknown is not zero.'}
          </p>
          <label className="field">
            Alert threshold and owner
            <input
              value={r.values.alert || ''}
              disabled={readOnly}
              onChange={(e) => patch({ alert: e.target.value })}
              placeholder="Below 40% → product owner review"
            />
          </label>
          <div className="notice">
            Definition revision {m.revision}. Link other goals/reports to this definition rather
            than copying it.
          </div>
        </section>
      )}
      {r.feature === 'BI-N2' && (
        <section className="panel">
          <h3>Event schema and quality evidence</h3>
          <p>One property per line: name : type : required/optional.</p>
          <textarea
            aria-label="Event property schema"
            value={r.values.properties || ''}
            disabled={readOnly}
            onChange={(e) => patch({ properties: e.target.value })}
          />
          <div className="row">
            {button('Rehearse schema validation', () => {
              const lines = (r.values.properties || '').split('\n').filter(Boolean);
              setResult(
                lines.length && lines.every((l) => l.split(':').length >= 2)
                  ? 'Schema shape valid in this rehearsal. Collection/duplicates must still be verified against a real event source.'
                  : 'Missing or malformed properties — keep source unverified.',
              );
            })}
            {button('Create instrumentation task', () =>
              onSave({
                ...makeCompanyRecord(
                  'PLAN-N1',
                  'Instrument ' + r.values.event,
                  r.owner,
                  {
                    kind: 'Task',
                    acceptance: `Event ${r.values.event}\n${r.values.properties}\nVerify completeness and duplicates.`,
                    source: r.id,
                  },
                  r.projectId,
                ),
                sourceId: r.id,
              }),
            )}
          </div>
        </section>
      )}
      {r.feature === 'BI-N6' && (
        <section className="panel">
          <h3>Allocation, measures and guardrails</h3>
          <label className="field">
            Control allocation (%)
            <input
              type="number"
              min="0"
              max="100"
              disabled={readOnly}
              value={r.values.control || '50'}
              onChange={(e) => patch({ control: e.target.value })}
            />
          </label>
          <p>
            Variant allocation: {100 - (Number(r.values.control) || 0)}%. This is an exposure plan,
            not a running experiment.
          </p>
          <label className="field">
            Observed sample and uncertainty
            <textarea
              disabled={readOnly}
              value={r.values.result || ''}
              onChange={(e) => patch({ result: e.target.value })}
            />
          </label>
          {button('Check decision readiness', () =>
            setResult(
              r.values.quality === 'Validated externally' && r.values.result?.trim()
                ? 'Evidence supplied; request independent review before a ship decision.'
                : 'Inconclusive: validated data and observed results are required.',
            ),
          )}
        </section>
      )}
      {r.feature === 'DATA-N2' && (
        <section className="panel">
          <h3>Resolve a field conflict deliberately</h3>
          <div className="grid-two">
            <label className="field">
              Architect value
              <textarea
                value={r.values.localValue || ''}
                disabled={readOnly}
                onChange={(e) => patch({ localValue: e.target.value })}
              />
            </label>
            <label className="field">
              External value
              <textarea
                value={r.values.remoteValue || ''}
                disabled={readOnly}
                onChange={(e) => patch({ remoteValue: e.target.value })}
              />
            </label>
          </div>
          <label className="field">
            Field to reconcile
            <input
              value={r.values.conflictField || ''}
              disabled={readOnly}
              onChange={(e) => patch({ conflictField: e.target.value })}
            />
          </label>
          <select
            value={choice}
            onChange={(e) => setChoice(e.target.value)}
            aria-label="Conflict owner"
          >
            <option>Architect</option>
            <option>External</option>
            <option>Ask owner</option>
          </select>
          {button('Save reconciliation preview', () => {
            if (!r.values.conflictField) throw new Error('Name the conflicting field.');
            patch({
              resolutionOwner: choice,
              resolutionPreview:
                choice === 'Ask owner'
                  ? 'Pending owner decision'
                  : choice === 'Architect'
                    ? r.values.localValue || ''
                    : r.values.remoteValue || '',
            });
            setResult('Resolution preview saved. No external field has been changed.');
          })}
        </section>
      )}
      {r.feature === 'OPS-N4' && (
        <section className="panel">
          <h3>Cost evidence, risk and verification</h3>
          <div className="grid-two">
            {[
              ['resource', 'Cloud resource identifier'],
              ['freshness', 'Billing / utilization observed at'],
              ['allocation', 'Tags and shared-cost allocation'],
              ['confidence', 'Savings range / confidence'],
              ['risk', 'Operational risk and dependencies'],
              ['rollback', 'Rollback / recovery plan'],
            ].map(([key, label]) => (
              <label className="field" key={key}>
                {label}
                <input
                  disabled={readOnly}
                  value={r.values[key] || ''}
                  onChange={(e) => patch({ [key]: e.target.value })}
                />
              </label>
            ))}
          </div>
          <p>
            Observed {r.values.amount || 'unknown'} USD/month; estimated saving{' '}
            {r.values.saving || 'unknown'} USD/month. Estimates are not guaranteed and are not added
            to actual spend.
          </p>
        </section>
      )}
      {['MKT-N1', 'MKT-N3', 'CX-N5'].includes(r.feature) && (
        <section className="panel">
          <h3>Release and calendar dependency</h3>
          <div className="company-calendar-card">
            <strong>
              {r.values.start || r.values.date || 'Date not set'} →{' '}
              {r.values.end || r.values.due || 'Target not set'}
            </strong>
            <p>
              {r.values.audience ||
                r.values.positioning ||
                r.values.message ||
                'Define the audience and readiness before announcing availability.'}
            </p>
          </div>
          <label className="field">
            Verified release and readiness evidence
            <textarea
              disabled={readOnly}
              value={r.values.releaseEvidence || ''}
              onChange={(e) => patch({ releaseEvidence: e.target.value })}
            />
          </label>
          <p>
            Publication and customer updates must point to an actually available release; a manually
            selected stage is not proof.
          </p>
        </section>
      )}
      {['AGENT-N1', 'AGENT-N4'].includes(r.feature) && (
        <section className="panel">
          <h3>Deliberation with accountable decisions</h3>
          <label className="field">
            Decision procedure
            <select
              disabled={readOnly}
              value={r.values.procedure || 'Propose and review'}
              onChange={(e) => patch({ procedure: e.target.value })}
            >
              {['Propose and review', 'Lead proposes, human decides', 'Independent critique'].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
          </label>
          {[
            ['proposal', 'Specialist proposal and evidence'],
            ['critique', 'Independent critique / conflicting assumptions'],
            ['resolution', 'Conflict resolution and final rationale'],
          ].map(([key, label]) => (
            <label className="field" key={key}>
              {label}
              <textarea
                disabled={readOnly}
                value={r.values[key] || ''}
                onChange={(e) => patch({ [key]: e.target.value })}
              />
            </label>
          ))}
          <p>
            Bot agreement is not proof. Request review of this revision before producing an
            execution plan.
          </p>
          {r.feature === 'AGENT-N1' &&
            button('Propose bounded child specialist', () => {
              const child = {
                ...makeCompanyRecord(
                  'AGENT-N4',
                  'Specialist for ' + r.title,
                  r.owner,
                  {
                    parent: r.id,
                    template: 'Research specialist',
                    task: r.values.goal || r.title,
                    budget: '0',
                    concurrency: '1',
                    depth: '1',
                    tools: 'Read-only supplied context',
                    retention: 'Retire after reviewed result',
                  },
                  r.projectId,
                ),
                sourceId: r.id,
              };
              onSave(child);
              onOpen(child);
            })}
        </section>
      )}
      {result && (
        <div className="notice" role="status">
          {result}
        </div>
      )}
    </div>
  );
}
