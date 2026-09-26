export type Theme = 'atelier' | 'current' | 'prism';
export type Mode = 'light' | 'dark' | 'system';
export type Stage = 'Plan' | 'Build' | 'Review' | 'Release';
export type View =
  | 'today'
  | 'projects'
  | 'plan'
  | 'studio'
  | 'review'
  | 'release'
  | 'bots'
  | 'insights'
  | 'products'
  | 'infrastructure'
  | 'people';
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}
export interface Task {
  id: string;
  title: string;
  status: 'Todo' | 'Doing' | 'Done';
}
export interface Project {
  workflow?: Record<string, unknown>;
  html?: string;
  history?: { id: string; html: string; at: string; label: string }[];
  model?: string;
  agentModels?: Record<string, string>;
  id: string;
  title: string;
  brief: string;
  createdAt: string;
  stage: Stage;
  prd: string;
  trd: string;
  revision: number;
  draft: string;
  messages: Message[];
  built: boolean;
  headline: string;
  accent: string;
  tasks: Task[];
  attachments: { name: string; text: string }[];
  repo: string;
  reviewed: boolean;
  release?: { id: string; at: string; environment: string };
}
export interface Bot {
  id: string;
  name: string;
  role: string;
  x: number;
  y: number;
  parent: string | null;
}
export interface Store {
  infrastructure?: import('./infrastructure').InfrastructurePlan;
  company?: Record<string, unknown>;
  version: 1;
  profile: { name: string; workspace: string; kind: 'personal' | 'company'; role?: string } | null;
  theme: Theme;
  mode: Mode;
  compact: boolean;
  activeProject: string | null;
  projects: Project[];
  bots: Bot[];
  infra: { placement: string; provider: string; runtime: string; region: string; expiry: string };
  members: { id: string; name: string; role: string; scope: string }[];
}
export const initialStore: Store = {
  version: 1,
  profile: null,
  theme: 'atelier',
  mode: 'light',
  compact: false,
  activeProject: null,
  projects: [],
  bots: [
    {
      id: 'lead',
      name: 'Delivery lead',
      role: 'Coordinate work and request decisions',
      x: 270,
      y: 35,
      parent: null,
    },
    {
      id: 'research',
      name: 'Researcher',
      role: 'Connect customer evidence to requirements',
      x: 65,
      y: 225,
      parent: 'lead',
    },
    {
      id: 'builder',
      name: 'Builder',
      role: 'Prepare implementation from an approved plan',
      x: 270,
      y: 225,
      parent: 'lead',
    },
    {
      id: 'qa',
      name: 'QA reviewer',
      role: 'Check acceptance criteria and collect evidence',
      x: 475,
      y: 225,
      parent: 'lead',
    },
  ],
  infra: {
    placement: 'Architect managed',
    provider: 'AWS',
    runtime: 'Managed runner',
    region: 'Choose at connection',
    expiry: '2 hours',
  },
  members: [],
};
export const uid = () => crypto.randomUUID();
export function createProject(
  title: string,
  brief: string,
  repo = '',
  id: string = uid(),
): Project {
  const text = brief.trim(),
    name = title.trim() || 'Untitled project';
  const requirements = text
    .split(/(?:\n+|(?<=[.!?])\s+)/)
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 8);
  const purpose =
    text ||
    'Describe the intended user, their problem and the result this application should produce.';
  const inferred = /support|helpdesk|ticket/i.test(text)
    ? [
        'A user can create a request, find it in the inbox and inspect its details.',
        'Status and priority changes are visible, and resolving a request preserves its context.',
      ]
    : /booking|appointment|reservation/i.test(text)
      ? [
          'A user can choose an available option and review the booking details before confirming.',
          'Invalid or conflicting selections show an actionable explanation without losing entered information.',
        ]
      : /inventory|catalog|stock/i.test(text)
        ? [
            'A user can find an item, inspect its details and add or update a record.',
            'Quantities and availability stay consistent after an edit, with validation for invalid values.',
          ]
        : /analytics|dashboard|report|metric/i.test(text)
          ? [
              'A user can select a relevant period or filter and see the corresponding results.',
              'Each metric identifies its meaning and data source; missing data is distinguished from zero.',
            ]
          : /research|knowledge|assistant|agent/i.test(text)
            ? [
                'A user can submit a question or task and inspect the response and its supporting context.',
                'Missing context, uncertain answers and requested tool actions are explained before the user proceeds.',
              ]
            : /task|todo|to-do|kanban/i.test(text)
              ? [
                  'A user can create, find, update and complete a work item.',
                  'Status changes update the relevant list or progress view and can be corrected.',
                ]
              : [
                  'A user can start the primary journey described in the brief and reach a useful result.',
                  'The result and the next available action are clear without requiring the user to restart the journey.',
                ];
  const checklist = [
    ...inferred,
    'Required inputs have accessible labels and useful validation messages.',
    'Loading, empty, error and success states explain what happened and what to do next.',
    'The primary journey works with a keyboard and on narrow and wide screens.',
    'Demo data, simulated integrations and unavailable capabilities are visibly identified.',
  ];
  return {
    id,
    title: name,
    brief: text,
    repo,
    createdAt: new Date().toISOString(),
    stage: 'Plan',
    revision: 1,
    draft: '',
    built: false,
    headline: 'A little more clarity. Every day.',
    accent: '#3a7461',
    reviewed: false,
    attachments: [],
    messages: [],
    tasks: [
      { id: uid(), title: 'Review scope and assumptions', status: 'Todo' },
      { id: uid(), title: 'Build the first useful version', status: 'Todo' },
      { id: uid(), title: 'Verify the core user journey', status: 'Todo' },
    ],
    prd: `# ${name}

> Initial working draft from your brief. The suggested checks below are assumptions to review, not AI-validated requirements. Use AI draft in Plan & docs to expand them.

## User intention
${purpose}

## Requested scope
${requirements.length ? requirements.map((r) => '- ' + r).join('\n') : '- Confirm the primary user and the first useful outcome.'}

## Proposed first release
Deliver one complete journey from the requested scope, with a clear starting action, editable inputs and a useful result. Keep the brief as the source of intent; confirm the details below before expanding scope.

## Suggested acceptance checklist — review before approval
${checklist.map((c) => '- ' + c).join('\n')}

## Assumptions and decisions to confirm
- Who is the primary user, and which actions are allowed for each role?
- What is the smallest useful end-to-end journey for this release?
- Which records must persist between sessions, and who owns them?
- Which integrations must be real, and which may be demonstrated?
- What error cases, accessibility needs and privacy boundaries apply?

## Success measure
Choose a measurable outcome tied to the primary journey, its baseline and a target. No adoption or performance result is assumed.

## Out of scope until approved
Unrequested external writes, purchases, infrastructure provisioning and production claims.`,
    trd: `# ${name} — technical plan

> Initial architecture draft. Confirm implementation choices against the approved requirements.

## Product context
${purpose}

## Current prototype execution boundary
Build Studio generates a standalone HTML, CSS and JavaScript application. The preview runs in an isolated browser frame; external network connections are restricted. Preview record state lasts for that preview session unless a supported persistence path is explicitly implemented.

## Application structure
- Define screens and components around the primary journey in the PRD.
- Specify the records, fields, validation rules and state transitions required by that journey.
- Keep empty, loading, error and success states close to the action that causes them.
- Keep generated-app identity separate from the Architect platform account.

## Decisions required before production
- Data schema, persistence, retention and migrations.
- Authentication, authorization and ownership boundaries.
- Agent responsibilities, model selection and tool permissions where relevant.
- External APIs, secrets, failure handling and service limits.
- Runtime, deployment target, monitoring and recovery.

## Validation plan
${checklist.map((c) => '- ' + c).join('\n')}
- Record actual evidence and its application revision. A demonstration run is not a verified production test.

## Repository
${repo ? 'Reference: ' + repo + '\nSource import and provider permissions must be verified separately.' : 'No repository attached. An owned repository can be connected later.'}`,
  };
}
export function updateProject(s: Store, id: string, patch: Partial<Project>): Store {
  return { ...s, projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) };
}
export function addProject(s: Store, p: Project): Store {
  return { ...s, activeProject: p.id, projects: [p, ...s.projects] };
}
export function canRelease(p: Project): boolean {
  return p.built && p.reviewed;
}
export function buildPatch(p: Project, prompt: string): Partial<Project> {
  const user: Message = { id: uid(), role: 'user', text: prompt, time: new Date().toISOString() };
  const response: Message = {
    id: uid(),
    role: 'assistant',
    text: p.built
      ? 'Your instruction has been recorded in this project. The local scaffold does not interpret arbitrary prompts yet. Use the visual controls to apply a headline or color change.'
      : 'I created the local task-workspace scaffold so you can try the complete build flow. Your brief, PRD and TRD remain attached. This is a fixed local template; a model connection is needed to generate an arbitrary application.',
    time: new Date().toISOString(),
  };
  return {
    built: true,
    stage: 'Build',
    reviewed: false,
    draft: '',
    messages: [...p.messages, user, response],
  };
}
export function readStore(raw: string | null): Store {
  const fallback = () => structuredClone(initialStore);
  if (!raw) return fallback();
  try {
    const p = JSON.parse(raw);
    if (!p || p.version !== 1 || !Array.isArray(p.projects) || !Array.isArray(p.bots))
      return fallback();
    const string = (x: unknown, d = '') => (typeof x === 'string' ? x : d);
    const projects: Project[] = p.projects
      .filter(
        (x: unknown) =>
          !!x &&
          typeof x === 'object' &&
          typeof (x as Project).id === 'string' &&
          typeof (x as Project).title === 'string',
      )
      .map((x: Project) => {
        const d = createProject(x.title, string(x.brief), string(x.repo), x.id);
        return {
          ...d,
          ...x,
          brief: string(x.brief),
          prd: string(x.prd, d.prd),
          trd: string(x.trd, d.trd),
          draft: string(x.draft),
          html: typeof x.html === 'string' ? x.html : undefined,
          headline: string(x.headline, d.headline),
          accent: /^#[a-f0-9]{6}$/i.test(string(x.accent)) ? x.accent : d.accent,
          createdAt: Number.isFinite(Date.parse(x.createdAt)) ? x.createdAt : d.createdAt,
          revision: Number.isInteger(x.revision) && x.revision > 0 ? x.revision : 1,
          stage: ['Plan', 'Build', 'Review', 'Release'].includes(x.stage) ? x.stage : 'Plan',
          built: !!x.built,
          reviewed: !!x.reviewed,
          messages: Array.isArray(x.messages)
            ? x.messages.filter(
                (m) =>
                  m &&
                  typeof m.id === 'string' &&
                  typeof m.text === 'string' &&
                  ['user', 'assistant'].includes(m.role),
              )
            : [],
          attachments: Array.isArray(x.attachments)
            ? x.attachments.filter(
                (a) => a && typeof a.name === 'string' && typeof a.text === 'string',
              )
            : [],
          tasks: Array.isArray(x.tasks)
            ? x.tasks.filter(
                (t) =>
                  t &&
                  typeof t.id === 'string' &&
                  typeof t.title === 'string' &&
                  ['Todo', 'Doing', 'Done'].includes(t.status),
              )
            : d.tasks,
          history: Array.isArray(x.history)
            ? x.history.filter(
                (h) =>
                  h &&
                  typeof h.html === 'string' &&
                  typeof h.id === 'string' &&
                  typeof h.at === 'string' &&
                  typeof h.label === 'string',
              )
            : [],
          agentModels:
            x.agentModels && typeof x.agentModels === 'object'
              ? Object.fromEntries(
                  Object.entries(x.agentModels).filter(([, v]) => typeof v === 'string'),
                )
              : undefined,
        };
      });
    return {
      ...fallback(),
      company:
        p.company && typeof p.company === 'object' && !Array.isArray(p.company)
          ? p.company
          : undefined,
      infrastructure:
        p.infrastructure && typeof p.infrastructure === 'object' ? p.infrastructure : undefined,
      projects,
      activeProject: projects.some((x) => x.id === p.activeProject)
        ? p.activeProject
        : projects[0]?.id || null,
      profile:
        p.profile && typeof p.profile.name === 'string' && typeof p.profile.workspace === 'string'
          ? {
              name: p.profile.name,
              workspace: p.profile.workspace,
              kind: p.profile.kind === 'company' ? 'company' : 'personal',
              role: string(p.profile.role, 'Builder'),
            }
          : null,
      theme: ['atelier', 'current', 'prism'].includes(p.theme) ? p.theme : 'atelier',
      mode: ['light', 'dark', 'system'].includes(p.mode) ? p.mode : 'light',
      compact: !!p.compact,
      bots: p.bots.filter(
        (b: Bot) =>
          b &&
          typeof b.id === 'string' &&
          typeof b.name === 'string' &&
          typeof b.role === 'string' &&
          Number.isFinite(b.x) &&
          Number.isFinite(b.y) &&
          (typeof b.parent === 'string' || b.parent === null),
      ),
      members: Array.isArray(p.members)
        ? p.members.filter(
            (m: Store['members'][number]) =>
              m &&
              typeof m.id === 'string' &&
              typeof m.name === 'string' &&
              typeof m.role === 'string' &&
              typeof m.scope === 'string',
          )
        : [],
      infra:
        p.infra && Object.keys(initialStore.infra).every((k) => typeof p.infra[k] === 'string')
          ? p.infra
          : fallback().infra,
    };
  } catch {
    return fallback();
  }
}
export function escapeHTML(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
}
export function buildHTML(p: Pick<Project, 'title' | 'headline' | 'accent'>): string {
  const accent = /^#[a-f0-9]{6}$/i.test(p.accent) ? p.accent : '#3a7461';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(p.title)}</title><style>*{box-sizing:border-box}body{margin:0;background:#f7f8f3;color:#263c33;font:14px/1.6 system-ui}main{max-width:900px;margin:auto;padding:30px}header{display:flex;justify-content:space-between;border-bottom:1px solid #dce2d7;padding-bottom:18px}h1{font-size:clamp(25px,5vw,42px);line-height:1.15;letter-spacing:-1.6px;margin:50px 0 15px}p{color:#637367}small{font-size:11px}section{margin-top:30px;background:#fff;border:1px solid #dee5d9;border-radius:16px;padding:22px}form{display:flex;gap:8px;margin:20px 0}input{min-width:0;flex:1;padding:12px;border:1px solid #d2ddce;border-radius:8px;font:inherit}button{border:0;border-radius:8px;background:${accent};color:white;padding:10px 15px;cursor:pointer;font:inherit}button:focus-visible,input:focus-visible{outline:3px solid #c5874d;outline-offset:3px}.task{display:flex;gap:12px;align-items:center;padding:13px 0;border-top:1px solid #e5e9e0}.task span{flex:1}.task.done span{text-decoration:line-through;color:#798479}.task button{padding:5px 10px;background:#edf2e9;color:#315340}.error{color:#a9342e}footer{margin:25px 0;font-size:11px;color:#637367}</style></head><body><main><header><strong>${escapeHTML(p.title)}</strong><small>Your daily workspace</small></header><h1>${escapeHTML(p.headline)}</h1><p>Make space for what matters. Start with one small step.</p><section><strong>Your next steps</strong><form id="form"><input id="new" aria-label="New task" placeholder="What would you like to do?" maxlength="160"><button>Add task</button></form><p id="error" role="status"></p><div id="tasks"></div></section><footer>Local scaffold · Task changes last for this preview session.</footer></main><script>const tasks=[{id:1,title:'Invite your team',done:false},{id:2,title:'Plan the first milestone',done:false},{id:3,title:'Make something useful',done:true}];function render(){const root=document.getElementById('tasks');root.replaceChildren();if(!tasks.length){root.textContent='A clear list. Add your next step above.';return}tasks.forEach(t=>{const row=document.createElement('div');row.className='task'+(t.done?' done':'');const check=document.createElement('button');check.textContent=t.done?'✓':'○';check.setAttribute('aria-label',(t.done?'Reopen ':'Complete ')+t.title);check.onclick=()=>{t.done=!t.done;render()};const title=document.createElement('span');title.textContent=t.title;const del=document.createElement('button');del.textContent='×';del.setAttribute('aria-label','Delete '+t.title);del.onclick=()=>{tasks.splice(tasks.indexOf(t),1);render()};row.append(check,title,del);root.append(row)})}document.getElementById('form').onsubmit=e=>{e.preventDefault();const el=document.getElementById('new');if(!el.value.trim()){document.getElementById('error').textContent='Enter a task first.';return}tasks.push({id:Date.now(),title:el.value.trim(),done:false});el.value='';document.getElementById('error').textContent='';render()};render();<\/script></body></html>`;
}
