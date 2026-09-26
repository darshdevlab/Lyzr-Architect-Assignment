import { useState } from 'react';
import type { Project } from '../lib/model';
import type { BuilderNavigation } from '../lib/builderState';
import { checkpoint, readDraft, writeDraft } from '../lib/builderState';
import { download } from './Studio';
import { extractHTML } from '../lib/preview';
import ModelExperiment from './ModelExperiment';
import { readOnlyControls } from './ReadOnlyControls';

type Item = {
  id: string;
  title: string;
  body: string;
  status: string;
  kind?: string;
  at?: string;
  image?: string;
};
type Journey = {
  id: string;
  from: string;
  action: string;
  to: string;
  state: string;
  role: string;
};
type State = {
  tokens: { accent: string; background: string; radius: string; type: string };
  components: Item[];
  journeys: Journey[];
  documents: Item[];
  prs: Item[];
  conflicts: Item[];
  evidence: Item[];
  releases: Item[];
  runs: Item[];
  connections: Item[];
  schema: Item[];
  agents: Item[];
  schedules: Item[];
  alerts: Item[];
};
const initial: State = {
  tokens: { accent: '#956148', background: '#f8f6f1', radius: '12', type: 'system-ui' },
  components: [],
  journeys: [],
  documents: [],
  prs: [],
  conflicts: [],
  evidence: [],
  releases: [],
  runs: [],
  connections: [],
  schema: [],
  agents: [],
  schedules: [],
  alerts: [],
};
const id = () => crypto.randomUUID();
export default function FeatureExperiences({
  area,
  project,
  onUpdate,
  onNavigate,
  notify,
  demo = false,
  readOnly = false,
}: {
  readOnly?: boolean;
  demo?: boolean;
  area: string;
  project: Project;
  onUpdate: (patch: Partial<Project>) => void;
  onNavigate: (view: string, context?: BuilderNavigation) => void;
  notify: (text: string) => void;
}) {
  const saved = project.workflow?.experiences as Partial<State> | undefined;
  const state = { ...initial, ...saved, tokens: { ...initial.tokens, ...saved?.tokens } };
  const [title, setTitle] = useState(''),
    [body, setBody] = useState(''),
    [kind, setKind] = useState(''),
    [selected, setSelected] = useState(''),
    [filter, setFilter] = useState('All'),
    [error, setError] = useState(''),
    [from, setFrom] = useState('Sign in'),
    [to, setTo] = useState('Workspace'),
    [action, setAction] = useState('Continue'),
    [role, setRole] = useState('Member'),
    [edgeState, setEdgeState] = useState('Success'),
    [target, setTarget] = useState('Preview'),
    [simulateFailure, setSimulateFailure] = useState(false),
    [localComment, setLocalComment] = useState('');
  const [formDrafts, _setFormDrafts] = useState<Record<string, { title: string; body: string }>>(
    () => {
      try {
        return JSON.parse(readDraft(project.id, 'forms-' + area, '{}'));
      } catch {
        return {};
      }
    },
  );
  const setFormDrafts = (
    fn: (
      d: Record<string, { title: string; body: string }>,
    ) => Record<string, { title: string; body: string }>,
  ) =>
    _setFormDrafts((d) => {
      const next = fn(d);
      writeDraft(project.id, 'forms-' + area, JSON.stringify(next));
      return next;
    });
  const formNames: Record<string, string> = {
    components: 'Component name',
    documents: 'Document title',
    prs: 'Change title',
    evidence: 'Expected behavior / test name',
    connections: 'Connection label',
    schema: 'Table / field name',
    agents: 'Agent name',
    schedules: 'Scheduled task',
    runs: 'Representative task',
    alerts: 'Alert title',
  };
  const loadForm = (key: string, x: Item) => {
    setFormDrafts((d) => ({ ...d, [formNames[key]]: { title: x.title, body: x.body } }));
    setTitle(x.title);
    setBody(x.body);
  };
  const save = (patch: Partial<State>) =>
    onUpdate({ workflow: { ...project.workflow, experiences: { ...state, ...patch } } });
  const add = (key: keyof State, item: Item) => {
    const draft = formDrafts[formNames[key]];
    save({
      [key]: [
        { ...item, ...(draft ? { title: draft.title.trim(), body: draft.body.trim() } : {}) },
        ...(state[key] as Item[]),
      ],
    });
    if (draft) setFormDrafts((d) => ({ ...d, [formNames[key]]: { title: '', body: '' } }));
    setTitle('');
    setBody('');
    setError('');
  };
  const item = (status: string): Item => ({
    id: id(),
    title: title.trim(),
    body: body.trim(),
    status,
    at: new Date().toISOString(),
    kind,
  });
  const required = (key: string) => {
    if (!(formDrafts[formNames[key]]?.title || '').trim()) {
      setError('Give this item a name before continuing.');
      return false;
    }
    return true;
  };
  const update = (key: keyof State, itemId: string, patch: Partial<Item>) =>
    save({ [key]: (state[key] as Item[]).map((x) => (x.id === itemId ? { ...x, ...patch } : x)) });
  const remove = (key: keyof State, itemId: string) =>
    save({ [key]: (state[key] as Item[]).filter((x) => x.id !== itemId) });
  const fields = (name: string, detail: string) => (
    <div className="grid-two">
      <label className="field">
        {name}
        <input
          value={formDrafts[name]?.title || ''}
          onChange={(e) => {
            setTitle(e.target.value);
            setFormDrafts((d) => ({
              ...d,
              [name]: { title: e.target.value, body: d[name]?.body || '' },
            }));
          }}
        />
      </label>
      <label className="field">
        {detail}
        <textarea
          rows={3}
          value={formDrafts[name]?.body || ''}
          onChange={(e) => {
            setBody(e.target.value);
            setFormDrafts((d) => ({
              ...d,
              [name]: { title: d[name]?.title || '', body: e.target.value },
            }));
          }}
        />
      </label>
    </div>
  );
  const list = (key: keyof State, actions: (x: Item) => React.ReactNode) => (
    <div className="experience-list">
      {!(state[key] as Item[]).length ? (
        <p className="muted">No items yet. Create the first one above.</p>
      ) : (
        (state[key] as Item[]).map((x) => (
          <article className="experience-item" key={x.id}>
            <div className="row">
              <strong>{x.title}</strong>
              <span className="status">{x.status}</span>
            </div>
            <p className="preserve-lines">{x.body}</p>
            {x.image && (
              <img
                src={x.image}
                alt={'Evidence for ' + x.title}
                style={{ maxWidth: '100%', maxHeight: 320, objectFit: 'contain' }}
              />
            )}
            {x.kind && <small>{x.kind}</small>}
            <div className="row">
              {actions(x)}
              <button className="text-button" onClick={() => remove(key, x.id)}>
                Remove draft
              </button>
            </div>
          </article>
        ))
      )}
    </div>
  );
  const report = (name: string, data: unknown) =>
    download(
      name,
      JSON.stringify(
        { prototype: true, project: project.id, revision: project.revision, data },
        null,
        2,
      ),
      'application/json',
    );
  return readOnlyControls(
    <section id={`experience-${area}`} className="panel feature-experiences">
      <div className="row">
        <div>
          <span className="eyebrow">WORK THROUGH THE DETAILS</span>
          <h2>
            {
              (
                {
                  studio: 'Design, connected.',
                  plan: 'Knowledge with a place.',
                  code: 'Changes you can review.',
                  agents: 'A team with boundaries.',
                  data: 'Connections with clear states.',
                  qa: 'Evidence before confidence.',
                  release: 'Rehearse the release.',
                  ops: 'Investigate, then improve.',
                  models: 'Compare before choosing.',
                  settings: 'Decisions with an owner.',
                } as Record<string, string>
              )[area]
            }
          </h2>
        </div>
        <span className="status">Interactive project prototype</span>
      </div>
      <p className="muted">
        Decisions and local artifacts persist with this project. External execution, provider checks
        and sample results are labeled demonstrations.
      </p>
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      {area === 'studio' && (
        <>
          <h3>Design system</h3>
          <div className="token-grid">
            {Object.entries(state.tokens).map(([key, value]) => (
              <label className="field" key={key}>
                {key}
                <input
                  type={
                    key === 'accent' || key === 'background'
                      ? 'color'
                      : key === 'radius'
                        ? 'number'
                        : 'text'
                  }
                  min={0}
                  max={40}
                  value={value}
                  onChange={(e) => save({ tokens: { ...state.tokens, [key]: e.target.value } })}
                />
              </label>
            ))}
          </div>
          <div
            className="component-preview"
            style={{
              background: state.tokens.background,
              borderRadius: Math.max(0, Math.min(40, Number(state.tokens.radius) || 0)),
              color: '#252525',
              fontFamily: state.tokens.type,
            }}
          >
            <strong>Preview your visual rules</strong>
            <p>Shared tokens keep each screen part of one system.</p>
            <button className="button" style={{ background: state.tokens.accent, color: '#fff' }}>
              Primary action
            </button>
            <input aria-label="Component preview input" placeholder="Input and focus state" />
          </div>
          <div className="row">
            <button
              className="button primary"
              onClick={() => {
                onUpdate({
                  draft: `Apply this approved design system throughout the application: ${JSON.stringify(state.tokens)}. Preserve behavior and check contrast and responsive states.`,
                });
                onNavigate('studio');
              }}
            >
              Apply through Builder
            </button>
            <button
              className="button"
              onClick={() =>
                download(
                  'design-tokens.css',
                  `:root { --accent: ${state.tokens.accent}; --surface: ${state.tokens.background}; --radius: ${state.tokens.radius}px; --font: ${state.tokens.type}; }`,
                )
              }
            >
              Export tokens
            </button>
          </div>
          <h3>Approved components</h3>
          {fields('Component name', 'Markup / behavior and variants')}
          <button
            className="button"
            onClick={() => {
              if (required('components')) add('components', { ...item('Draft'), kind: 'v1' });
            }}
          >
            Add component
          </button>
          {list('components', (x) => (
            <>
              <button
                className="button"
                onClick={() =>
                  update('components', x.id, {
                    status: x.status === 'Approved' ? 'Draft' : 'Approved',
                  })
                }
              >
                {x.status === 'Approved' ? 'Reopen' : 'Approve version'}
              </button>
              <button
                className="button"
                disabled={x.status !== 'Approved'}
                onClick={() => {
                  onUpdate({
                    draft: `Use approved component ${x.title} ${x.kind}: ${x.body}. Preserve its states and accessibility.`,
                  });
                  onNavigate('studio');
                }}
              >
                Use in Builder
              </button>
              <button
                className="button"
                onClick={() =>
                  update('components', x.id, {
                    kind: `v${Number(x.kind?.slice(1) || 1) + 1}`,
                    status: 'Draft',
                  })
                }
              >
                Create next version
              </button>
              <button
                className="text-button"
                onClick={() => {
                  loadForm('components', x);
                  notify(
                    'Loaded a copy for editing. Save as a new draft to preserve the approved version.',
                  );
                }}
              >
                Edit as draft
              </button>
            </>
          ))}
          <h3>Journey map</h3>
          <div className="workflow-fields">
            {[
              ['Starting screen', from, setFrom],
              ['Action', action, setAction],
              ['Destination', to, setTo],
              ['Role', role, setRole],
            ].map(([label, value, setter]) => (
              <label className="field" key={label as string}>
                {label as string}
                <input
                  value={value as string}
                  onChange={(e) => (setter as (s: string) => void)(e.target.value)}
                />
              </label>
            ))}
            <label className="field">
              State
              <select value={edgeState} onChange={(e) => setEdgeState(e.target.value)}>
                {['Success', 'Loading', 'Empty', 'Error', 'Permission denied'].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
          <button
            className="button"
            onClick={() => {
              if (!from.trim() || !to.trim() || !action.trim()) {
                setError('Start, action and destination are required.');
                return;
              }
              save({
                journeys: [
                  ...state.journeys,
                  { id: id(), from, to, action, state: edgeState, role },
                ],
              });
              setError('');
            }}
          >
            Connect screens
          </button>
          <div className="journey-map" aria-label="Project journey map">
            {state.journeys.map((edge) => (
              <article key={edge.id}>
                <span className="status">
                  {edge.role} · {edge.state}
                </span>
                <div className="journey-edge">
                  <strong>{edge.from}</strong>
                  <span>→ {edge.action} →</span>
                  <strong>{edge.to}</strong>
                </div>
                <button
                  className="button"
                  onClick={() => {
                    onUpdate({
                      draft: `Implement and verify journey: ${edge.role} starts at ${edge.from}, chooses ${edge.action}, reaches ${edge.to}; state: ${edge.state}.`,
                    });
                    onNavigate('studio');
                  }}
                >
                  Preview through Builder
                </button>
                <button
                  className="button"
                  onClick={() => {
                    save({
                      evidence: [
                        {
                          id: id(),
                          title: `${edge.from} → ${edge.to}`,
                          body: `Role: ${edge.role}. Action: ${edge.action}. Expected state: ${edge.state}.`,
                          status: 'Not tested',
                          kind: 'Journey acceptance',
                        },
                        ...state.evidence,
                      ],
                    });
                    onNavigate('qa');
                  }}
                >
                  Send to QA
                </button>
                <button
                  className="text-button"
                  onClick={() => save({ journeys: state.journeys.filter((x) => x.id !== edge.id) })}
                >
                  Remove edge
                </button>
              </article>
            ))}
          </div>
        </>
      )}
      {area === 'plan' && (
        <>
          <h3>Project library</h3>
          {fields('Document title', 'Document content')}
          <label className="field">
            Document kind
            <select value={kind || 'Wiki'} onChange={(e) => setKind(e.target.value)}>
              {[
                'Wiki',
                'Architecture decision',
                'API reference',
                'Setup guide',
                'Runbook',
                'Requirement',
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <button
            className="button"
            onClick={() => {
              if (required('documents'))
                add('documents', { ...item('Draft'), kind: kind || 'Wiki' });
            }}
          >
            Save document
          </button>
          {list('documents', (x) => (
            <>
              <button
                className="button"
                onClick={() => {
                  loadForm('documents', x);
                  setKind(x.kind || 'Wiki');
                  notify(
                    'Document copied to editor. Save creates a new revision alongside the original.',
                  );
                }}
              >
                Edit new revision
              </button>
              <button
                className="button"
                onClick={() => update('documents', x.id, { status: 'Reviewed' })}
              >
                Mark reviewed
              </button>
              <button className="button" onClick={() => download(x.title + '.md', x.body)}>
                Download
              </button>
              <button
                className="button"
                onClick={() => {
                  onUpdate({ draft: `Implement this reviewed document: ${x.title}\n${x.body}` });
                  onNavigate('studio');
                }}
              >
                Continue in Builder
              </button>
            </>
          ))}
          <h3>Requirement trace</h3>
          <div className="trace-strip">
            <span>
              {state.documents.filter((x) => x.kind === 'Requirement').length} requirements
            </span>
            →<span>{state.prs.length} change drafts</span>→
            <span>{state.evidence.length} evidence items</span>→
            <span>{state.releases.length} release rehearsals</span>
          </div>
          <p className="muted">
            All linked objects belong to this project. Open the destination to inspect exact object
            details; no external commit is inferred.
          </p>
          <div className="row">
            <button className="button" onClick={() => onNavigate('code')}>
              Review changes
            </button>
            <button className="button" onClick={() => onNavigate('qa')}>
              Inspect evidence
            </button>
          </div>
        </>
      )}
      {area === 'code' && (
        <>
          <h3>Pull-request review workspace</h3>
          {fields('Change title', 'Proposed change / review description')}
          <button
            className="button primary"
            onClick={() => {
              if (required('prs'))
                add('prs', { ...item('Draft'), kind: `Revision ${project.revision}` });
            }}
          >
            Create local PR draft
          </button>
          {list('prs', (x) => (
            <>
              <button className="button" onClick={() => setSelected(selected === x.id ? '' : x.id)}>
                Inspect diff & discussion
              </button>
              <button
                className="button"
                onClick={() => update('prs', x.id, { status: 'Review requested' })}
              >
                Request review locally
              </button>
              <button
                className="button"
                onClick={() => update('prs', x.id, { status: 'Changes requested' })}
              >
                Request changes
              </button>
              <button
                className="button"
                onClick={() => update('prs', x.id, { status: 'Approved' })}
              >
                Approve draft
              </button>
              <button
                className="button"
                disabled={
                  x.status !== 'Approved' ||
                  state.evidence.some((e) => e.status === 'Failed') ||
                  state.conflicts.some((e) => e.status !== 'Resolved')
                }
                onClick={() => update('prs', x.id, { status: 'Merged locally' })}
              >
                Rehearse merge
              </button>
              {selected === x.id && (
                <div className="experience-detail">
                  <p className="notice">
                    Local comparison: latest saved checkpoint vs current application source. No
                    external Git diff or review is implied.
                  </p>
                  <div className="diff-columns">
                    <pre>{project.history?.at(-1)?.html || 'No previous source checkpoint.'}</pre>
                    <pre>{project.html || 'Build an application to compare source.'}</pre>
                  </div>
                  <label className="field">
                    Review comment
                    <textarea
                      value={localComment}
                      onChange={(e) => setLocalComment(e.target.value)}
                    />
                  </label>
                  <button
                    className="button"
                    disabled={!localComment.trim()}
                    onClick={() => {
                      update('prs', x.id, { body: x.body + '\n\nReview: ' + localComment });
                      setLocalComment('');
                    }}
                  >
                    Add comment
                  </button>
                  <button
                    className="button"
                    onClick={() => {
                      onUpdate({ draft: `Address review of ${x.title}: ${x.body}` });
                      onNavigate('studio');
                    }}
                  >
                    Propose fix in Builder
                  </button>
                  <button
                    className="button"
                    onClick={() => {
                      save({
                        conflicts: [
                          {
                            id: id(),
                            title: 'index.html conflict',
                            body: 'Example remote update conflicts with this local change. Choose a source deliberately.',
                            status: 'Unresolved',
                          },
                          ...state.conflicts,
                        ],
                      });
                      notify('Simulated remote update added. No provider was contacted.');
                    }}
                  >
                    Simulate remote conflict
                  </button>
                </div>
              )}
            </>
          ))}
          <h3>Conflict resolution</h3>
          {list('conflicts', (x) => (
            <>
              <button
                className="button"
                onClick={() =>
                  update('conflicts', x.id, {
                    status: 'Resolved',
                    body: x.body + '\nResolution: keep local artifact.',
                  })
                }
              >
                Keep local
              </button>
              <button
                className="button"
                onClick={() => {
                  setTitle('Resolved source');
                  setBody(project.html || '');
                  notify('Current source copied below for manual resolution.');
                }}
              >
                Edit merged source
              </button>
            </>
          ))}
          <label className="field">
            Resolved HTML
            <textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
          <button
            className="button"
            onClick={() => {
              try {
                const html = extractHTML(body);
                onUpdate({
                  html,
                  built: true,
                  stage: 'Build',
                  reviewed: false,
                  revision: project.revision + 1,
                  history: project.html
                    ? checkpoint(project.history || [], project.html, 'Before conflict resolution')
                    : project.history,
                });
                save({ conflicts: state.conflicts.map((x) => ({ ...x, status: 'Resolved' })) });
                notify('Validated merged source applied locally.');
              } catch (e) {
                setError(String(e));
              }
            }}
          >
            Apply merged source
          </button>
          <h3>Container package</h3>
          <p className="muted">
            Static HTML target includes actual generated source and a Dockerfile. Download both into
            the same folder. Docker validation is performed on your machine.
          </p>
          <div className="row">
            <button
              className="button"
              disabled={!project.html}
              onClick={() => download('index.html', project.html || '', 'text/html')}
            >
              Download application
            </button>
            <button
              className="button"
              disabled={!project.html}
              onClick={() =>
                download(
                  'Dockerfile',
                  'FROM nginx:alpine\nCOPY index.html /usr/share/nginx/html/index.html\nEXPOSE 80\n',
                )
              }
            >
              Download Dockerfile
            </button>
            <button
              className="button"
              onClick={() =>
                download(
                  'CONTAINER-README.md',
                  '# Static app container\n\nPlace index.html and Dockerfile together.\n\n```sh\ndocker build -t architect-app .\ndocker run --rm -p 8080:80 architect-app\n```\n\nOpen http://localhost:8080 and verify your application. This package does not install Architect or include a backend. Runtime validation has not been performed by the prototype.\n',
                )
              }
            >
              Download validation guide
            </button>
          </div>
        </>
      )}
      {area === 'qa' && (
        <>
          <h3>Acceptance cases & evidence</h3>
          {fields(
            'Expected behavior / test name',
            'Steps, observations, logs or screenshot reference',
          )}
          <label className="field">
            Check type
            <select value={kind || 'Functional'} onChange={(e) => setKind(e.target.value)}>
              {[
                'Functional',
                'UI / accessibility',
                'API / integration',
                'Security',
                'Performance',
                'Agent behavior',
                'UAT',
              ].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <button
            className="button"
            onClick={() => {
              if (required('evidence'))
                add('evidence', {
                  ...item('Not tested'),
                  kind: (kind || 'Functional') + ` · revision ${project.revision}`,
                });
            }}
          >
            Add test case
          </button>
          {list('evidence', (x) => (
            <>
              <select
                aria-label={'Evidence status for ' + x.title}
                value={x.status}
                onChange={(e) => update('evidence', x.id, { status: e.target.value })}
              >
                {['Not tested', 'Passed — user reported', 'Failed', 'Flaky', 'Waived by owner'].map(
                  (v) => (
                    <option key={v}>{v}</option>
                  ),
                )}
              </select>
              <button
                className="button"
                onClick={() => {
                  onUpdate({
                    draft: `Investigate QA case ${x.title} (${x.kind}). Evidence: ${x.body}. Status: ${x.status}. Verify before claiming a fix.`,
                  });
                  onNavigate('studio');
                }}
              >
                Repair in Builder
              </button>
              <label className="button">
                Attach evidence screenshot
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 250000 || !/^image\/(png|jpeg|webp)$/.test(f.type)) {
                      setError(
                        'Use a PNG, JPEG or WebP under 250 KB to keep workspace storage within limits.',
                      );
                      return;
                    }
                    const image = await new Promise<string>((resolve, reject) => {
                      const reader = new FileReader();
                      reader.onload = () => resolve(String(reader.result));
                      reader.onerror = reject;
                      reader.readAsDataURL(f);
                    });
                    update('evidence', x.id, { image });
                    e.target.value = '';
                  }}
                />
              </label>
              <button className="button" onClick={() => report('qa-evidence.json', x)}>
                Export evidence
              </button>
            </>
          ))}
          <h3>Release gate</h3>
          <div className="notice">
            {!state.evidence.length
              ? 'Unknown: no acceptance evidence collected.'
              : state.evidence.some((x) => ['Failed', 'Not tested', 'Flaky'].includes(x.status))
                ? 'Blocked: unresolved, untested or flaky cases require attention.'
                : 'User-reported evidence ready for owner review; no automated certification.'}
          </div>
          <button
            className="button"
            disabled={
              !state.evidence.length ||
              state.evidence.some((x) => ['Failed', 'Not tested', 'Flaky'].includes(x.status))
            }
            onClick={() => {
              onUpdate({ reviewed: true, stage: 'Review' });
              onNavigate('release');
            }}
          >
            Record owner review & continue
          </button>
        </>
      )}
      {area === 'release' && (
        <>
          <h3>Deployment rehearsal</h3>
          <div className="grid-two">
            <label className="field">
              Environment
              <select value={target} onChange={(e) => setTarget(e.target.value)}>
                {['Preview', 'Staging', 'Production'].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="field">
              Release notes
              <textarea value={body} onChange={(e) => setBody(e.target.value)} />
            </label>
          </div>
          <label className="toggle-field">
            <input
              type="checkbox"
              checked={simulateFailure}
              onChange={(e) => setSimulateFailure(e.target.checked)}
            />
            Rehearse a failed health check
          </label>
          <p className="muted">
            Production rehearsal requires recorded owner review and no unresolved failed cases. This
            does not publish an app.
          </p>
          <button
            className="button primary"
            disabled={
              !project.built ||
              (target === 'Production' &&
                (!project.reviewed ||
                  state.evidence.some((x) => ['Failed', 'Not tested', 'Flaky'].includes(x.status))))
            }
            onClick={() =>
              add('releases', {
                id: id(),
                title: target + ' · revision ' + project.revision,
                kind: 'Simulated deployment',
                at: new Date().toISOString(),
                status: simulateFailure ? 'Failed health check' : 'Rehearsal complete',
                body: `1. Artifact revision ${project.revision} selected\n2. Configuration reviewed\n3. ${simulateFailure ? 'Health check failed (injected demonstration)' : 'Health check passed (simulated)'}\n4. ${simulateFailure ? 'Previous release retained' : 'Ready to inspect local preview'}\nNotes: ${body}`,
              })
            }
          >
            Rehearse deployment
          </button>
          {list('releases', (x) => (
            <>
              <button className="button" onClick={() => report('release-log.json', x)}>
                Download run log
              </button>
              <button className="button" onClick={() => onNavigate('studio')}>
                Inspect app preview
              </button>
              {x.status === 'Failed health check' && (
                <button
                  className="button"
                  onClick={() =>
                    update('releases', x.id, {
                      status: 'Rehearsal complete',
                      body: x.body + '\nRetry: simulated successful health check.',
                    })
                  }
                >
                  Retry rehearsal
                </button>
              )}
              <button
                className="button"
                onClick={() =>
                  update('releases', x.id, {
                    status: 'Rolled back — simulated',
                    body:
                      x.body +
                      '\nRollback rehearsed. Database/schema migration compatibility still requires review.',
                  })
                }
              >
                Rehearse rollback
              </button>
            </>
          ))}
          <div className="notice">
            No public application URL is created by a rehearsal. Export your source/container or
            connect a deployment provider outside this prototype.
          </div>
        </>
      )}
      {area === 'data' && (
        <>
          <h3>Connector lifecycle</h3>
          <label className="field">
            Service
            <select value={kind || 'GitHub'} onChange={(e) => setKind(e.target.value)}>
              {['GitHub', 'Notion', 'Supabase', 'OpenRouter', 'MCP server', 'Plugin'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          {fields('Connection label', 'Allowed resource references / permission scope')}
          <button
            className="button"
            onClick={() => {
              if (required('connections'))
                add('connections', { ...item('Not authorized'), kind: kind || 'GitHub' });
            }}
          >
            Add connection draft
          </button>
          {list('connections', (x) => (
            <>
              <button
                className="button"
                onClick={() => update('connections', x.id, { status: 'Healthy — simulated' })}
              >
                Simulate healthy check
              </button>
              <button
                className="button"
                onClick={() => update('connections', x.id, { status: 'Expired — simulated' })}
              >
                Simulate expiration
              </button>
              <button
                className="button"
                onClick={() =>
                  update('connections', x.id, { status: 'Reconnect requested — draft' })
                }
              >
                Reconnect
              </button>
              <button
                className="button"
                onClick={() =>
                  update('connections', x.id, {
                    status: 'Revoked locally',
                    body: x.body + '\nDraft access removed. No provider authorization was changed.',
                  })
                }
              >
                Revoke draft
              </button>
            </>
          ))}
          <h3>Schema review</h3>
          {fields('Table / field name', 'Type, access rule and sample value')}
          <button
            className="button"
            onClick={() => {
              if (required('schema')) add('schema', item('Proposed'));
            }}
          >
            Propose field
          </button>
          {list('schema', (x) => (
            <>
              <button
                className="button"
                onClick={() => update('schema', x.id, { status: 'Approved locally' })}
              >
                Approve proposal
              </button>
              <button
                className="button"
                onClick={() => report('schema-proposal.json', state.schema)}
              >
                Export migration proposal
              </button>
            </>
          ))}
        </>
      )}
      {area === 'agents' && (
        <>
          <h3>Agent lifecycle register</h3>
          {fields('Agent name', 'Instructions and expected behavior')}
          <button
            className="button"
            onClick={() => {
              if (required('agents')) add('agents', { ...item('Draft'), kind: 'v1' });
            }}
          >
            Create agent definition
          </button>
          {list('agents', (x) => (
            <>
              <button
                className="button"
                onClick={() => update('agents', x.id, { status: 'Test candidate' })}
              >
                Prepare test candidate
              </button>
              <button
                className="button"
                onClick={() => {
                  save({
                    evidence: [
                      {
                        id: id(),
                        title: x.title + ' behavior',
                        body: x.body,
                        status: 'Not tested',
                        kind: 'Agent behavior · ' + x.kind,
                      },
                      ...state.evidence,
                    ],
                  });
                  onNavigate('qa');
                }}
              >
                Evaluate this agent
              </button>
              <button
                className="button"
                onClick={() => update('agents', x.id, { status: 'Approved definition' })}
              >
                Approve definition
              </button>
              <button className="button" onClick={() => report('agent-definition.json', x)}>
                Export version
              </button>
            </>
          ))}
          <h3>Schedules</h3>
          {fields('Scheduled task', 'Frequency, timezone and approved task boundary')}
          <button
            className="button"
            onClick={() => {
              if (required('schedules')) add('schedules', item('Paused'));
            }}
          >
            Create paused schedule
          </button>
          {list('schedules', (x) => (
            <>
              <button
                className="button"
                onClick={() =>
                  update('schedules', x.id, {
                    status: x.status === 'Paused' ? 'Enabled — prototype' : 'Paused',
                  })
                }
              >
                {x.status === 'Paused' ? 'Enable prototype' : 'Pause'}
              </button>
              <button
                className="button"
                disabled={x.status === 'Paused'}
                onClick={() => {
                  save({
                    runs: [
                      {
                        id: id(),
                        title: x.title,
                        status: 'Simulated',
                        body: 'Scheduled task rehearsed with approval checkpoint. No background task executed.',
                        kind: 'Agent schedule',
                        at: new Date().toISOString(),
                      },
                      ...state.runs,
                    ],
                  });
                  onNavigate('ops');
                }}
              >
                Rehearse next run
              </button>
            </>
          ))}
        </>
      )}
      {area === 'models' && (
        <>
          <ModelExperiment project={project} demo={demo} onUpdate={onUpdate} />
          <h3>Comparison notebook</h3>
          {fields('Representative task', 'Candidate model IDs, rubric and expected outcome')}
          <button
            className="button"
            onClick={() => {
              if (required('runs'))
                add('runs', { ...item('Experiment draft'), kind: 'Model comparison' });
            }}
          >
            Save experiment
          </button>
          {list('runs', (x) => (
            <>
              <button
                className="button"
                onClick={() => {
                  onUpdate({
                    draft: `Run this representative task: ${x.title}\n${x.body}. State the chosen model; do not invent comparison scores.`,
                  });
                  onNavigate('studio', { panel: 'models' });
                }}
              >
                Run in Builder
              </button>
              <button className="button" onClick={() => report('model-experiment.json', x)}>
                Export experiment
              </button>
            </>
          ))}
          <p className="muted">
            Choose a model in Builder for each actual run. Record observed outputs before adopting a
            routing policy; no synthetic score is presented as a benchmark.
          </p>
        </>
      )}
      {area === 'ops' && (
        <>
          <h3>Run ledger</h3>
          <label className="field">
            Filter source
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {['All', 'Actual AI responses', 'Local rehearsals'].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <div className="experience-list">
            {filter !== 'Local rehearsals' &&
              project.messages
                .filter((m) => m.role === 'assistant')
                .map((m) => (
                  <details className="experience-item" key={m.id}>
                    <summary>{new Date(m.time).toLocaleString()} · Builder response</summary>
                    <p className="preserve-lines">{m.text}</p>
                    <p className="muted">
                      Source: recorded response. Only metrics explicitly included in this response
                      are known; missing cost is unknown, not zero.
                    </p>
                    <button className="button" onClick={() => report('builder-run.json', m)}>
                      Export record
                    </button>
                  </details>
                ))}
            {filter !== 'Actual AI responses' &&
              [...state.runs, ...state.releases].map((x) => (
                <details className="experience-item" key={x.id}>
                  <summary>
                    {x.title} · {x.status}
                  </summary>
                  <p>{x.body}</p>
                  <span>{x.kind}</span>
                </details>
              ))}
          </div>
          <h3>Alert & incident rehearsal</h3>
          {fields('Alert title', 'Signal, affected users and recovery steps')}
          <button
            className="button"
            onClick={() => {
              if (required('alerts')) add('alerts', item('Open — simulated'));
            }}
          >
            Create sample incident
          </button>
          {list('alerts', (x) => (
            <>
              <button
                className="button"
                onClick={() => update('alerts', x.id, { status: 'Acknowledged' })}
              >
                Acknowledge
              </button>
              <button
                className="button"
                onClick={() => update('alerts', x.id, { status: 'Resolved — simulated' })}
              >
                Rehearse recovery
              </button>
              <button
                className="button"
                onClick={() => {
                  onUpdate({ draft: `Investigate incident ${x.title}: ${x.body}` });
                  onNavigate('studio');
                }}
              >
                Create repair prompt
              </button>
            </>
          ))}
        </>
      )}
      {area === 'settings' && (
        <>
          <h3>Project decision queue</h3>
          {(
            (project.workflow?.records as {
              id: string;
              values: Record<string, string>;
              at: string;
              revision: number;
            }[]) || []
          )
            .filter((x) => ['ORG-N3', 'PLAN-E4', 'QA-E4', 'RELEASE-N3'].includes(x.id))
            .map((x, i) => (
              <details className="experience-item" key={x.at + i}>
                <summary>
                  {x.id} · revision {x.revision} ·{' '}
                  {x.values.decision || x.values.status || 'Review record'}
                </summary>
                <dl>
                  {Object.entries(x.values).map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <button className="button" onClick={() => onNavigate('plan')}>
                  Open project evidence
                </button>
              </details>
            ))}
          <p className="muted">
            Approvals recorded through the decision workflow update this project’s Reviewed state.
            Editing source or documents clears that approval.
          </p>
        </>
      )}
    </section>,
    readOnly,
  );
}
