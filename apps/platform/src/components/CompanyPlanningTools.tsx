import { useState } from 'react';
import type { Project } from '../lib/model';
import { makeCompanyRecord, type CompanyRecord } from '../lib/company-features';
import {
  recordMeta,
  hasApproval,
  sprintReadiness,
  reportingCycle,
  type Actor,
} from '../lib/company-workflows';
function list<T>(v: string | undefined, fallback: T[] = []): T[] {
  try {
    const x = JSON.parse(v || '[]');
    return Array.isArray(x) ? x : fallback;
  } catch {
    return fallback;
  }
}
type Props = {
  record: CompanyRecord;
  records: CompanyRecord[];
  projects: Project[];
  actor: Actor;
  readOnly: boolean;
  onSave: (r: CompanyRecord) => void;
  onOpen: (r: CompanyRecord) => void;
  onContinue: () => void;
};
export function CompanyPlanningTools({
  record: r,
  records,
  projects,
  actor,
  readOnly,
  onSave,
  onOpen,
  onContinue,
}: Props) {
  const [error, setError] = useState(''),
    [draft, setDraft] = useState(''),
    [chosen, setChosen] = useState(''),
    [preview, setPreview] = useState(false),
    [scenario, setScenario] = useState(''),
    [amount, setAmount] = useState(''),
    [assumptions, setAssumptions] = useState('');
  const patch = (v: Record<string, string>) => onSave({ ...r, values: { ...r.values, ...v } });
  const button = (label: string, action: () => void, disabled = false) => (
    <button
      className="button"
      disabled={readOnly || disabled}
      onClick={() => {
        setError('');
        try {
          action();
        } catch (e) {
          setError(e instanceof Error ? e.message : String(e));
        }
      }}
    >
      {label}
    </button>
  );
  const meta = recordMeta(r);
  const collection = r.values.projectIds
    ? list<string>(r.values.projectIds)
    : r.projectId
      ? [r.projectId]
      : [];
  const directory = records.filter((x) => x.feature === 'PEOPLE-N1' && !x.archived);
  const scopes = meta.links
    .map((l) => records.find((x) => x.id === l.id))
    .filter((x): x is CompanyRecord => !!x && x.feature === 'PLAN-N1');
  const widgets = list<{ id: string; metric: string; type: string; revision: number }>(
    r.values.dashboardLayout,
  );
  const scenarios = list<{ name: string; forecast: number; assumptions: string }>(
    r.values.scenarios,
  );
  return (
    <div className="company-domain-tools">
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {r.feature === 'ORG-N2' && (
        <section className="panel">
          <h3>Product / program structure</h3>
          <label className="field">
            Portfolio entity
            <select
              value={r.values.entityKind || 'Product'}
              disabled={readOnly}
              onChange={(e) => patch({ entityKind: e.target.value })}
            >
              <option>Product</option>
              <option>Program</option>
            </select>
          </label>
          <label className="field">
            Parent program
            <select
              value={r.values.programId || ''}
              disabled={readOnly}
              onChange={(e) => {
                const id = e.target.value;
                let current = records.find((x) => x.id === id);
                const seen = new Set([r.id]);
                while (current) {
                  if (seen.has(current.id)) {
                    setError('A program cannot contain its own ancestor.');
                    return;
                  }
                  seen.add(current.id);
                  current = records.find((x) => x.id === current?.values.programId);
                }
                patch({ programId: id });
              }}
            >
              <option value="">Independent portfolio item</option>
              {records
                .filter(
                  (x) =>
                    x.feature === 'ORG-N2' && x.values.entityKind === 'Program' && x.id !== r.id,
                )
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.title}
                  </option>
                ))}
            </select>
          </label>
          <h4>Projects in this {r.values.entityKind?.toLowerCase() || 'product'}</h4>
          <div className="company-check-grid">
            {projects.map((p) => (
              <label key={p.id}>
                <input
                  type="checkbox"
                  disabled={readOnly}
                  checked={collection.includes(p.id)}
                  onChange={(e) =>
                    patch({
                      projectIds: JSON.stringify(
                        e.target.checked
                          ? [...collection, p.id]
                          : collection.filter((id) => id !== p.id),
                      ),
                    })
                  }
                />
                {p.title} · {p.stage}
              </label>
            ))}
          </div>
          <div className="company-stats">
            <div className="panel">
              <span>Connected projects</span>
              <strong>{collection.length}</strong>
            </div>
            <div className="panel">
              <span>Blocked linked work</span>
              <strong>
                {
                  records.filter(
                    (x) =>
                      collection.includes(x.projectId) &&
                      x.feature === 'PLAN-N1' &&
                      x.values.blocker,
                  ).length
                }
              </strong>
            </div>
            <div className="panel">
              <span>Open work</span>
              <strong>
                {
                  records.filter(
                    (x) =>
                      collection.includes(x.projectId) &&
                      x.feature === 'PLAN-N1' &&
                      x.stage !== 'Done',
                  ).length
                }
              </strong>
            </div>
          </div>
          <h4>Child products and dependencies</h4>
          {records
            .filter((x) => x.values.programId === r.id || meta.links.some((l) => l.id === x.id))
            .map((x) => (
              <button className="company-activity" key={x.id} onClick={() => onOpen(x)}>
                {x.title} · {x.stage} · {x.owner}
              </button>
            ))}
        </section>
      )}
      {r.feature === 'PLAN-N1' && (
        <section className="panel">
          <h3>Sprint lifecycle</h3>
          {r.values.kind !== 'Sprint' ? (
            <>
              <p>
                Create a separate sprint record, then attach stories, epics or bugs from Linked
                work. Scope changes remain inspectable.
              </p>
              <input
                aria-label="New sprint name"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Sprint 02 — activation"
              />
              {button(
                'Create sprint',
                () => {
                  const sprint = makeCompanyRecord(
                    'PLAN-N1',
                    draft,
                    actor.name,
                    {
                      kind: 'Sprint',
                      sprint: draft,
                      sprintState: 'Planned',
                      acceptance: 'Define a sprint goal and reviewed scope before starting.',
                      capacity: '0',
                    },
                    r.projectId,
                  );
                  onSave(sprint);
                  onOpen(sprint);
                },
                !draft.trim(),
              )}
            </>
          ) : (
            <>
              <div className="status">{r.values.sprintState || 'Planned'}</div>
              <div className="grid-two">
                <label className="field">
                  Sprint starts
                  <input
                    type="date"
                    disabled={readOnly}
                    value={r.values.start || ''}
                    onChange={(e) => patch({ start: e.target.value })}
                  />
                </label>
                <label className="field">
                  Sprint ends
                  <input
                    type="date"
                    disabled={readOnly}
                    value={r.values.end || ''}
                    onChange={(e) => patch({ end: e.target.value })}
                  />
                </label>
              </div>
              <p>
                {scopes.length} linked items ·{' '}
                {scopes.reduce((n, x) => n + (Number(x.values.estimate) || 0), 0)} planned points /{' '}
                {r.values.capacity || '0'} capacity.
              </p>
              <div className="row">
                {button('Start reviewed sprint', () => {
                  if ((r.values.sprintState || 'Planned') !== 'Planned')
                    throw new Error('Only a planned sprint can start.');
                  const issue = sprintReadiness(r, scopes);
                  if (issue) throw new Error(issue);
                  patch({
                    sprintState: 'Active',
                    scopeSnapshot: JSON.stringify(
                      scopes.map((x) => ({
                        id: x.id,
                        revision: recordMeta(x).revision,
                        estimate: x.values.estimate,
                      })),
                    ),
                  });
                })}
                {button('Preview closing sprint', () => {
                  if (r.values.sprintState !== 'Active')
                    throw new Error('Start the sprint before closing it.');
                  setPreview(true);
                })}
              </div>
              <label className="field">
                Retrospective and carry-over decision
                <textarea
                  disabled={readOnly}
                  value={r.values.retrospective || ''}
                  onChange={(e) => patch({ retrospective: e.target.value })}
                />
              </label>
              {preview && (
                <div className="notice">
                  <p>
                    {scopes.filter((x) => x.stage === 'Done').length} done ·{' '}
                    {scopes.filter((x) => x.stage !== 'Done').length} carry over. Open work remains
                    intact.
                  </p>
                  {button('Close and preserve carry-over', () => {
                    if (!r.values.retrospective?.trim())
                      throw new Error('Record the retrospective and carry-over decision.');
                    patch({
                      sprintState: 'Closed',
                      closedAt: new Date().toISOString(),
                      carryOver: JSON.stringify(
                        scopes.filter((x) => x.stage !== 'Done').map((x) => x.id),
                      ),
                    });
                    setPreview(false);
                  })}
                </div>
              )}
            </>
          )}
        </section>
      )}
      {r.feature === 'PEOPLE-N1' && (
        <section className="panel">
          <h3>Directory hierarchy</h3>
          <label className="field">
            Manager record
            <select
              disabled={readOnly}
              value={r.values.managerId || ''}
              onChange={(e) => {
                if (reportingCycle(directory, r.id, e.target.value)) {
                  setError('This manager would create a reporting cycle.');
                  return;
                }
                patch({
                  managerId: e.target.value,
                  manager: directory.find((x) => x.id === e.target.value)?.title || '',
                });
              }}
            >
              <option value="">No manager / company lead</option>
              {directory
                .filter((x) => x.id !== r.id)
                .map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.title} · {x.values.team}
                  </option>
                ))}
            </select>
          </label>
          <input
            aria-label="Directory skills filter"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Find a team or skill"
          />
          {directory
            .filter((x) =>
              (x.title + ' ' + x.values.team + ' ' + x.values.skills)
                .toLowerCase()
                .includes(draft.toLowerCase()),
            )
            .map((x) => (
              <button key={x.id} className="company-activity" onClick={() => onOpen(x)}>
                <span>
                  <strong>{x.title}</strong>
                  <small>
                    {x.values.role} · {x.values.skills}
                  </small>
                </span>
                <span>
                  Reports to{' '}
                  {directory.find((p) => p.id === x.values.managerId)?.title || 'Company lead'}
                  <small>{x.values.team}</small>
                </span>
              </button>
            ))}
          <p className="muted">
            This directory does not grant membership or expose fields beyond the current company
            prototype’s access policy.
          </p>
        </section>
      )}
      {r.feature === 'FIN-N5' && (
        <section className="panel">
          <h3>Forecast scenarios</h3>
          <p>
            Compare hypotheses in {r.values.currency || 'USD'} for{' '}
            {r.values.period || 'the selected period'}. Entered scenarios are forecasts, not bills.
          </p>
          <div className="grid-two">
            <label className="field">
              Scenario name
              <input value={scenario} onChange={(e) => setScenario(e.target.value)} />
            </label>
            <label className="field">
              Forecast spend
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
          </div>
          <label className="field">
            Assumptions
            <textarea value={assumptions} onChange={(e) => setAssumptions(e.target.value)} />
          </label>
          {button(
            'Add comparison scenario',
            () => {
              if (!Number.isFinite(Number(amount)) || Number(amount) < 0)
                throw new Error('Enter a nonnegative forecast.');
              patch({
                scenarios: JSON.stringify([
                  ...scenarios,
                  { name: scenario, forecast: Number(amount), assumptions },
                ]),
              });
              setScenario('');
              setAmount('');
            },
            !scenario.trim() || !amount,
          )}
          {scenarios.map((s, i) => (
            <div className="company-scenario" key={i}>
              <strong>{s.name}</strong>
              <div className="company-meter">
                <span
                  style={{
                    width: `${(s.forecast / Math.max(1, ...scenarios.map((x) => x.forecast))) * 100}%`,
                  }}
                />
              </div>
              <p>
                {s.forecast.toFixed(2)} {r.values.currency} · vs plan{' '}
                {(s.forecast - (Number(r.values.plan) || 0)).toFixed(2)}
              </p>
              <p className="muted">{s.assumptions}</p>
              {button('Use as reviewed draft forecast', () =>
                patch({
                  forecast: String(s.forecast),
                  variance: s.assumptions,
                  selectedScenario: s.name,
                }),
              )}
              {button('Remove scenario', () =>
                patch({ scenarios: JSON.stringify(scenarios.filter((_, n) => n !== i)) }),
              )}
            </div>
          ))}
        </section>
      )}
      {r.feature === 'BI-N3' && (
        <section className="panel">
          <h3>Arrange this dashboard</h3>
          <p>
            Choose shared metric definitions, then arrange widgets. Each widget keeps its definition
            version and source.
          </p>
          <select
            aria-label="Dashboard metric"
            value={chosen}
            onChange={(e) => setChosen(e.target.value)}
          >
            <option value="">Choose a shared metric</option>
            {records
              .filter((x) => x.feature === 'BI-N1')
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.title}
                </option>
              ))}
          </select>
          {button(
            'Add metric widget',
            () => {
              const metric = records.find((x) => x.id === chosen)!;
              patch({
                dashboardLayout: JSON.stringify([
                  ...widgets,
                  {
                    id: crypto.randomUUID(),
                    metric: chosen,
                    type: 'Metric',
                    revision: recordMeta(metric).revision,
                  },
                ]),
              });
            },
            !chosen,
          )}
          <div className="company-dashboard-layout">
            {widgets.map((w, i) => {
              const metric = records.find((x) => x.id === w.metric);
              return (
                <article
                  className="panel"
                  key={w.id}
                  draggable={!readOnly}
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', w.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (readOnly) return;
                    const from = widgets.findIndex(
                      (x) => x.id === e.dataTransfer.getData('text/plain'),
                    );
                    if (from < 0) return;
                    const next = [...widgets];
                    next.splice(i, 0, next.splice(from, 1)[0]);
                    patch({ dashboardLayout: JSON.stringify(next) });
                  }}
                >
                  <button className="company-link" onClick={() => metric && onOpen(metric)}>
                    {metric?.title || 'Missing permitted definition'}
                  </button>
                  <strong className="company-metric-value">
                    {metric?.values.current || 'Unknown'} {metric?.values.unit}
                  </strong>
                  <small>
                    Definition v{w.revision} · {metric?.values.source || 'No source'}
                  </small>
                  <select
                    aria-label={'Widget presentation ' + i}
                    disabled={readOnly}
                    value={w.type}
                    onChange={(e) =>
                      patch({
                        dashboardLayout: JSON.stringify(
                          widgets.map((x) => (x.id === w.id ? { ...x, type: e.target.value } : x)),
                        ),
                      })
                    }
                  >
                    <option>Metric</option>
                    <option>Progress</option>
                  </select>
                  {w.type === 'Progress' && (
                    <div className="company-meter">
                      <span
                        style={{
                          width: `${Math.min(100, ((Number(metric?.values.current) || 0) / Math.max(1, Number(metric?.values.target) || 0)) * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                  <div className="row">
                    {button(
                      'Move earlier',
                      () => {
                        const next = [...widgets];
                        [next[i - 1], next[i]] = [next[i], next[i - 1]];
                        patch({ dashboardLayout: JSON.stringify(next) });
                      },
                      i === 0,
                    )}
                    {button('Remove', () =>
                      patch({
                        dashboardLayout: JSON.stringify(widgets.filter((x) => x.id !== w.id)),
                      }),
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
      {r.feature === 'ORG-N4' && (
        <section className="panel">
          <h3>Blueprint dependency and adoption preview</h3>
          <p>
            Instances are independent snapshots. Updating this blueprint never silently changes an
            existing project.
          </p>
          <button className="button" onClick={() => setPreview(!preview)}>
            Preview instance and dependencies
          </button>
          {preview && (
            <>
              <dl className="company-review-grid">
                {['design', 'agents', 'models', 'connections', 'overrides'].map((k) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{r.values[k] || 'Not declared'}</dd>
                  </div>
                ))}
              </dl>
              <p>
                Blueprint revision {meta.revision} ·{' '}
                {hasApproval(r) ? 'Approved' : 'Needs current revision approval'}
              </p>
              <div className="notice">
                Connection references require authorization in the new project. Secrets and customer
                datasets are not copied.
              </div>
              {button('Create independent approved instance', onContinue, !hasApproval(r))}
            </>
          )}
          <h4>Existing instances — explicit upgrade proposal</h4>
          {projects
            .filter((p) => (p.workflow?.blueprint as { id?: string } | undefined)?.id === r.id)
            .map((p) => {
              const origin = p.workflow?.blueprint as {
                revision?: number;
                values?: Record<string, string>;
              };
              return (
                <details key={p.id}>
                  <summary>
                    {p.title} · pinned blueprint revision {origin.revision}
                  </summary>
                  <div className="grid-two">
                    <pre>{JSON.stringify(origin.values, null, 2)}</pre>
                    <pre>{JSON.stringify(r.values, null, 2)}</pre>
                  </div>
                  <p>
                    Upgrade is opt-in. Create a reviewed migration task; do not overwrite the
                    working project.
                  </p>
                  {button('Create explicit upgrade review task', () =>
                    onSave({
                      ...makeCompanyRecord(
                        'PLAN-N1',
                        'Review blueprint upgrade for ' + p.title,
                        actor.name,
                        {
                          kind: 'Task',
                          acceptance: `Compare blueprint ${r.id} from revision ${origin.revision} to ${meta.revision}. Preserve approved local overrides. Revalidate design, agents, model policy and connections.`,
                          source: r.id,
                        },
                        p.id,
                      ),
                      sourceId: r.id,
                    }),
                  )}
                </details>
              );
            })}
        </section>
      )}
    </div>
  );
}
