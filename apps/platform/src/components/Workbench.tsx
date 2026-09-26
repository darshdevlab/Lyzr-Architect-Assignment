import { useEffect, useMemo, useState, useRef } from 'react';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Code2,
  FileText,
  GitBranch,
  Layers,
  Plus,
  Search,
  ShieldCheck,
  Play,
  Download,
  Activity,
  Clock,
  Settings2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { Project, Bot } from '../lib/model';
import Bots from './Bots';
import { generate } from '../lib/cloud';
import './workbench.css';
import './builder-enhancements.css';
import {
  readDraft,
  writeDraft,
  clearDraft,
  checkpoint,
  workflowPrompt,
  type BuilderNavigation,
} from '../lib/builderState';
import { extractHTML } from '../lib/preview';
import FeatureExperiences from './FeatureExperiences';
import { readOnlyControls } from './ReadOnlyControls';
import { Modal } from './UI';
import {
  workflows,
  recipes,
  getDefaults,
  validateWorkflow,
  workflowKey,
  type Workflow,
  advancedSections,
  advancedDefaults,
  validateAdvanced,
  validateFlowImport,
  flowNodeTypes,
  flowTemplates,
  type AdvancedSection,
} from '../lib/workflows';

type Props = {
  readOnly?: boolean;
  demo?: boolean;
  area: string;
  project: Project | null;
  onUpdate: (patch: Partial<Project>) => void;
  navigationContext?: BuilderNavigation;
  onNavigate: (view: string, context?: BuilderNavigation) => void;
  notify: (s: string) => void;
};
type RecordEntry = { id: string; values: Record<string, string>; at: string; revision: number };
type Entity = { id: string; name: string; detail: string; status: string };
type Board = {
  advanced: Record<string, Record<string, string>>;
  bots: Bot[];
  flowHistory: Bot[][];
  flowFuture: Bot[][];
  records: RecordEntry[];
  services: Entity[];
  agents: Entity[];
  sources: Entity[];
  members: Entity[];
  checks: string[];
  qaRun: number;
  qaRevision: number;
  qaChecks: string[];
  qaStatus: 'idle' | 'complete';
  qaScope?: string;
  releaseStage: string;
  environment: string;
  code: string;
  branch: string;
  notes: string;
  logs: string[];
  docVersions: { prd: string; trd: string; revision: number }[];
  modelMode: string;
  agentPositions: Record<string, { x: number; y: number }>;
};
const seed = (): Board => ({
  advanced: {},
  bots: [
    {
      id: 'lead',
      name: 'Application lead',
      role: 'Coordinate approved project tasks',
      x: 270,
      y: 35,
      parent: null,
    },
  ],
  flowHistory: [],
  flowFuture: [],
  records: [],
  services: [],
  agents: [],
  sources: [],
  members: [],
  checks: ['Functional', 'UI / accessibility', 'API / integration'],
  qaRun: 0,
  qaRevision: 0,
  qaChecks: [],
  qaStatus: 'idle',
  releaseStage: 'Not deployed',
  environment: 'Preview',
  code: '// This is a local editable source draft.\n// Generated application source is available in Build Studio.\n\nexport function greet(name = "world") {\n  return `Hello, ${name}`;\n}\n',
  branch: 'feature/first-release',
  notes: '',
  logs: [],
  docVersions: [],
  modelMode: 'Smart routing',
  agentPositions: {},
});
function normalizeBoard(raw: unknown): Board {
  const base = seed();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  const r = raw as Record<string, unknown>;
  const out = { ...base };
  for (const key of [
    'releaseStage',
    'environment',
    'code',
    'branch',
    'notes',
    'modelMode',
    'qaScope',
  ] as const)
    if (typeof r[key] === 'string') out[key] = r[key] as string;
  for (const key of ['qaRun', 'qaRevision'] as const)
    if (typeof r[key] === 'number' && Number.isFinite(r[key])) out[key] = r[key] as number;
  out.qaStatus = r.qaStatus === 'complete' ? 'complete' : 'idle';
  for (const key of ['checks', 'qaChecks', 'logs'] as const)
    if (Array.isArray(r[key]))
      out[key] = (r[key] as unknown[])
        .filter((x): x is string => typeof x === 'string')
        .slice(0, 200);
  for (const key of ['services', 'agents', 'sources', 'members'] as const)
    if (Array.isArray(r[key]))
      out[key] = (r[key] as Entity[])
        .filter(
          (x) =>
            x &&
            typeof x.id === 'string' &&
            typeof x.name === 'string' &&
            typeof x.detail === 'string' &&
            typeof x.status === 'string',
        )
        .slice(0, 200);
  if (Array.isArray(r.records))
    out.records = (r.records as RecordEntry[])
      .filter(
        (x) =>
          x &&
          typeof x.id === 'string' &&
          typeof x.at === 'string' &&
          typeof x.revision === 'number' &&
          x.values &&
          typeof x.values === 'object' &&
          Object.values(x.values).every((v) => typeof v === 'string'),
      )
      .slice(0, 300);
  if (r.advanced && typeof r.advanced === 'object' && !Array.isArray(r.advanced))
    out.advanced = Object.fromEntries(
      Object.entries(r.advanced).filter(
        ([, v]) =>
          v &&
          typeof v === 'object' &&
          !Array.isArray(v) &&
          Object.values(v).every((x) => typeof x === 'string'),
      ),
    ) as Board['advanced'];
  if (Array.isArray(r.bots) && !validateFlowImport(r.bots).length) out.bots = r.bots;
  for (const key of ['flowHistory', 'flowFuture'] as const)
    if (Array.isArray(r[key]))
      out[key] = (r[key] as unknown[])
        .filter((x): x is Bot[] => !validateFlowImport(x).length)
        .slice(-30);
  if (Array.isArray(r.docVersions))
    out.docVersions = (r.docVersions as Board['docVersions'])
      .filter(
        (x) =>
          x &&
          typeof x.prd === 'string' &&
          typeof x.trd === 'string' &&
          typeof x.revision === 'number',
      )
      .slice(0, 12);
  return out;
}
function readBoard(project: Project | null, demo: boolean): Board {
  if (project?.workflow) return normalizeBoard(project.workflow);
  if (!demo || !project) return seed();
  try {
    return normalizeBoard(JSON.parse(localStorage.getItem(workflowKey(project.id)) || 'null'));
  } catch {
    return seed();
  }
}

function download(name: string, content: string, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
const areaInfo: Record<string, { title: string; subtitle: string; number: string }> = {
  studio: {
    title: 'Design the journey. Keep the intent.',
    subtitle:
      'Decide how screens, components and visual rules work together before refining the application.',
    number: '02',
  },
  plan: {
    title: 'A clear plan. A better build.',
    subtitle: 'Turn an intention into shared, reviewable decisions.',
    number: '01',
  },
  code: {
    title: 'Every change, understood.',
    subtitle: 'Source, repositories and services in one project context.',
    number: '03',
  },
  agents: {
    title: 'Small specialists. Shared purpose.',
    subtitle: 'Design app agents, their boundaries and their handoffs.',
    number: '04',
  },
  models: {
    title: 'The right mind for the task.',
    subtitle: 'Choose models deliberately. Keep capability, cost and control visible.',
    number: '05',
  },
  data: {
    title: 'Context with a foundation.',
    subtitle: 'Shape your data, connect tools and ground every generation.',
    number: '06',
  },
  qa: {
    title: 'Confidence is built here.',
    subtitle: 'Independent checks, clear evidence and a path back to repair.',
    number: '07',
  },
  release: {
    title: 'Make the next move safely.',
    subtitle: 'Review the artifact, its environment and the way back.',
    number: '08',
  },
  ops: {
    title: 'See what happens next.',
    subtitle: 'Understand runs, investigate cost and close the improvement loop.',
    number: '09',
  },
  settings: {
    title: 'A workspace on your terms.',
    subtitle: 'People, permissions, decisions and spending preferences.',
    number: '10',
  },
};
const uid = () => crypto.randomUUID();

export function Workbench({
  demo = false,
  area,
  project,
  onUpdate: writeProject,
  onNavigate,
  notify,
  navigationContext,
  readOnly = false,
}: Props) {
  const onUpdate = (patch: Partial<Project>) => {
    if (readOnly) {
      notify('Viewer access: changes are disabled.');
      return;
    }
    writeProject(patch);
  };
  const [board, setBoard] = useState<Board>(() => readBoard(project, demo));
  const boardRef = useRef(board);
  boardRef.current = board;
  const [active, setActive] = useState<Workflow | null>(null),
    [search, setSearch] = useState(''),
    [initialValues, setInitialValues] = useState<Record<string, string>>({});
  const [tab, setTab] = useState('Overview');
  const [aiBusy, setAiBusy] = useState(false),
    [aiResult, setAiResult] = useState(''),
    [aiError, setAiError] = useState('');
  const aiAbort = useRef<AbortController | null>(null);
  useEffect(() => () => aiAbort.current?.abort(), []);
  const runAI = async (kind: 'plan' | 'review') => {
    if (readOnly) {
      notify('Viewer access cannot run AI.');
      return;
    }
    if (!project) return;
    setAiError('');
    setAiBusy(true);
    const controller = new AbortController();
    aiAbort.current = controller;
    try {
      if (demo) {
        if (kind === 'plan') {
          const text = `# ${project.title} — ${doc === 'prd' ? 'Product requirements' : 'Technical design'}\n\n## Demo draft\n${project.brief}\n\n## Decisions to make\nDefine users, main actions, acceptance criteria, authentication and persistence.\n\n## Verification\nTest the primary journey, keyboard access, empty states and error recovery.\n\nThis is an authored demonstration draft; no model was called.`;
          doc === 'prd' ? setPrd(text) : setTrd(text);
        } else
          setAiResult(
            'Demo review: verify keyboard navigation, input validation, data ownership and error recovery. This authored example is not an AI analysis of your source.',
          );
        return;
      }
      const prompt =
        kind === 'plan'
          ? `Draft only the ${doc === 'prd' ? 'product requirements document' : 'technical requirements document'} for this project in clear Markdown. Base it on the project brief, identify assumptions, define acceptance tests. Do not claim integrations are already implemented.`
          : 'Review the provided application HTML source against the requirements. Return actionable findings with severity, code evidence, reproduction suggestions and limitations. This is static AI review, not executed browser testing. Never fabricate test pass results.';
      const result = await generate(
        {
          prompt,
          mode: kind === 'plan' ? 'plan' : 'chat',
          model:
            project.agentModels?.[kind === 'plan' ? 'planner' : 'reviewer'] ||
            project.model ||
            'auto',
          context: JSON.stringify({
            title: project.title,
            brief: project.brief,
            prd,
            trd,
            html: kind === 'review' ? project.html : undefined,
          }),
        },
        controller.signal,
      );
      if (kind === 'plan') {
        doc === 'prd' ? setPrd(result.text) : setTrd(result.text);
        notify('AI draft ready for your review. Save documents to apply it.');
      } else
        setAiResult(
          `AI source review · ${result.model || 'selected model'} · revision ${project.revision}\n\n${result.text}\n\nStatic AI feedback only. No browser, security scanner or runtime tests executed.`,
        );
    } catch (e) {
      if (!controller.signal.aborted)
        setAiError(
          e instanceof Error ? e.message : 'Generation failed. Your existing work is preserved.',
        );
    } finally {
      setAiBusy(false);
    }
  };
  const [prd, _setPrd] = useState(() => readDraft(project?.id || '', 'prd', project?.prd || '')),
    [trd, _setTrd] = useState(() => readDraft(project?.id || '', 'trd', project?.trd || ''));
  const setPrd = (value: string) => {
    _setPrd(value);
    if (project) writeDraft(project.id, 'prd', value);
  };
  const setTrd = (value: string) => {
    _setTrd(value);
    if (project) writeDraft(project.id, 'trd', value);
  };
  const [doc, setDoc] = useState<'prd' | 'trd'>('prd');
  const [sourceFile, setSourceFile] = useState<'app' | 'scratch'>('app'),
    [appCode, _setAppCode] = useState(() =>
      readDraft(project?.id || '', 'html', project?.html || ''),
    );
  const setAppCode = (value: string) => {
    _setAppCode(value);
    if (project) writeDraft(project.id, 'html', value);
  };
  useEffect(
    () => _setAppCode(readDraft(project?.id || '', 'html', project?.html || '')),
    [project?.id, project?.html],
  );
  const [inputValue, setInputValue] = useState(''),
    [detail, setDetail] = useState(''),
    [role, setRole] = useState(area === 'qa' ? board.qaScope || 'Builder' : 'Builder');
  const [running, setRunning] = useState(false),
    [consoleLine, setConsoleLine] = useState('npm run build');
  const runTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (runTimer.current) clearTimeout(runTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (runTimer.current) clearTimeout(runTimer.current);
    setRunning(false);
    setSelectedRun(false);
  }, [project?.id, area]);
  const [selectedRun, setSelectedRun] = useState(false),
    [diff, setDiff] = useState(false);
  useEffect(() => {
    setBoard(readBoard(project, demo));
  }, [project?.workflow]);
  useEffect(() => {
    setBoard(readBoard(project, demo));
    _setPrd(readDraft(project?.id || '', 'prd', project?.prd || ''));
    _setTrd(readDraft(project?.id || '', 'trd', project?.trd || ''));
    setActive(null);
    setInputValue('');
    setDetail('');
  }, [project?.id]);
  useEffect(() => {
    setTab('Overview');
    setSearch('');
    setInputValue('');
    setDetail('');
  }, [area]);
  useEffect(() => {
    _setPrd(readDraft(project?.id || '', 'prd', project?.prd || ''));
    _setTrd(readDraft(project?.id || '', 'trd', project?.trd || ''));
  }, [project?.prd, project?.trd]);
  const persist = (patch: Partial<Board>) => {
    if (readOnly) {
      notify('Viewer access: changes are disabled.');
      return;
    }
    const next = { ...boardRef.current, ...patch };
    boardRef.current = next;
    setBoard(next);
    if (project)
      onUpdate({
        workflow: { ...project.workflow, ...next } as unknown as Record<string, unknown>,
      });
    if (demo && project) {
      try {
        localStorage.setItem(workflowKey(project.id), JSON.stringify(next));
      } catch {
        notify('Browser storage is full. Export this project before closing.');
      }
    }
  };
  const list = useMemo(
    () =>
      workflows.filter(
        (f) =>
          f.area === area &&
          (f.title + ' ' + f.id + ' ' + f.scope).toLowerCase().includes(search.toLowerCase()),
      ),
    [area, search],
  );
  const info = areaInfo[area] || areaInfo.plan;
  const open = (id: string, values: Record<string, string> = {}) => {
    const found = workflows.find((f) => f.id === id);
    if (found) {
      setInitialValues(values);
      setActive(found);
    }
  };
  useEffect(() => {
    if (navigationContext?.tab)
      setTab(
        ['Overview', 'All workflows', 'Activity', ...(area === 'agents' ? ['Canvas'] : [])].find(
          (t) => t.toLowerCase() === navigationContext.tab?.toLowerCase(),
        ) || 'Overview',
      );
    if (navigationContext?.document) setDoc(navigationContext.document);
    if (navigationContext?.featureId) open(navigationContext.featureId);
  }, [navigationContext]);
  const handoff = (view: string, context: BuilderNavigation = { tab: 'Overview' }) => {
    if (view === area || (view === 'buildflows' && area === 'studio')) {
      setTab(context.tab || 'Overview');
      if (context.document) setDoc(context.document);
      if (context.featureId) open(context.featureId);
    }
    notify(
      `Continuing ${project?.title || 'this workspace'} in ${view === 'studio' ? 'Build Studio' : view}.`,
    );
    onNavigate(view, context);
  };
  const addEntity = (key: 'services' | 'agents' | 'sources' | 'members', status: string) => {
    if (!inputValue.trim()) {
      notify('Enter a name before adding.');
      return;
    }
    const entity = { id: uid(), name: inputValue.trim(), detail: detail.trim() || role, status };
    persist({ [key]: [...board[key], entity] });
    setInputValue('');
    setDetail('');
    notify('Saved with this project’s prototype configuration.');
  };
  const saveDocs = () => {
    if (!project) return;
    persist({
      docVersions: [
        { prd: project.prd, trd: project.trd, revision: project.revision },
        ...board.docVersions,
      ].slice(0, 12),
    });
    clearDraft(project.id, 'prd');
    clearDraft(project.id, 'trd');
    onUpdate({ prd, trd, revision: project.revision + 1, reviewed: false });
    notify('Specification saved. Review approval cleared for the new revision.');
  };
  const exportContext = () => {
    download(
      `${project?.title || 'project'}-context.json`,
      JSON.stringify(
        {
          format: 'architect-context-v1',
          project,
          workflows: board,
          secrets: 'Excluded. No credential values are collected by workflow forms.',
        },
        null,
        2,
      ),
      'application/json',
    );
    notify('Context package downloaded with docs, workflow decisions and dependencies.');
  };
  const simulateQA = () => {
    if (!project?.built) {
      notify('Build an application in Studio first.');
      return;
    }
    if (!board.checks.length) {
      notify('Select at least one test suite.');
      return;
    }
    setRunning(true);
    runTimer.current = setTimeout(() => {
      persist({
        qaRun: board.qaRun + 1,
        qaRevision: project.revision,
        qaChecks: [...board.checks],
        qaScope: role === 'Builder' ? 'Full stack' : role,
        qaStatus: 'complete',
        logs: [
          `Demo QA run ${board.qaRun + 1}: ${board.checks.join(', ')} · revision ${project.revision}`,
          ...board.logs,
        ],
      });
      setRunning(false);
      setSelectedRun(true);
      notify('Demonstration report ready. These are sample results, not executed browser tests.');
    }, 1000);
  };
  const entities = (key: 'services' | 'agents' | 'sources' | 'members', empty: string) => (
    <div className="entity-list">
      {board[key].length ? (
        board[key].map((e) => (
          <div className="setting-row" key={e.id}>
            <div>
              <strong>{e.name}</strong>
              <p className="muted">{e.detail}</p>
              <span className="status">{e.status}</span>
            </div>
            <button
              className="icon-button"
              aria-label={`Remove ${e.name}`}
              onClick={() => {
                persist({ [key]: board[key].filter((x) => x.id !== e.id) });
                notify('Removed from this local configuration. No external resource was deleted.');
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))
      ) : (
        <div className="empty-small">
          <p className="muted">{empty}</p>
        </div>
      )}
    </div>
  );
  if (!project)
    return (
      <section className="panel empty">
        <Layers size={30} />
        <h2>Give this work a project.</h2>
        <p>Plans, source, agents and release evidence stay connected to the same application.</p>
        <button className="button primary" onClick={() => onNavigate('projects')}>
          Choose or create a project <ArrowRight size={16} />
        </button>
      </section>
    );
  return readOnlyControls(
    <div className="workbench" data-area={area}>
      <header className="page-title">
        <div>
          <div className="eyebrow">
            WORKSPACE / {info.number} · {area === 'qa' ? 'QUALITY' : area.toUpperCase()}
          </div>
          <h1>{info.title}</h1>
          <p>{info.subtitle}</p>
        </div>
        <button className="button" onClick={exportContext}>
          <Download size={15} /> Export context
        </button>
      </header>
      <div className="project-context row">
        <span className="status">{project?.title || 'Workspace settings'}</span>
        <span className="muted">
          {project
            ? `Revision ${project.revision} · context stays with you`
            : 'Account controls are available from your profile menu'}
        </span>
      </div>
      <div className="segmented workbench-tabs" role="tablist" aria-label={`${area} workspace`}>
        {(area === 'agents'
          ? ['Overview', 'Canvas', 'All workflows', 'Activity']
          : ['Overview', 'All workflows', 'Activity']
        ).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
            {t}
            {t === 'All workflows' && <span className="tab-count">{list.length}</span>}
          </button>
        ))}
      </div>
      {aiError && (
        <div className="notice error" role="alert">
          {aiError}
          <button className="text-button" onClick={() => setAiError('')}>
            Dismiss
          </button>
        </div>
      )}
      {aiBusy && (
        <div className="notice">
          Preparing a draft for your review…{' '}
          <button className="text-button" onClick={() => aiAbort.current?.abort()}>
            Stop
          </button>
        </div>
      )}
      {aiResult && area === 'qa' && (
        <section className="panel">
          <h2>Source review feedback</h2>
          <pre className="ai-feedback">{aiResult}</pre>
          <button
            className="button"
            onClick={() => {
              onUpdate({
                draft: `Address these review findings after checking them against the source: ${aiResult}`,
              });
              handoff('studio');
            }}
          >
            Send findings to Builder
          </button>
          <button className="text-button" onClick={() => setAiResult('')}>
            Close feedback
          </button>
        </section>
      )}
      {tab === 'Canvas' && area === 'agents' && (
        <FlowCanvas board={board} persist={persist} notify={notify} />
      )}
      {tab === 'Overview' && (
        <>
          {area === 'studio' && (
            <section className="panel">
              <h2>From design decisions to the live builder.</h2>
              <p>
                Configure the design system, approved components and screen journeys below. These
                saved workflow plans stay attached to this project.
              </p>
              <button className="button primary" onClick={() => handoff('studio')}>
                Open prompt & preview <ArrowRight size={15} />
              </button>
            </section>
          )}
          {area === 'plan' && (
            <>
              <div className="grid-two">
                <section className="panel">
                  <div className="row">
                    <div>
                      <span className="eyebrow">THE CONTRACT</span>
                      <h2>From intention to implementation</h2>
                    </div>
                    <FileText size={23} />
                  </div>
                  <p className="muted">
                    {project?.brief || 'Add an idea to your project to begin.'}
                  </p>
                  <div className="row">
                    <button className="button" onClick={() => open('PLAN-E2')}>
                      Clarify scope
                    </button>
                    <button className="button" onClick={() => open('PLAN-E3')}>
                      Use a template
                    </button>
                  </div>
                  <div className="notice">
                    Your PRD and TRD are editable. AI-generated assumptions should be reviewed
                    before implementation.
                  </div>
                </section>
                <section className="panel">
                  <span className="eyebrow">CONNECTED DELIVERY</span>
                  <h2>One intention. Every handoff.</h2>
                  <div className="journey-strip">
                    {[
                      ['Requirements', 'plan'],
                      ['Build', 'studio'],
                      ['Evidence', 'qa'],
                      ['Release', 'release'],
                    ].map(([label, view], i) => (
                      <button className="button" key={view} onClick={() => handoff(view)}>
                        <span>{i + 1}</span>
                        {label}
                        <ChevronRight size={13} />
                      </button>
                    ))}
                  </div>
                  <button className="text-button" onClick={() => open('PLAN-N3')}>
                    Link a requirement to release <ArrowRight size={14} />
                  </button>
                </section>
              </div>
              <section className="panel document-panel">
                <div className="row">
                  <div className="segmented">
                    <button aria-pressed={doc === 'prd'} onClick={() => setDoc('prd')}>
                      Product requirements
                    </button>
                    <button aria-pressed={doc === 'trd'} onClick={() => setDoc('trd')}>
                      Technical design
                    </button>
                  </div>
                  <div className="row">
                    <button className="button" onClick={() => setDiff(!diff)}>
                      {diff ? 'Hide history' : 'Version history'}
                    </button>
                    <button className="button" onClick={() => open('PLAN-E4')}>
                      Request review
                    </button>
                  </div>
                </div>
                <label className="field">
                  <span>
                    {doc === 'prd'
                      ? 'Product requirements document'
                      : 'Technical requirements document'}
                  </span>
                  <textarea
                    className="document-editor"
                    rows={15}
                    value={doc === 'prd' ? prd : trd}
                    onChange={(e) =>
                      doc === 'prd' ? setPrd(e.target.value) : setTrd(e.target.value)
                    }
                  />
                </label>
                {diff && (
                  <div className="notice">
                    <strong>Previous versions</strong>
                    {board.docVersions.length ? (
                      board.docVersions.map((v, i) => (
                        <details key={i}>
                          <summary>Revision {v.revision}</summary>
                          <pre>{doc === 'prd' ? v.prd : v.trd}</pre>
                          <button
                            className="button"
                            onClick={() => {
                              setPrd(v.prd);
                              setTrd(v.trd);
                              notify(
                                'Previous document loaded as a draft. Save to create a new revision.',
                              );
                            }}
                          >
                            Restore as draft
                          </button>
                        </details>
                      ))
                    ) : (
                      <p>Your first saved edit creates a previous version.</p>
                    )}
                  </div>
                )}
                <div className="row">
                  <button className="button" disabled={aiBusy} onClick={() => runAI('plan')}>
                    {aiBusy
                      ? 'Drafting…'
                      : demo
                        ? 'Try demo document draft'
                        : 'Generate AI document draft'}
                  </button>
                  <button className="button" onClick={saveDocs}>
                    Save documents
                  </button>
                  <button
                    className="button primary"
                    onClick={() => {
                      saveDocs();
                      handoff('studio');
                    }}
                  >
                    Save & open Builder <ArrowRight size={15} />
                  </button>
                  <button className="text-button" onClick={() => open('PLAN-N2')}>
                    Add wiki / runbook
                  </button>
                </div>
              </section>
            </>
          )}
          {area === 'code' && (
            <>
              <div className="grid-two">
                <section className="panel">
                  <div className="row">
                    <GitBranch size={22} />
                    <h2>Repository & branch</h2>
                    <span className="status">
                      {project?.repo ? 'Reference saved' : 'Not connected'}
                    </span>
                  </div>
                  <p className="muted">
                    {project?.repo ||
                      'Attach a GitHub repository to plan an import. Demo references do not grant GitHub access.'}
                  </p>
                  <label className="field">
                    Working branch
                    <input
                      value={board.branch}
                      onChange={(e) => persist({ branch: e.target.value })}
                    />
                  </label>
                  <div className="row">
                    <button className="button" onClick={() => open('CODE-E1')}>
                      Import repository
                    </button>
                    <button className="button" onClick={() => open('CODE-E2')}>
                      Review sync
                    </button>
                    <button className="button" onClick={() => open('CODE-N2')}>
                      Prepare pull request
                    </button>
                  </div>
                </section>
                <section className="panel">
                  <span className="eyebrow">SERVICE MAP</span>
                  <h2>Several repos. One application.</h2>
                  {entities(
                    'services',
                    'No services attached. Add a frontend, API or worker to map dependencies.',
                  )}
                  <div className="row">
                    <input
                      aria-label="Service name"
                      placeholder="Service name"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                    />
                    <button
                      className="button"
                      onClick={() => addEntity('services', 'Draft · mocks by default')}
                    >
                      <Plus size={15} /> Add service
                    </button>
                  </div>
                  <button className="text-button" onClick={() => open('CODE-N3')}>
                    Pin versions & dependencies
                  </button>
                </section>
              </div>
              <section className="panel">
                <div className="row">
                  <h2>Browser workspace</h2>
                  <span className="status">
                    {sourceFile === 'app' ? 'Application source' : 'Local scratch file'}
                  </span>
                  <button
                    className="button"
                    onClick={() =>
                      download(
                        sourceFile === 'app' ? 'index.html' : 'draft.ts',
                        sourceFile === 'app' ? appCode : board.code,
                      )
                    }
                  >
                    Download source
                  </button>
                </div>
                <p className="muted">
                  Edit your generated application or keep a separate scratch file. Applying source
                  creates a checkpoint and clears the previous review.
                </p>
                <div className="source-layout">
                  <aside className="source-files">
                    <button
                      className="button"
                      aria-pressed={sourceFile === 'app'}
                      onClick={() => setSourceFile('app')}
                    >
                      <Code2 size={14} /> index.html
                    </button>
                    <button
                      className="button"
                      aria-pressed={sourceFile === 'scratch'}
                      onClick={() => setSourceFile('scratch')}
                    >
                      <Code2 size={14} /> draft.ts
                    </button>
                    <button className="text-button" onClick={() => handoff('plan')}>
                      PRD.md
                    </button>
                    <button
                      className="text-button"
                      onClick={() => handoff('plan', { tab: 'Overview', document: 'trd' })}
                    >
                      TRD.md
                    </button>
                    <button className="text-button" onClick={() => open('CODE-E4')}>
                      Environment references
                    </button>
                  </aside>
                  <label className="field">
                    <span>{sourceFile === 'app' ? 'index.html' : 'draft.ts'}</span>
                    <textarea
                      className="code-editor"
                      spellCheck={false}
                      rows={12}
                      value={sourceFile === 'app' ? appCode : board.code}
                      onChange={(e) =>
                        sourceFile === 'app'
                          ? setAppCode(e.target.value)
                          : persist({ code: e.target.value })
                      }
                      placeholder="Build an application in Studio, or write HTML here."
                    />
                  </label>
                </div>
                <div className="terminal">
                  <div className="row">
                    <span>TERMINAL DEMONSTRATION</span>
                    <span className="muted">No arbitrary commands execute</span>
                  </div>
                  <form
                    className="row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      persist({
                        logs: [
                          `$ ${consoleLine}\n[demo] Command received. A connected sandbox is required to execute this command.`,
                          ...board.logs,
                        ],
                      });
                    }}
                  >
                    <span>❯</span>
                    <input
                      aria-label="Demo terminal command"
                      value={consoleLine}
                      onChange={(e) => setConsoleLine(e.target.value)}
                    />
                    <button className="button">Run demo</button>
                  </form>
                  {board.logs.slice(0, 3).map((l, i) => (
                    <pre key={i}>{l}</pre>
                  ))}
                </div>
                <div className="row">
                  {sourceFile === 'app' && (
                    <button
                      className="button primary"
                      onClick={() => {
                        if (!project || !appCode.trim()) {
                          notify('Add application HTML before applying.');
                          return;
                        }
                        try {
                          const html = extractHTML(appCode);
                          clearDraft(project.id, 'html');
                          onUpdate({
                            html,
                            built: true,
                            stage: 'Build',
                            reviewed: false,
                            revision: project.revision + 1,
                            history: project.html
                              ? checkpoint(
                                  project.history || [],
                                  project.html,
                                  'Before manual source edit',
                                )
                              : project.history,
                          });
                          notify('Source applied. Previous artifact saved as a checkpoint.');
                        } catch (e) {
                          notify(
                            e instanceof Error ? e.message : 'Enter complete application HTML.',
                          );
                        }
                      }}
                    >
                      Apply application source
                    </button>
                  )}
                  <button className="button" onClick={() => handoff('studio')}>
                    Preview application
                  </button>
                  <button className="button" onClick={() => open('CODE-N4')}>
                    Container export recipe
                  </button>
                  <button className="button" onClick={() => open('CODE-E3')}>
                    Checkpoint & restore
                  </button>
                  <button className="button primary" onClick={() => handoff('qa')}>
                    Test this project <ArrowRight size={14} />
                  </button>
                </div>
              </section>
            </>
          )}
          {area === 'agents' && (
            <>
              <div className="grid-two">
                <section className="panel">
                  <span className="eyebrow">APP AGENT TEAM</span>
                  <h2>Build with specialists</h2>
                  <p className="muted">
                    Configure agents that belong to this application. Independent testing remains
                    separate from the builder’s own confidence.
                  </p>
                  <div className="agent-team-visual">
                    <div className="agent-node">
                      <span>◎</span>
                      <strong>Application lead</strong>
                      <small>Plans · delegates · asks</small>
                    </div>
                    <div className="agent-specialists">
                      {['Frontend', 'Backend', 'Data', 'Independent QA'].map((n) => (
                        <button
                          className="agent-node"
                          key={n}
                          onClick={() => {
                            setInputValue(n);
                            setDetail(
                              n === 'Independent QA'
                                ? 'Verify behavior against requirements'
                                : 'Build within approved project scope',
                            );
                          }}
                        >
                          <span>{n === 'Independent QA' ? '✓' : '◇'}</span>
                          <strong>{n}</strong>
                          <small>Configure specialist</small>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="row">
                    <button className="button" onClick={() => open('AGENT-E2')}>
                      Delegation rules
                    </button>
                    <button className="button" onClick={() => setTab('Canvas')}>
                      Open drag-and-drop canvas
                    </button>
                  </div>
                </section>
                <section className="panel">
                  <span className="eyebrow">NEW SPECIALIST</span>
                  <h2>One clear responsibility</h2>
                  <label className="field">
                    Agent name
                    <input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Research assistant"
                    />
                  </label>
                  <label className="field">
                    Instructions
                    <textarea
                      rows={3}
                      value={detail}
                      onChange={(e) => setDetail(e.target.value)}
                      placeholder="Describe its task and when it should ask for help"
                    />
                  </label>
                  <label className="field">
                    Framework
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                      {[
                        'Builder',
                        'Lyzr',
                        'LangGraph',
                        'CrewAI',
                        'OpenAI Agents SDK',
                        'Custom adapter',
                      ].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="button primary"
                    onClick={() => addEntity('agents', `Draft · ${role}`)}
                  >
                    Save agent draft <Plus size={15} />
                  </button>
                  <p className="muted">
                    Configuration only. No external agent or paid run is created.
                  </p>
                </section>
              </div>
              <section className="panel">
                <div className="row">
                  <h2>Agent inventory</h2>
                  <button className="button" onClick={() => open('AGENT-E1')}>
                    Lifecycle & versions
                  </button>
                </div>
                {entities('agents', 'No app-agent drafts yet. Start with one bounded task.')}
                <div className="row">
                  <button className="button" onClick={() => open('AGENT-E4')}>
                    Memory, tools & MCP
                  </button>
                  <button className="button" onClick={() => open('AGENT-E3')}>
                    Schedules & triggers
                  </button>
                  <button className="button" onClick={() => open('AGENT-N2')}>
                    Framework adapters
                  </button>
                  <button className="button primary" onClick={() => handoff('qa')}>
                    Evaluate app agents <ArrowRight size={14} />
                  </button>
                </div>
              </section>
            </>
          )}
          {area === 'models' && (
            <>
              <section className="panel model-hero">
                <span className="eyebrow">ROUTING STRATEGY</span>
                <h2>Choose the trade-off. Keep control.</h2>
                <div className="choice-grid">
                  {[
                    ['Smart routing', 'Match each task to an eligible model.'],
                    ['Single model', 'Use one model consistently.'],
                    ['Per-agent models', 'Specialize planning, generation and QA.'],
                  ].map(([name, desc]) => (
                    <button
                      className={'choice-card ' + (board.modelMode === name ? 'selected' : '')}
                      key={name}
                      aria-pressed={board.modelMode === name}
                      onClick={() => persist({ modelMode: name })}
                    >
                      <Settings2 size={21} />
                      <strong>{name}</strong>
                      <span>{desc}</span>
                      {board.modelMode === name && <Check size={16} />}
                    </button>
                  ))}
                </div>
                <div className="notice">
                  This page saves routing design preferences. The live model choice and actual
                  eligible models are shown in Build Studio before execution.
                </div>
                <button className="button primary" onClick={() => handoff('studio')}>
                  Open live prompt & model selection <ArrowRight size={15} />
                </button>
              </section>
              <div className="grid-two">
                <section className="panel">
                  <h2>Provider & funding</h2>
                  <div className="setting-row">
                    <div>
                      <strong>OpenRouter</strong>
                      <p className="muted">
                        Server-configured credential · never exposed to the browser
                      </p>
                    </div>
                    <span className="status">Check in Studio</span>
                  </div>
                  <div className="setting-row">
                    <div>
                      <strong>Customer endpoint</strong>
                      <p className="muted">
                        Inference consumer · hosting remains with the provider
                      </p>
                    </div>
                    <button className="button" onClick={() => open('MODEL-N1')}>
                      Add endpoint
                    </button>
                  </div>
                  <button className="text-button" onClick={() => open('MODEL-E2')}>
                    Manage funding distinction <ArrowRight size={14} />
                  </button>
                </section>
                <section className="panel">
                  <h2>Know before you route</h2>
                  <div className="setting-row">
                    <span>Cost guardrail</span>
                    <strong>Free eligible models first</strong>
                  </div>
                  <div className="setting-row">
                    <span>Unsupported capability</span>
                    <strong>Explain and pause</strong>
                  </div>
                  <div className="setting-row">
                    <span>Provider failure</span>
                    <strong>Visible retry / fallback</strong>
                  </div>
                  <div className="row">
                    <button className="button" onClick={() => open('MODEL-E3')}>
                      Design routing policy
                    </button>
                    <button className="button" onClick={() => open('MODEL-N2')}>
                      Compare model tasks
                    </button>
                  </div>
                </section>
              </div>
            </>
          )}
          {area === 'data' && (
            <>
              <div className="grid-two">
                <section className="panel">
                  <span className="eyebrow">DATA MODEL</span>
                  <h2>Make the backend visible.</h2>
                  <p className="muted">
                    Sample application schema · separate from Architect’s own project database.
                  </p>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Field</th>
                          <th>Type</th>
                          <th>Access</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          ['id', 'uuid', 'Primary key'],
                          ['owner_id', 'uuid', 'Owner scope'],
                          ['title', 'text', 'Required'],
                          ['completed', 'boolean', 'Default false'],
                          ['created_at', 'timestamp', 'Server assigned'],
                        ].map((r) => (
                          <tr key={r[0]}>
                            {r.map((c) => (
                              <td key={c}>{c}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="row">
                    <button className="button" onClick={() => open('DATA-E1')}>
                      Propose schema / migration
                    </button>
                    <button className="button" onClick={() => open('DATA-E4')}>
                      Generated-app identity
                    </button>
                  </div>
                </section>
                <section className="panel">
                  <span className="eyebrow">INTEGRATIONS</span>
                  <h2>Connected with purpose.</h2>
                  {['GitHub', 'Notion', 'Supabase', 'OpenRouter', 'MCP / plugins'].map((name) => (
                    <div className="setting-row" key={name}>
                      <div>
                        <strong>{name}</strong>
                        <p className="muted">Scope, health and permissions</p>
                      </div>
                      <button
                        className="button"
                        onClick={() =>
                          open('DATA-E2', {
                            service: name === 'MCP / plugins' ? 'MCP server' : name,
                          })
                        }
                      >
                        Configure
                      </button>
                    </div>
                  ))}
                  <p className="muted">
                    Connector drafts are not live authorization. Actual account connections are
                    configured separately.
                  </p>
                </section>
              </div>
              <section className="panel">
                <div className="row">
                  <div>
                    <span className="eyebrow">PROJECT CONTEXT</span>
                    <h2>Give every source a boundary.</h2>
                  </div>
                  <button className="button" onClick={() => open('DATA-E3')}>
                    Source & freshness
                  </button>
                </div>
                {entities(
                  'sources',
                  'No references saved. Add a source title and the relevant context.',
                )}
                <div className="grid-two">
                  <label className="field">
                    Source name
                    <input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Product brief"
                    />
                  </label>
                  <label className="field">
                    Excerpt or reference
                    <input
                      value={detail}
                      onChange={(e) => setDetail(e.target.value)}
                      placeholder="Only use the onboarding requirements"
                    />
                  </label>
                </div>
                <div className="row">
                  <button
                    className="button"
                    onClick={() => addEntity('sources', 'Needs source verification')}
                  >
                    Add reference
                  </button>
                  <button className="button" onClick={exportContext}>
                    Export context package
                  </button>
                  <button className="button primary" onClick={() => handoff('studio')}>
                    Continue building <ArrowRight size={15} />
                  </button>
                </div>
              </section>
            </>
          )}
          {area === 'qa' && (
            <>
              <div className="grid-two">
                <section className="panel">
                  <span className="eyebrow">INDEPENDENT TEST LAB</span>
                  <h2>Test the thing you meant to build.</h2>
                  <p className="muted">
                    Choose the specialist checks appropriate to your application.
                  </p>
                  <div className="check-list">
                    {[
                      'Functional',
                      'UI / accessibility',
                      'API / integration',
                      'Security / dependencies',
                      'Performance',
                      'Agent behavior',
                    ].map((c) => (
                      <label key={c}>
                        <input
                          type="checkbox"
                          checked={board.checks.includes(c)}
                          onChange={(e) =>
                            persist({
                              checks: e.target.checked
                                ? [...board.checks, c]
                                : board.checks.filter((x) => x !== c),
                            })
                          }
                        />
                        <span>{c}</span>
                      </label>
                    ))}
                  </div>
                  <label className="field">
                    Service scope
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                      {['Builder', 'Isolated service', 'Selected services', 'Full stack'].map(
                        (x) => (
                          <option key={x}>{x === 'Builder' ? 'Full stack (default)' : x}</option>
                        ),
                      )}
                    </select>
                  </label>
                  <div className="row">
                    <button className="button primary" disabled={running} onClick={simulateQA}>
                      <Play size={15} />
                      {running ? 'Preparing demo report…' : 'Run demonstration suite'}
                    </button>
                    <button
                      className="button"
                      disabled={aiBusy || !project?.html}
                      onClick={() => runAI('review')}
                    >
                      {aiBusy
                        ? 'Reviewing source…'
                        : demo
                          ? 'Demo source review'
                          : 'AI source review'}
                    </button>
                    <button className="button" onClick={() => open('QA-E1')}>
                      Add acceptance test
                    </button>
                  </div>
                  <p className="muted">
                    Demonstrates the run / evidence / repair flow. These checks do not execute a
                    real browser or security scanner.
                  </p>
                </section>
                <section className="panel">
                  <span className="eyebrow">RELEASE EVIDENCE</span>
                  <h2>
                    {board.qaStatus === 'complete'
                      ? 'A report you can act on.'
                      : 'No evidence, no assumption.'}
                  </h2>
                  {board.qaStatus === 'complete' ? (
                    <>
                      <span className="status">Demo run #{board.qaRun}</span>
                      <div className="sample-metrics">
                        <div>
                          <strong>{board.qaChecks.length}</strong>
                          <span>Selected suites</span>
                        </div>
                        <div>
                          <strong>1</strong>
                          <span>Sample finding</span>
                        </div>
                        <div>
                          <strong>0</strong>
                          <span>Verified checks</span>
                        </div>
                      </div>
                      <p className="muted">
                        Revision {board.qaRevision} · {board.qaScope || 'Full stack'} · results are
                        demonstration data.{' '}
                        {board.qaRevision !== project?.revision
                          ? 'This report is stale: the project has changed.'
                          : ''}
                      </p>
                      <button className="button" onClick={() => setSelectedRun(!selectedRun)}>
                        Inspect report
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="muted">
                        Build an application, define expectations and collect reproducible evidence.
                        A simulated run cannot certify a release.
                      </p>
                      <button className="button" onClick={() => handoff('studio')}>
                        Open application
                      </button>
                    </>
                  )}
                  <div className="row">
                    <button className="text-button" onClick={() => open('QA-N2')}>
                      Preview data & identities
                    </button>
                    <button className="text-button" onClick={() => open('QA-N3')}>
                      Quality gates
                    </button>
                  </div>
                </section>
              </div>
              {selectedRun && (
                <section className="panel">
                  <div className="row">
                    <AlertCircle size={19} />
                    <h2>Sample finding · keyboard focus needs review</h2>
                    <span className="status">Demonstration</span>
                  </div>
                  <p>
                    Expected: every interactive control has a visible focus indicator. This sample
                    demonstrates the evidence and repair handoff; it is not a measured defect in
                    your generated application.
                  </p>
                  <ol>
                    <li>Open the application preview.</li>
                    <li>Use Tab to move through primary controls.</li>
                    <li>Confirm focus remains visible and the order is meaningful.</li>
                  </ol>
                  <div className="row">
                    <button
                      className="button primary"
                      onClick={() => {
                        onUpdate({
                          draft:
                            'Review keyboard navigation and focus visibility in this application. Verify every interactive control is reachable and has a clear focus indicator.',
                        });
                        handoff('studio');
                      }}
                    >
                      Send repair prompt to Builder <ArrowRight size={15} />
                    </button>
                    <button className="button" onClick={() => open('QA-E4')}>
                      Record evidence / sign-off
                    </button>
                    <button
                      className="button"
                      onClick={() =>
                        download(
                          'demo-qa-report.json',
                          JSON.stringify(
                            {
                              simulation: true,
                              project: project?.id,
                              revision: board.qaRevision,
                              serviceScope: board.qaScope || 'Full stack',
                              suites: board.qaChecks,
                              finding: 'Sample keyboard focus review',
                              verifiedChecks: 0,
                            },
                            null,
                            2,
                          ),
                          'application/json',
                        )
                      }
                    >
                      Export report
                    </button>
                  </div>
                </section>
              )}
            </>
          )}
          {area === 'release' && (
            <>
              <div className="grid-two">
                <section className="panel">
                  <span className="eyebrow">RELEASE READINESS</span>
                  <h2>The evidence travels with the app.</h2>
                  {[
                    [project?.built, 'Application artifact exists'],
                    [Boolean(prd && trd), 'PRD and technical plan present'],
                    [
                      board.qaStatus === 'complete' && board.qaRevision === project?.revision,
                      'Demonstration QA flow completed for this revision',
                    ],
                    [false, 'Real production verification required'],
                  ].map(([ok, label]) => (
                    <div className="setting-row" key={String(label)}>
                      <span>{label}</span>
                      <span className="status">{ok ? 'Available' : 'Pending'}</span>
                    </div>
                  ))}
                  <div className="notice">
                    This is a release-flow prototype. A demo deployment does not publish a URL,
                    change traffic or certify production readiness.
                  </div>
                  <button className="button" onClick={() => open('RELEASE-N3')}>
                    Open readiness decision
                  </button>
                </section>
                <section className="panel">
                  <span className="eyebrow">RELEASE HISTORY</span>
                  <h2>Review every attempt.</h2>
                  <p className="muted">
                    Environment selection, release notes, failed health checks, retries and rollback
                    share one rehearsal below. Previous attempts stay attached to this project.
                  </p>
                  <button
                    className="button primary"
                    onClick={() =>
                      document
                        .getElementById('experience-release')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  >
                    Open deployment rehearsal <ArrowRight size={15} />
                  </button>
                </section>
              </div>
              <section className="panel">
                <span className="eyebrow">BEYOND THE DEPLOY BUTTON</span>
                <div className="choice-grid">
                  {[
                    ['RELEASE-E2', 'Ownership & hosting'],
                    ['RELEASE-E3', 'Domains & runtime'],
                    ['RELEASE-N1', 'Coordinated services'],
                    ['RELEASE-N2', 'Traffic & rollback'],
                    ['RELEASE-E4', 'Visibility & notes'],
                    ['RELEASE-N4', 'Retirement & migration'],
                  ].map(([id, title]) => (
                    <button className="choice-card" key={id} onClick={() => open(id)}>
                      <Layers size={20} />
                      <strong>{title}</strong>
                      <ArrowRight size={15} />
                    </button>
                  ))}
                </div>
                <button className="button" onClick={() => handoff('ops')}>
                  See operations & outcomes <ArrowRight size={15} />
                </button>
              </section>
            </>
          )}
          {area === 'ops' && (
            <>
              <div className="notice">
                Sample operations workspace. Actual generation responses and provider errors appear
                in Studio. The numbers below are examples, not measurements of your live
                application.
              </div>
              <div className="metric-grid">
                {[
                  ['98.4%', 'Sample reliability'],
                  ['1.2s', 'Sample response time'],
                  ['12', 'Sample agent runs'],
                  ['$0.00', 'Unconnected cost ledger'],
                ].map(([value, label]) => (
                  <section className="panel metric" key={label}>
                    <Activity size={18} />
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </section>
                ))}
              </div>
              <div className="grid-two">
                <section className="panel">
                  <span className="eyebrow">RUN INVESTIGATION</span>
                  <h2>Follow the evidence.</h2>
                  {board.logs.length ? (
                    board.logs.slice(0, 8).map((l, i) => (
                      <div className="setting-row" key={i}>
                        <Clock size={16} />
                        <span>{l}</span>
                      </div>
                    ))
                  ) : (
                    <p className="muted">
                      No local activity yet. Rehearse a test or release to populate this timeline.
                    </p>
                  )}
                  <div className="row">
                    <button className="button" onClick={() => open('OPS-E1')}>
                      Query telemetry
                    </button>
                    <button className="button" onClick={() => open('OPS-E3')}>
                      Investigate run cost
                    </button>
                  </div>
                </section>
                <section className="panel">
                  <span className="eyebrow">IMPROVEMENT LOOP</span>
                  <h2>Turn a signal into the next useful change.</h2>
                  <label className="field">
                    Finding
                    <textarea
                      rows={4}
                      value={detail}
                      onChange={(e) => setDetail(e.target.value)}
                      placeholder="Describe the observed problem and who it affects"
                    />
                  </label>
                  <button
                    className="button primary"
                    onClick={() => {
                      if (!detail.trim()) {
                        notify('Describe the finding first.');
                        return;
                      }
                      onUpdate({ draft: `Investigate and fix: ${detail}` });
                      handoff('studio');
                    }}
                  >
                    Send to Builder <ArrowRight size={15} />
                  </button>
                  <div className="row">
                    <button className="text-button" onClick={() => open('OPS-N1')}>
                      Alert & recovery policy
                    </button>
                    <button className="text-button" onClick={() => open('OPS-N3')}>
                      Track release outcomes
                    </button>
                  </div>
                </section>
              </div>
            </>
          )}
          {area === 'settings' && (
            <>
              <div className="grid-two">
                <section className="panel">
                  <span className="eyebrow">PEOPLE & ACCESS</span>
                  <h2>A clear place for everyone.</h2>
                  {entities(
                    'members',
                    'No local invite drafts. Existing account membership is separate from this demonstration.',
                  )}
                  <label className="field">
                    Invitee email
                    <input
                      type="email"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="teammate@example.com"
                    />
                  </label>
                  <label className="field">
                    Project role
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                      {['Viewer', 'Reviewer', 'Builder', 'Admin', 'Owner'].map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="button primary"
                    onClick={() => {
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputValue)) {
                        notify('Enter a valid email address.');
                        return;
                      }
                      addEntity('members', 'Invitation draft · not sent');
                    }}
                  >
                    Save invitation draft <Plus size={15} />
                  </button>
                  <p className="muted">No email is sent and no actual permission is granted.</p>
                </section>
                <section className="panel">
                  <span className="eyebrow">BUDGET & AUTHORITY</span>
                  <h2>Visible before you spend.</h2>
                  <div className="setting-row">
                    <span>Prototype plan</span>
                    <strong>Free demo</strong>
                  </div>
                  <div className="setting-row">
                    <span>Provider credits</span>
                    <strong>Provider authoritative</strong>
                  </div>
                  <div className="setting-row">
                    <span>Purchases & invoices</span>
                    <strong>Demonstration only</strong>
                  </div>
                  <p className="muted">
                    No payment is processed. Architect demo credits and customer-funded API balances
                    are separate concepts.
                  </p>
                  <div className="row">
                    <button className="button" onClick={() => open('ORG-E4')}>
                      Budget / plan workflow
                    </button>
                    <button className="button" onClick={() => open('ORG-E2')}>
                      Permissions
                    </button>
                  </div>
                </section>
              </div>
              <section className="panel">
                <h2>Decisions stay attached to the project.</h2>
                <p className="muted">
                  Review a plan, request changes, approve a design or record release authority. A
                  decision records the revision it applies to.
                </p>
                <div className="row">
                  <button className="button primary" onClick={() => open('ORG-N3')}>
                    Record a decision
                  </button>
                  <button className="button" onClick={() => open('ORG-E1')}>
                    Role & onboarding preferences
                  </button>
                  <button className="button" onClick={() => open('ORG-N1')}>
                    Home & assigned work
                  </button>
                  <button className="button" onClick={() => open('ORG-E3')}>
                    Artifact sharing
                  </button>
                </div>
              </section>
            </>
          )}
          <FeatureExperiences
            demo={demo}
            area={area}
            project={project}
            onUpdate={onUpdate}
            onNavigate={handoff}
            notify={notify}
          />
          {area === 'agents' && project && (
            <AppAgentPlayground
              project={project}
              demo={demo}
              configuration={board.advanced}
              notify={notify}
            />
          )}
          <AdvancedPanels
            area={area}
            values={board.advanced}
            onSave={(id, values) => {
              persist({ advanced: { ...board.advanced, [id]: values } });
              notify(
                'Configuration saved to this project. External runtime settings are unchanged.',
              );
            }}
            notify={notify}
          />
          <section className="panel next-workflows">
            <div className="row">
              <div>
                <span className="eyebrow">CONTINUE EXPLORING</span>
                <h2>Every part of {area === 'qa' ? 'quality' : area}.</h2>
              </div>
              <button className="text-button" onClick={() => setTab('All workflows')}>
                View all {list.length} workflows <ArrowRight size={15} />
              </button>
            </div>
            <div className="workflow-shortlist">
              {list.slice(0, 3).map((f) => (
                <button className="workflow-link" key={f.id} onClick={() => setActive(f)}>
                  <span className="muted">{f.id}</span>
                  <strong>{f.title}</strong>
                  <ArrowRight size={15} />
                </button>
              ))}
            </div>
          </section>
        </>
      )}
      {tab === 'All workflows' && (
        <section className="panel">
          <div className="row">
            <h2>Complete {area} workflows</h2>
            <label className="search-field">
              <Search size={16} />
              <input
                aria-label="Search workflows"
                placeholder="Find a workflow…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          </div>
          <p className="muted">
            Configure → review → record an outcome → continue to the next product without losing
            your project.
          </p>
          <div className="workflow-list">
            {list.map((f) => (
              <button className="workflow-list-item" key={f.id} onClick={() => setActive(f)}>
                <div>
                  <span className="eyebrow">
                    {f.id} · {f.treatment === 'Enhance' ? 'Enhanced capability' : 'New capability'}
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.scope}</p>
                </div>
                <ArrowRight size={19} />
              </button>
            ))}
            {!list.length && <p>No workflows match this search.</p>}
          </div>
        </section>
      )}
      {tab === 'Activity' && (
        <section className="panel">
          <h2>Project decisions & workflow history</h2>
          <p className="muted">
            Prototype records stay attached to this project and are included in workspace saving and
            context exports.
          </p>
          {board.records.length ? (
            board.records.map((record, i) => (
              <details className="activity-detail" key={i}>
                <summary>
                  <span className="status">{record.id}</span>{' '}
                  {workflows.find((f) => f.id === record.id)?.title}
                  <span className="muted">
                    {' '}
                    · revision {record.revision} · {new Date(record.at).toLocaleString()}
                  </span>
                </summary>
                <dl>
                  {Object.entries(record.values).map(([k, v]) => (
                    <div key={k}>
                      <dt>{recipes[record.id]?.fields.find((f) => f.key === k)?.label || k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                <button className="text-button" onClick={() => open(record.id)}>
                  Revise this workflow
                </button>
              </details>
            ))
          ) : (
            <div className="empty-small">
              <Clock size={25} />
              <p>No decisions recorded yet. Complete a workflow to capture its outcome here.</p>
            </div>
          )}
        </section>
      )}
      {active && (
        <WorkflowDialog
          projectId={project.id}
          key={active.id + JSON.stringify(initialValues)}
          initialValues={initialValues}
          feature={active}
          previous={board.records.find((r) => r.id === active.id)}
          onClose={() => setActive(null)}
          onSave={(values) => {
            const record = {
              id: active.id,
              values,
              at: new Date().toISOString(),
              revision: project?.revision || 0,
            };
            persist({ records: [record, ...board.records] });
            if (active.id === 'PLAN-E3') {
              const template = `# ${project?.title || 'Project'} · ${values.template}\n\n## Goal\n${project?.brief || 'Describe the user intention.'}\n\n## Users and use cases\nDefine who uses this and their primary action.\n\n## Requirements\n- Define the first useful release.\n- Include loading, empty, error and permission states.\n\n## Acceptance criteria\nDescribe observable outcomes and how to test them.\n\n## Open decisions\nAuthentication, data ownership, integrations, hosting and cost.`;
              if (values.template === 'Technical design') {
                setTrd(
                  values.mode === 'Append to current draft' ? trd + '\n\n' + template : template,
                );
                setDoc('trd');
              } else {
                setPrd(
                  values.mode === 'Append to current draft' ? prd + '\n\n' + template : template,
                );
                setDoc('prd');
              }
            }
            if (active.id === 'AGENT-E2') {
              const names = values.specialists
                .split(',')
                .map((n) => n.trim())
                .filter(Boolean);
              persist({
                bots: [
                  {
                    id: 'lead',
                    name: values.lead,
                    role: 'Coordinate approved application tasks',
                    x: 270,
                    y: 35,
                    parent: null,
                  },
                  ...names.map((name, i) => ({
                    id: uid(),
                    name,
                    role: `${values.delegation}; ${values.approval}`,
                    x: 30 + (i % 3) * 235,
                    y: 200 + Math.floor(i / 3) * 130,
                    parent: 'lead',
                  })),
                ],
              });
            }
            if (active.id === 'CODE-N3')
              persist({
                services: [
                  ...boardRef.current.services,
                  {
                    id: uid(),
                    name: values.service,
                    detail: `${values.repository} @ ${values.commit}`,
                    status: values.dependency,
                  },
                ],
              });
            if (active.id === 'CODE-E1' && values.repository) {
              onUpdate({ repo: values.repository });
              persist({ branch: values.branch || 'main' });
            }
            if (active.id === 'CODE-E2' && values.branch) persist({ branch: values.branch });
            if (
              (active.id === 'ORG-N3' && values.decision === 'Approve') ||
              (active.id === 'PLAN-E4' && values.status === 'Approve with notes')
            )
              onUpdate({ reviewed: true, stage: 'Review' });
            if (
              (active.id === 'ORG-N3' && values.decision !== 'Approve') ||
              (active.id === 'PLAN-E4' && values.status === 'Request changes')
            )
              onUpdate({ reviewed: false });
            if (active.id === 'OPS-E4' && values.finding)
              onUpdate({ draft: `Investigate: ${values.finding}. Impact: ${values.impact}` });
            notify('Workflow decision saved with this project.');
          }}
          onHandoff={(view, values) => {
            const id = active.id;
            setActive(null);
            if (view === 'studio') {
              onUpdate({ draft: workflowPrompt(id, values) });
              handoff(view, {
                source: id,
                panel:
                  id === 'CODE-E3'
                    ? 'history'
                    : id === 'BUILD-N3'
                      ? 'games'
                      : id.startsWith('MODEL')
                        ? 'models'
                        : undefined,
              });
            } else
              handoff(view, {
                source: id,
                tab: id === 'AGENT-E2' ? 'Canvas' : 'Overview',
                document:
                  id === 'PLAN-E3' && values.template === 'Technical design' ? 'trd' : undefined,
              });
          }}
        />
      )}
    </div>,
    readOnly,
  );
}

function WorkflowDialog({
  feature,
  previous,
  onClose,
  onSave,
  onHandoff,
  initialValues,
  projectId,
  readOnly = false,
}: {
  readOnly?: boolean;
  projectId: string;
  initialValues?: Record<string, string>;
  feature: Workflow;
  previous?: RecordEntry;
  onClose: () => void;
  onSave: (v: Record<string, string>) => void;
  onHandoff: (v: string, values: Record<string, string>) => void;
}) {
  const recipe = recipes[feature.id];
  const [stage, setStage] = useState(0),
    [values, _setValues] = useState<Record<string, string>>(() => {
      let draft = {};
      try {
        draft = JSON.parse(readDraft(projectId, 'workflow-' + feature.id, '{}'));
      } catch {}
      return { ...getDefaults(feature.id), ...previous?.values, ...draft, ...initialValues };
    }),
    [errors, setErrors] = useState<string[]>([]);
  const setValues = (value: Record<string, string>) => {
    _setValues(value);
    writeDraft(projectId, 'workflow-' + feature.id, JSON.stringify(value));
  };
  const next = () => {
    const problems = validateWorkflow(feature.id, values);
    if (problems.length) {
      setErrors(problems);
      return;
    }
    setErrors([]);
    setStage(1);
  };
  return readOnlyControls(
    <Modal title={feature.title} onClose={onClose} wide>
      <div className="row">
        <span className="status">{feature.id}</span>
        <span className="muted">Interactive prototype · project record</span>
      </div>
      <div className="workflow-progress" aria-label="Workflow progress">
        {['Configure', 'Review', 'Outcome'].map((s, i) => (
          <span className={stage === i ? 'active' : ''} key={s}>
            {i + 1}. {s}
            {i < 2 && <ChevronRight size={13} />}
          </span>
        ))}
      </div>
      <p>{recipe.intro}</p>
      {stage === 0 && (
        <>
          <div className="workflow-fields">
            {recipe.fields.map((f) => (
              <label className="field" key={f.key}>
                {f.label}
                {f.required && <span aria-hidden="true"> *</span>}
                {f.options ? (
                  <select
                    value={values[f.key] || ''}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  >
                    {f.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={values[f.key] || ''}
                    placeholder={f.placeholder}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                    maxLength={3000}
                  />
                )}
              </label>
            ))}
          </div>
          {errors.length > 0 && (
            <div className="notice error" role="alert">
              {errors.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </div>
          )}
          <div className="modal-footer">
            <button className="button" onClick={onClose}>
              Cancel
            </button>
            <button className="button primary" onClick={next}>
              Review configuration <ArrowRight size={15} />
            </button>
          </div>
        </>
      )}
      {stage === 1 && (
        <>
          <dl className="review-grid">
            {recipe.fields.map((f) => (
              <div key={f.key}>
                <dt>{f.label}</dt>
                <dd>{values[f.key] || 'Not specified'}</dd>
              </div>
            ))}
          </dl>
          <div className="notice">
            <ShieldCheck size={17} /> This records a prototype decision in your project. It does not
            execute external actions, purchase services, grant permissions or certify a production
            deployment.
          </div>
          <div className="modal-footer">
            <button className="button" onClick={() => setStage(0)}>
              Back to edit
            </button>
            <button
              className="button primary"
              onClick={() => {
                onSave(values);
                clearDraft(projectId, 'workflow-' + feature.id);
                setStage(2);
              }}
            >
              Save workflow decision <Check size={15} />
            </button>
          </div>
        </>
      )}
      {stage === 2 && (
        <>
          <div className="workflow-result">
            <CheckCircle2 size={34} />
            <h3>Decision recorded.</h3>
            <p>{recipe.outcome}</p>
          </div>
          <div className="modal-footer">
            <button className="button" onClick={onClose}>
              Stay here
            </button>
            <button className="button primary" onClick={() => onHandoff(recipe.handoff, values)}>
              {recipe.handoffLabel}
              <ArrowRight size={15} />
            </button>
          </div>
        </>
      )}
    </Modal>,
    readOnly,
  );
}

function AdvancedPanels({
  area,
  values,
  onSave,
  notify,
  readOnly = false,
}: {
  readOnly?: boolean;
  area: string;
  values: Record<string, Record<string, string>>;
  onSave: (id: string, values: Record<string, string>) => void;
  notify: (s: string) => void;
}) {
  const sections = advancedSections.filter((s) => s.area === area);
  if (!sections.length) return null;
  return readOnlyControls(
    <section className="panel advanced-panel">
      <div className="row">
        <div>
          <span className="eyebrow">DETAILED CONTROLS</span>
          <h2>The small decisions matter.</h2>
        </div>
        <Settings2 size={22} />
      </div>
      <p className="muted">
        Expand a configuration, adjust the choices and save a project-specific draft. Advanced
        runtime actions remain explicit prototypes.
      </p>
      {sections.map((section) => (
        <details key={section.id} className="advanced-section">
          <summary>
            <span>
              <strong>{section.title}</strong>
              <small>{section.description}</small>
            </span>
            <span className="status">{values[section.id] ? 'Draft saved' : 'Configure'}</span>
          </summary>
          <AdvancedEditor
            section={section}
            saved={values[section.id]}
            onSave={(v) => onSave(section.id, v)}
            notify={notify}
          />
        </details>
      ))}
    </section>,
    readOnly,
  );
}
function AdvancedEditor({
  section,
  saved,
  onSave,
  notify,
  readOnly = false,
}: {
  readOnly?: boolean;
  section: AdvancedSection;
  saved?: Record<string, string>;
  onSave: (v: Record<string, string>) => void;
  notify: (s: string) => void;
}) {
  const [values, setValues] = useState({ ...advancedDefaults(section), ...saved }),
    [errors, setErrors] = useState<string[]>([]),
    [expanded, setExpanded] = useState(false),
    [reveal, setReveal] = useState(false);
  const save = () => {
    const problems = validateAdvanced(section, values);
    setErrors(problems);
    if (!problems.length) onSave(values);
  };
  return readOnlyControls(
    <div className={'advanced-editor ' + (expanded ? 'expanded' : '')}>
      <div className="workflow-fields">
        {section.fields.map((f) => (
          <label className={'field ' + (f.type === 'toggle' ? 'toggle-field' : '')} key={f.key}>
            {f.type === 'toggle' ? (
              <>
                <input
                  type="checkbox"
                  checked={values[f.key] === 'true'}
                  onChange={(e) => setValues({ ...values, [f.key]: String(e.target.checked) })}
                />
                <span>{f.label}</span>
              </>
            ) : (
              <>
                <span>{f.label}</span>
                {f.options ? (
                  <select
                    value={values[f.key]}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  >
                    {f.options.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : f.type === 'textarea' || f.type === 'json' ? (
                  <textarea
                    rows={expanded ? 12 : 4}
                    spellCheck={f.type !== 'json'}
                    value={values[f.key]}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  />
                ) : (
                  <input
                    type={
                      f.type === 'number'
                        ? 'number'
                        : f.key === 'credential' && !reveal
                          ? 'password'
                          : 'text'
                    }
                    step="any"
                    min={f.min}
                    max={f.max}
                    maxLength={f.type !== 'number' ? f.max : undefined}
                    value={values[f.key]}
                    onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                  />
                )}
              </>
            )}
            {f.help && <small>{f.help}</small>}
          </label>
        ))}
      </div>
      {errors.length > 0 && (
        <div className="notice error" role="alert">
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}
      <div className="row">
        <button className="button primary" onClick={save}>
          Save configuration
        </button>
        <button
          className="button"
          onClick={() => {
            setValues({ ...advancedDefaults(section), ...saved });
            setErrors([]);
            notify('Unsaved edits reset to the saved configuration.');
          }}
        >
          Cancel edits
        </button>
        <button className="text-button" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Compact editors' : 'Expand editors'}
        </button>
        <button
          className="text-button"
          onClick={() =>
            download(
              `${section.id}.json`,
              JSON.stringify(
                { prototype: true, section: section.id, configuration: values },
                null,
                2,
              ),
              'application/json',
            )
          }
        >
          Export JSON
        </button>
        {section.fields.some((f) => f.key === 'credential') && (
          <button className="text-button" onClick={() => setReveal(!reveal)}>
            {reveal ? 'Mask reference' : 'Show credential reference'}
          </button>
        )}
      </div>
      {section.id === 'agent-identity' && (
        <div className="row">
          <button
            className="button"
            onClick={() => {
              setValues({
                ...values,
                instructions: `You are ${values.role || 'an application specialist'}.\nYour goal: ${values.goal || 'help the user complete their task'}.\nUse only approved tools and project context.\nDelegate to ${values.native || 'approved sub-agents'} only within their scope.\nAsk for approval before external writes.\nReturn evidence and limitations with your result.`,
              });
              notify('Structured instruction template prepared. This action does not use a model.');
            }}
          >
            Draft instruction structure
          </button>
          <button
            className="button"
            onClick={() => {
              setValues({
                ...values,
                instructions:
                  values.instructions +
                  '\n\nBefore answering: check the task, verify evidence, honor permissions and explain uncertainty.',
              });
              notify('Review checklist appended to instructions.');
            }}
          >
            Add review checklist
          </button>
          <button
            className="text-button"
            onClick={() =>
              download(
                'skill.md',
                `# ${values.name}\n\n${values.goal}\n\n## Instructions\n${values.instructions}`,
              )
            }
          >
            Export skill.md
          </button>
          <span className="muted">Git Agent · plan-dependent integration prototype</span>
        </div>
      )}
      {section.id === 'agent-deploy' && (
        <div className="notice">
          <strong>API request example</strong>
          <pre>{`curl -X POST '${values.endpoint}' \\\n  -H 'Authorization: Bearer $${values.credential || 'LYZR_API_KEY'}' \\\n  -H 'Content-Type: application/json' \\\n  -d '{"message":"Hello"}'`}</pre>
          <button
            className="button"
            onClick={() => {
              navigator.clipboard
                .writeText(
                  `curl -X POST '${values.endpoint}' -H 'Authorization: Bearer $${values.credential || 'LYZR_API_KEY'}' -H 'Content-Type: application/json' -d '{"message":"Hello"}'`,
                )
                .then(
                  () => notify('Request example copied with a credential reference.'),
                  () => notify('Clipboard unavailable. Select and copy the example instead.'),
                );
            }}
          >
            Copy request example
          </button>
        </div>
      )}
      <p className="muted small">
        Saved configuration describes intended behavior; it does not enable a connector, publish an
        agent, process a purchase or enforce a remote policy.
      </p>
    </div>,
    readOnly,
  );
}

function FlowCanvas({
  board,
  persist,
  notify,
  readOnly = false,
}: {
  readOnly?: boolean;
  board: Board;
  persist: (p: Partial<Board>) => void;
  notify: (s: string) => void;
}) {
  const [type, setType] = useState('AI Agent'),
    [search, setSearch] = useState(''),
    [template, setTemplate] = useState('Empty flow'),
    [selected, setSelected] = useState(board.bots[0]?.id || ''),
    [zoom, setZoom] = useState(100),
    [interactive, setInteractive] = useState(true),
    [runner, setRunner] = useState(false),
    [input, setInput] = useState('Hello'),
    [jsonMode, setJsonMode] = useState(false),
    [result, setResult] = useState(''),
    [nodeConfig, setNodeConfig] = useState('{}');
  const current = board.bots.find((b) => b.id === selected);
  const update = (bots: Bot[]) =>
    persist({
      bots: bots.map((b) => ({
        ...b,
        parent: b.parent && !bots.some((p) => p.id === b.parent) ? 'lead' : b.parent,
      })),
      flowHistory: [...board.flowHistory, board.bots].slice(-30),
      flowFuture: [],
    });
  const templates = () => {
    if (template === 'Empty flow') {
      update([
        {
          id: 'lead',
          name: 'Application lead',
          role: 'Define the workflow goal',
          parent: null,
          x: 270,
          y: 35,
        },
      ]);
      return;
    }
    const names =
      template === 'Research Swarm'
        ? ['Research lead', 'Search specialist', 'Evidence reviewer']
        : template.includes('Email')
          ? ['Trigger', 'Draft reply', 'Wait for Approval']
          : template === 'Code Reviewer'
            ? ['Read change', 'Review source', 'Report findings']
            : ['Receive input', 'AI Agent', 'Review output'];
    update(
      names.map((name, i) => ({
        id: i === 0 ? 'lead' : uid(),
        name,
        role: `${template}: ${name.toLowerCase()}`,
        parent: i === 0 ? null : 'lead',
        x: i === 0 ? 270 : 30 + ((i - 1) % 3) * 235,
        y: i === 0 ? 35 : 200 + Math.floor((i - 1) / 3) * 130,
      })),
    );
    notify('Workflow template loaded as an editable configuration. No agents executed.');
  };
  return readOnlyControls(
    <section className="flow-workspace">
      <div className="panel">
        <div className="row">
          <div>
            <span className="eyebrow">APP WORKFLOW / CANVAS</span>
            <h2>See the handoffs.</h2>
          </div>
          <button className="button" onClick={() => setRunner(!runner)}>
            {runner ? 'Hide runner' : 'Open run panel'}
          </button>
        </div>
        <div className="canvas-toolbar">
          <label className="field">
            Template
            <select value={template} onChange={(e) => setTemplate(e.target.value)}>
              {flowTemplates.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <button className="button" onClick={templates}>
            Apply template
          </button>
          <button
            className="button"
            disabled={!board.flowHistory.length}
            onClick={() =>
              persist({
                bots: board.flowHistory.at(-1)!,
                flowHistory: board.flowHistory.slice(0, -1),
                flowFuture: [board.bots, ...board.flowFuture],
              })
            }
          >
            Undo
          </button>
          <button
            className="button"
            disabled={!board.flowFuture.length}
            onClick={() =>
              persist({
                bots: board.flowFuture[0],
                flowHistory: [...board.flowHistory, board.bots],
                flowFuture: board.flowFuture.slice(1),
              })
            }
          >
            Redo
          </button>
          <button
            className="button"
            onClick={() =>
              update(
                board.bots.map((b, i) => ({
                  ...b,
                  x: i === 0 ? 270 : 30 + ((i - 1) % 3) * 235,
                  y: i === 0 ? 35 : 200 + Math.floor((i - 1) / 3) * 130,
                })),
              )
            }
          >
            Auto-align
          </button>
          <button className="button" onClick={() => setZoom(100)}>
            Fit view
          </button>
          <button
            className="icon-button"
            aria-label="Zoom out canvas"
            disabled={zoom <= 50}
            onClick={() => setZoom(zoom - 10)}
          >
            −
          </button>
          <span>{zoom}%</span>
          <button
            className="icon-button"
            aria-label="Zoom in canvas"
            disabled={zoom >= 140}
            onClick={() => setZoom(zoom + 10)}
          >
            +
          </button>
          <label className="toggle-field">
            <input
              type="checkbox"
              checked={interactive}
              onChange={(e) => setInteractive(e.target.checked)}
            />
            Interactive canvas
          </label>
        </div>
        <div className="row">
          <label className="field">
            Find a node type
            <input
              placeholder="Search 33 node types"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label className="field">
            Node type
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {flowNodeTypes
                .filter((n) => n.toLowerCase().includes(search.toLowerCase()) || n === type)
                .map((n) => (
                  <option key={n}>{n}</option>
                ))}
            </select>
          </label>
          <button
            className="button primary"
            onClick={() => {
              const id = uid();
              update([
                ...board.bots,
                {
                  id,
                  name: type,
                  role: `Configure ${type.toLowerCase()} behavior`,
                  parent: 'lead',
                  x: 30 + ((board.bots.length - 1) % 3) * 235,
                  y: 200 + Math.floor((board.bots.length - 1) / 3) * 130,
                },
              ]);
              setSelected(id);
            }}
          >
            Add node
          </button>
          <button className="button" disabled title="Unavailable in the explored baseline">
            GitAgent · soon
          </button>
          <button className="button" disabled title="Unavailable in the explored baseline">
            Split Document · soon
          </button>
        </div>
        <p className="muted">
          All node types can be configured as a workflow prototype. This canvas does not execute
          code, external API requests or tools.
        </p>
      </div>
      <fieldset className="canvas-interaction" disabled={!interactive}>
        <div style={{ zoom: `${zoom}%` }}>
          <Bots bots={board.bots} onChange={update} />
        </div>
      </fieldset>
      <section className="panel">
        <div className="row">
          <h2>Node settings & hierarchy</h2>
          <span className="status">{board.bots.length} nodes</span>
        </div>
        <div className="grid-two">
          <label className="field">
            Selected node
            <select
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                setNodeConfig(board.advanced[`node-${e.target.value}`]?.json || '{}');
              }}
            >
              {board.bots.map((b) => (
                <option value={b.id} key={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Reports to
            <select
              value={current?.parent || ''}
              disabled={!current || current.id === 'lead'}
              onChange={(e) => {
                const parent = e.target.value;
                let node = board.bots.find((b) => b.id === parent);
                const seen = new Set([selected]);
                while (node) {
                  if (seen.has(node.id)) {
                    notify('That relationship would create a cycle. Choose another parent.');
                    return;
                  }
                  seen.add(node.id);
                  node = board.bots.find((b) => b.id === node?.parent);
                }
                update(
                  board.bots.map((b) => (b.id === selected ? { ...b, parent: parent || null } : b)),
                );
              }}
            >
              <option value="">Workspace owner</option>
              {board.bots
                .filter((b) => b.id !== selected)
                .map((b) => (
                  <option value={b.id} key={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>
          </label>
        </div>
        <label className="field">
          Structured node configuration
          <textarea
            rows={5}
            spellCheck={false}
            value={nodeConfig}
            onChange={(e) => setNodeConfig(e.target.value)}
          />
        </label>
        <div className="row">
          <button
            className="button primary"
            onClick={() => {
              try {
                JSON.parse(nodeConfig);
                persist({
                  advanced: { ...board.advanced, [`node-${selected}`]: { json: nodeConfig } },
                });
                notify('Node configuration saved.');
              } catch {
                notify('Enter valid JSON before saving.');
              }
            }}
          >
            Save node configuration
          </button>
          <button
            className="button"
            onClick={() =>
              setNodeConfig(
                JSON.stringify(
                  {
                    input: 'message',
                    output: 'result',
                    runAsSubAgent: true,
                    requireApproval: true,
                  },
                  null,
                  2,
                ),
              )
            }
          >
            Use configuration starter
          </button>
          <button className="button" onClick={() => setNodeConfig('{}')}>
            Reset node configuration
          </button>
          <button
            className="button"
            onClick={() =>
              download(
                'agent-workflow.json',
                JSON.stringify(
                  { prototype: true, nodes: board.bots, configuration: board.advanced },
                  null,
                  2,
                ),
                'application/json',
              )
            }
          >
            Export workflow JSON
          </button>
          <label className="button">
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  if (file.size > 1000000) throw new Error('File is too large.');
                  const data = JSON.parse(await file.text());
                  const issues = validateFlowImport(data.nodes);
                  if (issues.length) throw new Error(issues.join(' '));
                  update(data.nodes);
                  setSelected(data.nodes[0]?.id || '');
                  notify('Workflow imported as a local draft.');
                } catch (err) {
                  notify(err instanceof Error ? err.message : 'Invalid workflow JSON.');
                }
                e.target.value = '';
              }}
            />
          </label>
        </div>
        <details>
          <summary>Workflow overview / minimap</summary>
          <ol>
            {board.bots.map((b) => (
              <li key={b.id}>
                {b.name} → {board.bots.find((p) => p.id === b.parent)?.name || 'Workspace owner'}
              </li>
            ))}
          </ol>
        </details>
      </section>
      {runner && (
        <section className="panel">
          <div className="row">
            <h2>Run panel</h2>
            <button className="button" onClick={() => setRunner(false)}>
              Close run panel
            </button>
          </div>
          <label className="toggle-field">
            <input
              type="checkbox"
              checked={jsonMode}
              onChange={(e) => setJsonMode(e.target.checked)}
            />
            JSON input mode
          </label>
          <label className="field">
            Input
            <textarea rows={3} value={input} onChange={(e) => setInput(e.target.value)} />
          </label>
          <button
            className="button primary"
            onClick={() => {
              if (jsonMode) {
                try {
                  JSON.parse(input);
                } catch {
                  notify('Input must be valid JSON in JSON mode.');
                  return;
                }
              }
              if (!input.trim()) {
                notify('Enter a test input.');
                return;
              }
              const output = `Demonstration only — no agents executed.\n${board.bots.map((b, i) => `${i + 1}. ${b.name}: configuration loaded → approval checkpoint`).join('\n')}\nInput preserved for a future connected runtime.`;
              setResult(output);
              persist({
                logs: [
                  `Workflow rehearsal · ${board.bots.length} nodes · no external execution`,
                  ...board.logs,
                ],
              });
            }}
          >
            Rehearse workflow
          </button>
          {result && <pre className="ai-feedback">{result}</pre>}
        </section>
      )}
    </section>,
    readOnly,
  );
}

function AppAgentPlayground({
  project,
  demo,
  configuration,
  notify,
  readOnly = false,
}: {
  readOnly?: boolean;
  project: Project;
  demo: boolean;
  configuration: Record<string, Record<string, string>>;
  notify: (s: string) => void;
}) {
  const [mode, setMode] = useState('Playground'),
    [session, setSession] = useState('Test session 1'),
    [input, setInput] = useState(''),
    [messages, setMessages] = useState<{ role: string; text: string }[]>([]),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  const send = async () => {
    if (readOnly) {
      notify('Viewer access cannot run agents.');
      return;
    }
    if (!input.trim() || busy) return;
    const prompt = input.trim();
    setInput('');
    setError('');
    setMessages((m) => [...m, { role: 'user', text: prompt }]);
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    try {
      if (demo) {
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            text: `Demonstration response. The configured agent would handle “${prompt}” within its approved project context and tool permissions. No live agent ran.`,
          },
        ]);
        return;
      }
      const response = await generate(
        {
          prompt,
          mode: 'chat',
          model: project.model || 'auto',
          context: JSON.stringify({
            instruction:
              configuration['agent-identity']?.instructions ||
              'Help with this application using approved project information. State uncertainty and do not claim to execute tools.',
            goal: configuration['agent-identity']?.goal,
            project: project.brief,
            policy: configuration['agent-safety'],
            conversation: messages.slice(-6),
          }),
        },
        controller.signal,
      );
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          text: `${response.text}\n\nModel: ${response.model}. Prompt-only agent simulation; no tools or external runtime executed.`,
        },
      ]);
    } catch (e) {
      if (!controller.signal.aborted) {
        setError(e instanceof Error ? e.message : 'Agent playground request failed.');
        setInput(prompt);
      }
    } finally {
      setBusy(false);
    }
  };
  return readOnlyControls(
    <section className="panel">
      <div className="row">
        <div>
          <span className="eyebrow">AGENT LIFECYCLE</span>
          <h2>Try the behavior before deploying.</h2>
        </div>
        <div className="segmented">
          {['Build', 'Playground', 'Deploy'].map((t) => (
            <button key={t} aria-pressed={mode === t} onClick={() => setMode(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {mode === 'Build' ? (
        <div className="notice">
          Configure the agent’s role, instructions, memory, output schema and tools in the detailed
          controls below. Save them before running a playground session.
        </div>
      ) : mode === 'Deploy' ? (
        <>
          <p className="muted">
            Export the saved agent definition and configure its target runtime. This action does not
            create or publish a live Lyzr agent.
          </p>
          <button
            className="button"
            onClick={() =>
              download(
                'application-agent.json',
                JSON.stringify(
                  { project: project.id, runtime: 'Configuration export only', configuration },
                  null,
                  2,
                ),
                'application/json',
              )
            }
          >
            Download agent definition
          </button>
          <p className="muted">
            API request examples, masked credential references and A2A cards are available in the
            API / A2A configuration below.
          </p>
        </>
      ) : (
        <>
          <div className="row">
            <label className="field">
              Session name
              <input value={session} onChange={(e) => setSession(e.target.value)} />
            </label>
            <button
              className="button"
              disabled={busy}
              onClick={() => {
                setMessages([]);
                setError('');
                setSession(`Test session ${Date.now().toString().slice(-4)}`);
              }}
            >
              New chat
            </button>
            <button
              className="button"
              onClick={() =>
                download(
                  'agent-session.json',
                  JSON.stringify(
                    { session, project: project.id, revision: project.revision, demo, messages },
                    null,
                    2,
                  ),
                  'application/json',
                )
              }
            >
              Download transcript
            </button>
          </div>
          <div className="agent-playground-messages" aria-live="polite">
            {messages.length ? (
              messages.map((m, i) => (
                <div className={'playground-message ' + m.role} key={i}>
                  <span className="eyebrow">{m.role === 'user' ? 'YOU' : 'APPLICATION AGENT'}</span>
                  <p>{m.text}</p>
                </div>
              ))
            ) : (
              <p className="muted">
                Start a focused test conversation.{' '}
                {demo
                  ? 'Demo mode uses labeled examples.'
                  : 'Signed-in mode sends the saved instructions to the selected OpenRouter model.'}
              </p>
            )}
          </div>
          {error && (
            <div className="notice error" role="alert">
              {error}
            </div>
          )}
          <form
            className="row"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <label className="field" style={{ flex: 1 }}>
              Test message
              <textarea
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a representative user question"
              />
            </label>
            <button className="button primary" disabled={busy || !input.trim()}>
              {busy ? 'Responding…' : 'Send test message'}
            </button>
            {busy && (
              <button
                type="button"
                className="button"
                onClick={() => {
                  abort.current?.abort();
                  notify('Playground request cancelled.');
                }}
              >
                Stop
              </button>
            )}
          </form>
          <p className="muted">
            Responses test instruction-following only. Tool actions, long-term memory, schedules and
            Lyzr runtime execution are not connected here.
          </p>
        </>
      )}
    </section>,
    readOnly,
  );
}
