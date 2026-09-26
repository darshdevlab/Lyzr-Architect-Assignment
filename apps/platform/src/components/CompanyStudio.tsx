import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Plus,
  Search,
  Layers,
  Users,
  Target,
  MessageSquare,
  TrendingUp,
  Check,
  ChevronRight,
  Download,
  Clock,
  ShieldCheck,
  GitBranch,
  Play,
  Pause,
  Archive,
  RotateCcw,
  Link2,
  Coins,
  Calendar,
  Building2,
  Workflow,
  CheckCircle2,
} from 'lucide-react';
import type { Store } from '../lib/model';
import { createProject } from '../lib/model';
import { Modal } from './UI';
import { CompanyRolePreset } from './CompanyRolePreset';
import { CompanyRecordWorkspace } from './CompanyRecordWorkspace';
import {
  recordMeta,
  reviseRecord,
  hasApproval,
  companyEvidence,
  voteRecord,
  type Actor,
} from '../lib/company-workflows';
import { generate } from '../lib/cloud';
import {
  companyFeatures,
  companySchemas,
  companyDefaults,
  normalizeCompany,
  makeCompanyRecord,
  validateCompanyRecord,
  currencyTotal,
  capacitySummary,
  roleHome,
  roleRoutes,
  canonicalCompanyRole,
  type CompanyDraft,
  type CompanyData,
  type CompanyRecord,
  type CompanyFeature,
} from '../lib/company-features';
import './company-studio.css';

type CompanyNavigation = {
  recordId?: string;
  sourceId?: string;
  returnView?: string;
  tab?: string;
  featureId?: string;
  document?: 'prd' | 'trd';
};
type Props = {
  actor?: Actor;
  canManage?: boolean;
  workspaceName?: string;
  navigationContext?: CompanyNavigation;
  readOnly?: boolean;
  area: string;
  store: Store;
  onChange: (s: Store) => void;
  onNavigate: (v: string, context?: CompanyNavigation) => void;
  notify: (s: string) => void;
  demo: boolean;
  role: string;
};
const areas: Record<
  string,
  { title: string; subtitle: string; label: string; icon: typeof Layers }
> = {
  company: {
    title: 'One company. A shared direction.',
    subtitle: 'Connect the people, decisions and projects moving your company forward.',
    label: 'Company portfolio',
    icon: Building2,
  },
  delivery: {
    title: 'Good intentions. Clear next steps.',
    subtitle: 'Bring ideas, product decisions and delivery into one continuous flow.',
    label: 'Product & delivery',
    icon: Layers,
  },
  revenue: {
    title: 'Relationships, with momentum.',
    subtitle: 'One account story, from the first conversation to the commercial handoff.',
    label: 'Customer & revenue',
    icon: TrendingUp,
  },
  success: {
    title: 'A closer connection to customers.',
    subtitle: 'Listen carefully. Make the work visible. Close the loop.',
    label: 'Customer success',
    icon: MessageSquare,
  },
  finance: {
    title: 'A thoughtful place for every dollar.',
    subtitle: 'Review commitments, allocate resources and understand what changed.',
    label: 'Finance & costs',
    icon: Coins,
  },
  people: {
    title: 'A company is its people.',
    subtitle: 'Coordinate team capacity, onboarding and meaningful, agreed outcomes.',
    label: 'People & teams',
    icon: Users,
  },
  metrics: {
    title: 'Make the signal useful.',
    subtitle: 'Define the measure, inspect its source and connect it to a decision.',
    label: 'Metrics & decisions',
    icon: Target,
  },
  growth: {
    title: 'Bring the right story to market.',
    subtitle: 'Shape campaigns, review claims and launch with the whole company ready.',
    label: 'Marketing & growth',
    icon: TrendingUp,
  },
  botteams: {
    title: 'A team behind every ambition.',
    subtitle:
      'Give a lead bot a clear goal. Keep delegation, evidence and human decisions visible.',
    label: 'Bot teams',
    icon: Workflow,
  },
  mcp: {
    title: 'Keep the work connected.',
    subtitle: 'Bring existing systems into the same context, with clear ownership and permissions.',
    label: 'Connections & sync',
    icon: Link2,
  },
};
const primary: Record<string, string> = {
  company: 'ORG-N2',
  delivery: 'PLAN-N1',
  revenue: 'CRM-N3',
  success: 'CX-N1',
  finance: 'FIN-N1',
  people: 'PEOPLE-N1',
  metrics: 'BI-N1',
  growth: 'MKT-N1',
  botteams: 'AGENT-N1',
  mcp: 'DATA-N2',
};
const exportFile = (name: string, value: unknown) => {
  const url = URL.createObjectURL(
    new Blob([typeof value === 'string' ? value : JSON.stringify(value, null, 2)], {
      type: typeof value === 'string' ? 'text/plain' : 'application/json',
    }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
const money = (n: number, currency = 'USD') =>
  new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
function exampleRecords(projectId: string, name: string): CompanyRecord[] {
  const account = makeCompanyRecord(
    'CRM-N1',
    'Fable Labs',
    name,
    {
      company: 'Fable Labs',
      industry: 'Developer tools',
      contact: 'Customer team',
      preference: 'Ask before outreach',
    },
    projectId,
    'Active',
  );
  const rows = [
    account,
    makeCompanyRecord(
      'CRM-N3',
      'Customer workspace expansion',
      name,
      {
        accountId: account.id,
        amount: '12000',
        currency: 'USD',
        probability: '60',
        next: 'Review pilot feedback',
      },
      projectId,
      'Proposal',
    ),
    makeCompanyRecord(
      'CX-N1',
      'Make the first setup feel simpler',
      name,
      {
        accountId: account.id,
        theme: 'Onboarding',
        quote: 'We want a clearer explanation of the next step after importing a project.',
        impact: 'High',
        source: 'Example customer interview',
      },
      projectId,
      'Triaged',
    ),
    makeCompanyRecord(
      'PLAN-N1',
      'Improve the first-project handoff',
      name,
      {
        kind: 'Story',
        sprint: 'Sprint 01',
        estimate: '3',
        acceptance:
          'A new user sees a clear next step and can reach the builder without returning home.',
      },
      projectId,
      'In progress',
    ),
    makeCompanyRecord(
      'PLAN-N4',
      'A guided setup checklist',
      name,
      {
        cluster: 'Activation',
        evidence: 'Example feedback: first-time users need more direction.',
        votes: '4',
      },
      projectId,
      'Shortlisted',
    ),
    makeCompanyRecord(
      'PLAN-N5',
      'A confident first release',
      name,
      {
        goal: 'Improve activation',
        horizon: 'Now',
        capacity: '12',
        assumptions: 'Validate with a small pilot first',
      },
      projectId,
      'Planned',
    ),
    makeCompanyRecord(
      'FIN-N1',
      'Prototype operating budget',
      name,
      {
        amount: '500',
        spent: '180',
        currency: 'USD',
        department: 'Product & engineering',
        period: 'Example quarter',
      },
      projectId,
      'Approved',
    ),
    makeCompanyRecord(
      'PEOPLE-N1',
      name,
      name,
      { team: 'Product', role: 'Product manager', skills: 'Discovery, delivery, systems thinking' },
      projectId,
      'Active',
    ),
    makeCompanyRecord(
      'PEOPLE-N3',
      'Product & engineering sprint',
      name,
      {
        team: 'Product & engineering',
        period: 'Sprint 01',
        capacity: '120',
        allocated: '92',
        leave: '8',
      },
      projectId,
      'Confirmed',
    ),
    makeCompanyRecord(
      'BI-N1',
      'First-project activation',
      name,
      {
        formula: 'users who complete a first build / signed-up users',
        source: 'Example dataset',
        current: '42',
        target: '60',
        unit: '%',
        timeframe: 'Example 30-day period',
        cohort: 'New users',
      },
      projectId,
      'Defined',
    ),
    makeCompanyRecord(
      'MKT-N1',
      'A calmer way to build',
      name,
      {
        audience: 'Small product teams',
        goal: 'Introduce the shared project workflow',
        channels: 'Website, product demo',
        budget: '0',
      },
      projectId,
      'Planned',
    ),
    makeCompanyRecord(
      'AGENT-N1',
      'Product delivery team',
      name,
      {
        lead: 'Delivery coordinator',
        goal: 'Review customer evidence and propose a scoped improvement.',
        specialists: 'Research, planning, independent review',
        approval: 'Before external actions',
      },
      projectId,
      'Ready',
    ),
  ];
  return rows.map((r) => ({ ...r, sample: true }));
}

export function CompanyStudio({
  area,
  store,
  onChange,
  onNavigate,
  notify,
  demo,
  role,
  readOnly = false,
  actor,
  canManage = false,
  workspaceName,
  navigationContext,
}: Props) {
  area = area === 'sync' ? 'mcp' : area;
  const info = areas[area] || areas.company;
  const AreaIcon = info.icon;
  const data = useMemo(() => normalizeCompany(store.company), [store.company]);
  const storeRef = useRef(store);
  storeRef.current = store;
  const [inspecting, setInspecting] = useState<string | null>(null);
  const areaViews = useRef<
    Record<string, { tab: string; query: string; filter: string; featureFilter: string }>
  >({});
  const [period, setPeriod] = useState('All periods'),
    [teamFilter, setTeamFilter] = useState('All teams');
  const [tab, setTab] = useState('Overview'),
    [query, setQuery] = useState(''),
    [filter, setFilter] = useState('All'),
    [featureFilter, setFeatureFilter] = useState(primary[area] || 'ORG-N2');
  const [editing, setEditing] = useState<{
      feature: string;
      record?: CompanyRecord;
      prefill?: Partial<CompanyRecord>;
    } | null>(null),
    [drag, setDrag] = useState<string | null>(null),
    [showArchived, setShowArchived] = useState(false),
    [department, setDepartment] = useState(canonicalCompanyRole(role));
  const [botInput, setBotInput] = useState(''),
    [botBusy, setBotBusy] = useState(false),
    [botError, setBotError] = useState(''),
    [selectedTeam, setSelectedTeam] = useState('');
  const botAbort = useRef<AbortController | null>(null);
  useEffect(() => () => botAbort.current?.abort(), []);
  useEffect(() => {
    const old = areaViews.current[area];
    setTab(old?.tab || 'Overview');
    setQuery(old?.query || '');
    setFilter(old?.filter || 'All');
    setFeatureFilter(old?.featureFilter || primary[area] || 'ORG-N2');
    setEditing(null);
  }, [area]);
  useEffect(() => {
    areaViews.current[area] = { tab, query, filter, featureFilter };
  }, [area, tab, query, filter, featureFilter]);
  useEffect(() => {
    const id = navigationContext?.recordId || new URLSearchParams(location.search).get('record');
    setInspecting(id || null);
  }, [area, navigationContext?.recordId]);
  const project = store.projects.find((p) => p.id === store.activeProject) || null;
  const name = actor?.name || store.profile?.name || 'Workspace owner';
  const currentActor = actor || { id: 'demo:' + name, name };
  const home = roleHome(role);
  const featureList = companyFeatures.filter((f) => f.area === area);
  const scopedRecords = data.records.filter(
    (r) =>
      (period === 'All periods' || (r.values.period || r.values.sprint) === period) &&
      (teamFilter === 'All teams' ||
        r.values.team === teamFilter ||
        r.values.department === teamFilter),
  );
  const records = scopedRecords.filter(
    (r) =>
      companyFeatures.find((f) => f.id === r.feature)?.area === area &&
      (showArchived || !r.archived),
  );
  const accountRecords = data.records.filter((r) => r.feature === 'CRM-N1' && !r.archived);
  const teamRecords = data.records.filter((r) => r.feature === 'AGENT-N1' && !r.archived);
  const commit = (patch: Partial<CompanyData>, storePatch: Partial<Store> = {}) => {
    if (readOnly) {
      notify('Your Viewer membership is read-only.');
      return;
    }
    const next = {
      ...storeRef.current,
      ...storePatch,
      company: { ...normalizeCompany(storeRef.current.company), ...patch } as unknown as Record<
        string,
        unknown
      >,
    };
    storeRef.current = next;
    onChange(next);
  };
  const allCurrent = () => normalizeCompany(storeRef.current.company).records;
  const openFeature = (id: string, prefill?: Partial<CompanyRecord>) => {
    if (readOnly) {
      notify('Your Viewer membership can inspect records, but cannot create or edit them.');
      return;
    }
    setEditing({ feature: id, prefill });
  };
  const save = (record: CompanyRecord) => {
    if (readOnly) {
      notify('Your Viewer membership is read-only.');
      return;
    }
    const existing = allCurrent();
    const previous = existing.find((r) => r.id === record.id);
    const revised = reviseRecord(previous, record, currentActor);
    commit({
      records: previous
        ? existing.map((r) => (r.id === record.id ? revised : r))
        : [revised, ...existing],
    });
    notify(
      demo
        ? 'Saved on this device.'
        : 'Record updated; account saving continues in the workspace status.',
    );
  };
  const move = (r: CompanyRecord, stage: string) => {
    if (
      /Approved|Won|Activated|Published|Released|Verified|Complete|Ship|Resolved/.test(stage) &&
      !hasApproval(r)
    ) {
      notify('Review the current record revision before marking this outcome.');
      setInspecting(r.id);
      return;
    }
    if (readOnly) {
      notify('Your Viewer membership is read-only.');
      return;
    }
    const errors = validateCompanyRecord(r.feature, r.title, r.owner, r.values, stage);
    if (errors.length) {
      notify(errors[0]);
      setEditing({ feature: r.feature, record: r });
      return;
    }
    save({
      ...r,
      stage,
      updatedAt: new Date().toISOString(),
      history: [
        ...r.history,
        { at: new Date().toISOString(), stage, note: 'Workflow stage updated' },
      ],
    });
  };
  const archive = (r: CompanyRecord) => {
    if (readOnly) return;
    save({
      ...r,
      archived: !r.archived,
      updatedAt: new Date().toISOString(),
      history: [
        ...r.history,
        {
          at: new Date().toISOString(),
          stage: r.stage,
          note: r.archived ? 'Restored from archive' : 'Archived — reversible',
        },
      ],
    });
    notify(
      r.archived ? 'Record restored.' : 'Record archived. Show archived records to restore it.',
    );
  };
  const inspect = (r: CompanyRecord, source?: CompanyRecord) => {
    setEditing(null);
    setInspecting(r.id);
    const dest = companyFeatures.find((f) => f.id === r.feature)?.area || area;
    onNavigate(dest === 'mcp' ? 'sync' : dest, {
      recordId: r.id,
      sourceId: source?.id || r.sourceId,
      returnView: area === 'mcp' ? 'sync' : area,
    });
  };
  const navigate = (view: string, r?: CompanyRecord) => {
    if (r?.projectId && store.projects.some((p) => p.id === r.projectId)) {
      const next = {
        ...storeRef.current,
        activeProject: r.projectId,
        projects: storeRef.current.projects.map((p) =>
          p.id === r.projectId && ['studio', 'code', 'qa', 'ops', 'plan'].includes(view)
            ? {
                ...p,
                draft: `Continue linked ${r.feature}: ${r.title}\n${companyEvidence(r)}\nSource record: ${r.id}`,
                workflow: {
                  ...p.workflow,
                  companyContext: {
                    recordId: r.id,
                    title: r.title,
                    values: r.values,
                    revision: recordMeta(r).revision,
                  },
                },
              }
            : p,
        ),
      };
      storeRef.current = next;
      if (!readOnly) onChange(next);
    }
    onNavigate(view === 'mcp' ? 'sync' : view, {
      sourceId: r?.id,
      returnView: area === 'mcp' ? 'sync' : area,
    });
  };
  const createLinked = (feature: string, values: Record<string, string>, source: CompanyRecord) => {
    if (readOnly) return;
    const existing = allCurrent().find(
      (x) => x.feature === feature && x.sourceId === source.id && !x.archived,
    );
    if (existing) {
      inspect(existing, source);
      return;
    }
    const item = {
      ...makeCompanyRecord(
        feature,
        `${companySchemas[feature].noun} · ${source.title}`,
        values.nextOwner || source.owner,
        { ...values, sourceEvidence: companyEvidence(source) },
        source.projectId,
      ),
      sourceId: source.id,
      meta: {
        ...recordMeta(source),
        revision: 1,
        snapshots: [],
        review: undefined,
        comments: [],
        links: [{ id: source.id, relation: 'Source evidence' }],
        checklist: [],
        voters: [],
        runs: [],
      },
    };
    commit({
      records: [
        item,
        ...allCurrent().map((x) =>
          x.id === source.id
            ? {
                ...x,
                meta: {
                  ...recordMeta(x),
                  links: [...recordMeta(x).links, { id: item.id, relation: 'Outcome' }],
                },
              }
            : x,
        ),
      ],
    });
    inspect(item, source);
  };
  const convertTask = (r: CompanyRecord) => {
    if (readOnly) {
      notify('Your Viewer membership cannot create delivery work.');
      return;
    }
    createLinked(
      'PLAN-N1',
      {
        kind: r.feature === 'CX-N2' ? 'Bug' : 'Task',
        acceptance: companyEvidence(r),
        dependency: r.id,
        accountId: r.values.accountId || '',
      },
      r,
    );
    if (['PLAN-N4', 'CX-N1'].includes(r.feature)) {
      const current = allCurrent().find((x) => x.id === r.id) || r;
      save({ ...current, stage: r.feature === 'PLAN-N4' ? 'Converted' : 'Linked to work' });
    }
  };
  const commercialHandoff = (r: CompanyRecord) => {
    if (!hasApproval(r)) {
      notify('Request independent approval of this revision before a commercial handoff.');
      inspect(r);
      return;
    }
    if (!r.values.accountId || !r.values.handoff) {
      notify('Link an account and name the customer-success owner before handoff.');
      setEditing({ feature: r.feature, record: r });
      setInspecting(null);
      return;
    }
    if (r.feature === 'FIN-N4' && r.stage !== 'Approved internally') {
      notify('Only an approved commercial decision can start onboarding.');
      inspect(r);
      return;
    }
    const target = r.feature === 'CRM-N5' ? 'FIN-N4' : 'CX-N3';
    const values: Record<string, string> =
      target === 'FIN-N4'
        ? {
            accountId: r.values.accountId,
            proposal: r.id,
            amount: r.values.amount || '',
            currency: r.values.currency || 'USD',
            case: r.values.scope || r.title,
            terms: r.values.terms || '',
            expiry: r.values.expiry || '',
            handoff: r.values.handoff,
          }
        : {
            accountId: r.values.accountId,
            milestone: 'Agree on customer activation outcome',
            checklist:
              'Confirm approved scope and terms; verify commitments; assign activation tasks',
            commercialEvidence: companyEvidence(r),
            nextOwner: r.values.handoff,
          };
    createLinked(target, values, r);
  };
  const fromBlueprint = (r: CompanyRecord) => {
    if (readOnly) return;
    if (r.stage !== 'Approved' || !hasApproval(r)) {
      notify('Approve the current blueprint revision before creating a project.');
      inspect(r);
      return;
    }
    const p = createProject(
      `${r.title} · new project`,
      `Created from blueprint ${r.title}, version ${r.values.version || 'draft'}.\n${companyEvidence(r)}`,
    );
    p.workflow = {
      blueprint: {
        id: r.id,
        revision: recordMeta(r).revision,
        values: { ...r.values },
        dependencies: recordMeta(r).links,
        requiresConnectionAuthorization: true,
      },
      designSystem: r.values.design,
      agentTeam: r.values.agents,
      modelPolicy: r.values.models,
    };
    commit({}, { projects: [p, ...storeRef.current.projects], activeProject: p.id });
    notify(
      'Independent project created with a complete blueprint snapshot. Connections require separate authorization.',
    );
    setInspecting(null);
    onNavigate('plan', { sourceId: r.id, returnView: 'company' });
  };
  const continueRecord = (r: CompanyRecord) => {
    setInspecting(null);
    if (['CX-N1', 'PLAN-N4', 'OPS-N4', 'BI-N3', 'BI-N4', 'AGENT-N1'].includes(r.feature)) {
      convertTask(r);
      return;
    }
    if (r.feature === 'CX-N2') {
      navigate('ops', r);
      return;
    }
    if (['CRM-N5', 'FIN-N4'].includes(r.feature)) {
      commercialHandoff(r);
      return;
    }
    if (r.feature === 'ORG-N4') {
      fromBlueprint(r);
      return;
    }
    const linkedId =
      r.values.followup ||
      r.values.metric ||
      r.values.accountId ||
      r.values.match ||
      r.values.release;
    const linked = allCurrent().find((x) => x.id === linkedId);
    if (
      linked &&
      companyFeatures.find((f) => f.id === linked.feature)?.area === companySchemas[r.feature].next
    ) {
      inspect(linked, r);
      return;
    }
    const nextFeature: Record<string, string> = {
      'CRM-N2': 'CRM-N3',
      'CRM-N3': 'CRM-N5',
      'CRM-N4': 'AGENT-N3',
      'CX-N3': 'BI-N1',
      'CX-N5': 'MKT-N4',
      'PLAN-N5': 'BI-N4',
      'PEOPLE-N4': 'BI-N1',
      'BI-N5': 'AGENT-N3',
      'BI-N6': 'MKT-N1',
      'MKT-N1': 'BI-N1',
      'MKT-N2': 'MKT-N4',
      'MKT-N5': 'CRM-N2',
    };
    if (nextFeature[r.feature]) {
      createLinked(
        nextFeature[r.feature],
        {
          accountId: r.values.accountId || '',
          campaign: r.values.campaign || r.id,
          asset: r.feature === 'MKT-N2' ? r.id : '',
          evidence: companyEvidence(r),
          goal: r.values.goal || r.title,
          team: r.values.team || '',
          schedule: r.values.cadence || 'Manual',
          audience: r.values.audience || '',
          content: r.values.content || '',
        },
        r,
      );
      return;
    }
    navigate(companySchemas[r.feature].next, r);
  };
  const duplicateWarning = (record: CompanyRecord) =>
    ['CRM-N1', 'CRM-N2'].includes(record.feature) &&
    data.records.some(
      (r) =>
        r.id !== record.id &&
        !r.archived &&
        ((record.values.email &&
          r.values.email?.toLowerCase() === record.values.email.toLowerCase()) ||
          (record.values.company &&
            r.values.company?.toLowerCase() === record.values.company.toLowerCase())),
    );
  const visible = records.filter(
    (r) =>
      (featureFilter === 'All' || r.feature === featureFilter) &&
      (filter === 'All' || r.stage === filter) &&
      (r.title + ' ' + r.owner + ' ' + Object.values(r.values).join(' '))
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const currency = data.selectedCurrency;
  const allocated = currencyTotal(
      scopedRecords.filter((r) => ['Approved', 'Frozen'].includes(r.stage)),
      'FIN-N1',
      'amount',
      currency,
    ),
    spent = currencyTotal(scopedRecords, 'FIN-N1', 'spent', currency);
  const capacity = capacitySummary(scopedRecords);
  const tasks = scopedRecords.filter((r) => r.feature === 'PLAN-N1' && !r.archived);
  const activeCount = data.records.filter((r) => !r.archived).length;
  const card = (r: CompanyRecord, compact = false) => (
    <RecordCard
      key={r.id}
      record={r}
      account={accountRecords.find((a) => a.id === r.values.accountId)?.title}
      projectName={store.projects.find((p) => p.id === r.projectId)?.title}
      onEdit={() => inspect(r)}
      onMove={(stage) => move(r, stage)}
      onHandoff={() => continueRecord(r)}
      onArchive={() => archive(r)}
      onDrag={() => setDrag(r.id)}
      compact={compact}
      readOnly={readOnly}
    />
  );
  const featureCards = (
    <div className="company-feature-grid">
      {featureList.map((f) => (
        <button
          className="company-feature-card"
          key={f.id}
          disabled={readOnly}
          onClick={() => openFeature(f.id)}
        >
          <span className="eyebrow">{f.id}</span>
          <h3>{f.title}</h3>
          <p>{f.scope}</p>
          <span>
            Create {companySchemas[f.id].noun} <ArrowUpRight size={15} />
          </span>
        </button>
      ))}
    </div>
  );
  const sendBot = async () => {
    if (readOnly || !botInput.trim() || botBusy) return;
    const prompt = botInput.trim();
    setBotInput('');
    setBotError('');
    setBotBusy(true);
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      author: currentActor,
      text: prompt,
      at: new Date().toISOString(),
      teamId: selectedTeam,
    };
    commit({ messages: [...normalizeCompany(storeRef.current.company).messages, userMessage] });
    const controller = new AbortController();
    botAbort.current = controller;
    try {
      let answer = '';
      if (demo)
        answer = `Demo team proposal\n\nGoal: ${prompt}\n\n1. Research specialist collects the relevant evidence.\n2. Delivery specialist proposes a bounded task.\n3. Independent reviewer checks the assumptions and permissions.\n\nThis is an authored rehearsal. No bots or tools executed. Review the proposal before creating delegated work.`;
      else {
        const team = teamRecords.find((r) => r.id === selectedTeam);
        const response = await generate(
          {
            prompt,
            mode: 'chat',
            model: project?.model || 'auto',
            context: JSON.stringify({
              role: 'Company lead bot; provide a proposal, not a claim of autonomous execution.',
              team: team
                ? {
                    goal: team.values.goal,
                    specialists: team.values.specialists,
                    approval: team.values.approval,
                  }
                : undefined,
              project: project ? { title: project.title, brief: project.brief } : undefined,
              policy:
                'No external writes or tool execution. Ask for human decisions. Cite only provided evidence. Do not make employment decisions or financial transactions.',
              recentConversation: normalizeCompany(storeRef.current.company)
                .messages.filter((m) => m.teamId === selectedTeam)
                .slice(-6),
            }),
          },
          controller.signal,
        );
        answer =
          response.text +
          `\n\nModel: ${response.model}. This is an AI planning response; specialist execution and external tool actions have not occurred.`;
      }
      commit({
        messages: [
          ...normalizeCompany(storeRef.current.company).messages,
          {
            id: crypto.randomUUID(),
            role: 'assistant' as const,
            text: answer,
            at: new Date().toISOString(),
            teamId: selectedTeam,
          },
        ],
      });
    } catch (e) {
      if (!controller.signal.aborted) {
        setBotError(e instanceof Error ? e.message : 'The bot conversation could not complete.');
        setBotInput(prompt);
      }
    } finally {
      setBotBusy(false);
    }
  };
  return (
    <div className="company-studio" data-company-area={area}>
      {readOnly && (
        <div className="notice">
          <ShieldCheck size={16} /> Viewer access · browse company records and history. An
          authorized member must make changes.
        </div>
      )}
      <header className="page-title">
        <div>
          <div className="eyebrow">ARCHITECT 3.0 / {info.label.toUpperCase()}</div>
          <h1>{info.title}</h1>
          <p>{info.subtitle}</p>
        </div>
        <div className="row">
          <button
            className="button"
            onClick={() =>
              exportFile(`${area}-workspace.json`, {
                area,
                records,
                exportedAt: new Date().toISOString(),
                externalActions: 'Not executed',
              })
            }
          >
            <Download size={15} />
            Export
          </button>
          <button
            className="button primary"
            disabled={readOnly}
            onClick={() => openFeature(primary[area] || 'ORG-N2')}
          >
            <Plus size={15} />
            New {companySchemas[primary[area] || 'ORG-N2'].noun}
          </button>
        </div>
      </header>
      {navigationContext?.sourceId &&
        data.records.find((r) => r.id === navigationContext.sourceId) && (
          <div className="company-breadcrumb">
            <button
              className="button"
              onClick={() =>
                inspect(data.records.find((r) => r.id === navigationContext.sourceId)!)
              }
            >
              ← Back to {data.records.find((r) => r.id === navigationContext.sourceId)?.title}
            </button>
          </div>
        )}
      <div className="company-context">
        <span>
          <AreaIcon size={15} />
          {workspaceName || store.profile?.workspace || 'Company workspace'}
        </span>
        <span>{role || 'Product manager'} view</span>
        {project && (
          <button onClick={() => onNavigate('plan')}>
            {project.title}
            <ArrowUpRight size={13} />
          </button>
        )}
        <span className="company-context-save">
          Shared workspace records · {demo ? 'on this device' : 'account save enabled'}
        </span>
      </div>
      {!activeCount && (
        <div className="company-welcome">
          <div>
            <strong>Start with your company’s work.</strong>
            <p>Create an owned record, or explore an explicitly labeled example workspace.</p>
          </div>
          <button
            className="button"
            disabled={readOnly}
            onClick={() => {
              commit({ records: exampleRecords(project?.id || '', name) });
              notify('Example company records loaded. Each sample is labeled and can be archived.');
            }}
          >
            Load example records
          </button>
        </div>
      )}
      {data.records.some((r) => r.sample && !r.archived) && (
        <div className="company-sample">
          <span className="status">Example data</span>Sample records are labeled individually.
          Metrics below use entered records, not live external analytics.
        </div>
      )}
      <div className="segmented company-tabs" role="tablist" aria-label={`${info.label} views`}>
        {['Overview', 'Records', 'Feature flows', 'Activity'].map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
            {t}
            {t === 'Feature flows' && <span>{featureList.length}</span>}
          </button>
        ))}
      </div>
      {['finance', 'people', 'delivery', 'revenue'].includes(area) && (
        <div className="row">
          <label className="field">
            Planning period
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option>All periods</option>
              {[
                ...new Set(
                  data.records.map((r) => r.values.period || r.values.sprint).filter(Boolean),
                ),
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Team / department
            <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
              <option>All teams</option>
              {[
                ...new Set(
                  data.records.flatMap((r) => [r.values.team, r.values.department]).filter(Boolean),
                ),
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      {tab === 'Overview' && (
        <>
          {area === 'company' && (
            <>
              <section className="company-role-hero">
                <div>
                  <span className="eyebrow">YOUR ROLE. YOUR NEXT MOVE.</span>
                  <h2>{home.intro}</h2>
                  <p>{home.focus}</p>
                  <div className="row">
                    {(data.departmentViews[canonicalCompanyRole(role)] || home.areas).map((v) => (
                      <button className="button primary" key={v} onClick={() => navigate(v)}>
                        {areas[v]?.label ||
                          (
                            {
                              code: 'Code & repositories',
                              qa: 'Test lab',
                              release: 'Release',
                              design: 'Design & journeys',
                              ops: 'Observe',
                              plan: 'Plan & docs',
                              studio: 'Build studio',
                              agents: 'Agent studio',
                            } as Record<string, string>
                          )[v] ||
                          v}
                        <ArrowUpRight size={15} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="company-role-orbit" aria-hidden="true">
                  <span>ONE SHARED CONTEXT</span>
                  <div>
                    People
                    <br />
                    Ideas
                    <br />
                    Progress
                  </div>
                  <i />
                  <i />
                  <i />
                </div>
              </section>
              {data.rolePresets?.[canonicalCompanyRole(role)] && (
                <div className="notice">
                  Team defaults v{data.rolePresets[canonicalCompanyRole(role)].version} ·{' '}
                  {data.rolePresets[canonicalCompanyRole(role)].widgets}
                  <br />
                  Focus: {data.rolePresets[canonicalCompanyRole(role)].filters}
                  <br />
                  Templates:{' '}
                  {data.rolePresets[canonicalCompanyRole(role)].templates || 'No override'} ·
                  Workflow guidance:{' '}
                  {data.rolePresets[canonicalCompanyRole(role)].workflows || 'No override'}
                </div>
              )}
              <div className="company-stats">
                {[
                  [String(store.projects.length), 'Connected projects'],
                  [String(tasks.filter((r) => r.stage !== 'Done').length), 'Open delivery items'],
                  [
                    String(
                      data.records.filter((r) => /review|approval/i.test(r.stage) && !r.archived)
                        .length,
                    ),
                    'Decisions to review',
                  ],
                  [
                    String(data.records.filter((r) => r.feature === 'BI-N4' && !r.archived).length),
                    'Shared business goals',
                  ],
                ].map(([v, l]) => (
                  <div className="panel" key={l}>
                    <span>{l}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
              <div className="company-two">
                <section className="panel">
                  <div className="company-panel-title">
                    <div>
                      <span className="eyebrow">PRODUCT PORTFOLIO</span>
                      <h2>The work behind the strategy.</h2>
                    </div>
                    <button
                      className="button"
                      disabled={readOnly}
                      onClick={() => openFeature('ORG-N2')}
                    >
                      Add product
                    </button>
                  </div>
                  {store.projects.length ? (
                    <div className="company-projects">
                      {store.projects.map((p, i) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onChange({ ...storeRef.current, activeProject: p.id });
                            onNavigate('plan');
                          }}
                        >
                          <span className={`company-project-art art-${i % 3}`}>
                            <Layers size={23} />
                          </span>
                          <span>
                            <strong>{p.title}</strong>
                            <small>
                              {p.stage} · revision {p.revision}
                            </small>
                          </span>
                          <ArrowUpRight size={16} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <EmptyCompany
                      text="Your product portfolio begins with a project."
                      action={() => onNavigate('projects')}
                      label="Create project"
                    />
                  )}
                  <div className="company-inline-records">
                    {records.filter((r) => r.feature === 'ORG-N2').map((r) => card(r, true))}
                  </div>
                </section>
                <CompanyRolePreset
                  data={data}
                  canManage={canManage && !readOnly}
                  onPublish={(patch) => {
                    if (canManage) commit(patch);
                  }}
                />
              </div>
              <section className="panel">
                <div className="company-panel-title">
                  <h2>Company blueprints</h2>
                  <button
                    className="button"
                    disabled={readOnly}
                    onClick={() => openFeature('ORG-N4')}
                  >
                    Create blueprint
                  </button>
                </div>
                <p className="muted">
                  Approved design systems, agent teams and model rules—reusable without copying
                  account permissions.
                </p>
                <div className="company-card-grid">
                  {records.filter((r) => r.feature === 'ORG-N4').map((r) => card(r))}
                </div>
                {!records.some((r) => r.feature === 'ORG-N4') && (
                  <EmptyCompany
                    text="Save an approved company pattern, then instantiate independent projects with deliberate overrides."
                    action={() => openFeature('ORG-N4')}
                    label="Define the first blueprint"
                  />
                )}
              </section>
            </>
          )}
          {area === 'delivery' && (
            <>
              <div className="company-stats">
                <div className="panel">
                  <span>Active sprint items</span>
                  <strong>{tasks.filter((r) => r.stage === 'In progress').length}</strong>
                </div>
                <div className="panel">
                  <span>Estimated points</span>
                  <strong>
                    {tasks.reduce((sum, r) => sum + (Number(r.values.estimate) || 0), 0)}
                  </strong>
                </div>
                <div className="panel">
                  <span>Ideas to consider</span>
                  <strong>
                    {
                      records.filter((r) => r.feature === 'PLAN-N4' && r.stage !== 'Converted')
                        .length
                    }
                  </strong>
                </div>
                <div className="panel">
                  <span>Roadmap initiatives</span>
                  <strong>{records.filter((r) => r.feature === 'PLAN-N5').length}</strong>
                </div>
              </div>
              <section className="panel">
                <div className="company-panel-title">
                  <div>
                    <span className="eyebrow">DELIVERY BOARD</span>
                    <h2>Small steps. Visible momentum.</h2>
                  </div>
                  <button
                    className="button"
                    disabled={readOnly}
                    onClick={() => openFeature('PLAN-N1')}
                  >
                    Add work item
                  </button>
                </div>
                <CompanyBoard
                  records={records.filter((r) => r.feature === 'PLAN-N1')}
                  stages={companySchemas['PLAN-N1'].stages}
                  render={(r) => card(r, true)}
                  onDrop={(id, stage) => {
                    const r = data.records.find((x) => x.id === id);
                    if (r) move(r, stage);
                  }}
                  dragId={drag}
                />
              </section>
              <div className="company-two">
                <section className="panel">
                  <div className="company-panel-title">
                    <h2>Ideas worth exploring</h2>
                    <button
                      className="button"
                      disabled={readOnly}
                      onClick={() => openFeature('PLAN-N4')}
                    >
                      Add idea
                    </button>
                  </div>
                  {records
                    .filter((r) => r.feature === 'PLAN-N4')
                    .map((r) => (
                      <div className="company-idea" key={r.id}>
                        <button
                          className="company-vote"
                          disabled={readOnly}
                          aria-label={`Vote for ${r.title}`}
                          onClick={() => save(voteRecord(r, currentActor))}
                        >
                          ↑<strong>{r.values.votes || '0'}</strong>
                        </button>
                        <div>
                          <button className="company-link" onClick={() => inspect(r)}>
                            {r.title}
                          </button>
                          <p>{r.values.evidence}</p>
                          <button className="text-button" onClick={() => convertTask(r)}>
                            Convert to delivery task <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  {!records.some((r) => r.feature === 'PLAN-N4') && (
                    <EmptyCompany
                      text="Capture alternatives and evidence before committing to a solution."
                      action={() => openFeature('PLAN-N4')}
                      label="Start brainstorming"
                    />
                  )}
                </section>
                <section className="panel">
                  <div className="company-panel-title">
                    <h2>A roadmap with room to learn.</h2>
                    <button
                      className="button"
                      disabled={readOnly}
                      onClick={() => openFeature('PLAN-N5')}
                    >
                      Add initiative
                    </button>
                  </div>
                  {['Now', 'Next', 'Later'].map((h) => (
                    <div className="company-roadmap" key={h}>
                      <span>{h}</span>
                      <div>
                        {records
                          .filter((r) => r.feature === 'PLAN-N5' && r.values.horizon === h)
                          .map((r) => (
                            <button key={r.id} onClick={() => inspect(r)}>
                              <strong>{r.title}</strong>
                              <small>
                                {r.values.goal || 'Connect a shared goal'} · {r.owner}
                              </small>
                            </button>
                          ))}
                        {!records.some(
                          (r) => r.feature === 'PLAN-N5' && r.values.horizon === h,
                        ) && <small>Space for the next deliberate choice.</small>}
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            </>
          )}
          {area === 'revenue' && (
            <>
              <div className="company-stats">
                <div className="panel">
                  <span>Shared accounts</span>
                  <strong>{accountRecords.length}</strong>
                </div>
                <div className="panel">
                  <span>Open opportunities</span>
                  <strong>
                    {
                      records.filter(
                        (r) => r.feature === 'CRM-N3' && !['Won', 'Lost'].includes(r.stage),
                      ).length
                    }
                  </strong>
                </div>
                <div className="panel">
                  <span>Recorded pipeline · {currency}</span>
                  <strong>
                    {money(
                      currencyTotal(
                        records.filter((r) => !['Won', 'Lost'].includes(r.stage)),
                        'CRM-N3',
                        'amount',
                        currency,
                      ),
                      currency,
                    )}
                  </strong>
                </div>
                <div className="panel">
                  <span>Proposals for review</span>
                  <strong>
                    {
                      records.filter((r) => r.feature === 'CRM-N5' && r.stage === 'Finance review')
                        .length
                    }
                  </strong>
                </div>
              </div>
              <section className="panel">
                <div className="company-panel-title">
                  <div>
                    <span className="eyebrow">RELATIONSHIP PIPELINE</span>
                    <h2>Know the next conversation.</h2>
                  </div>
                  <button
                    className="button"
                    disabled={readOnly}
                    onClick={() => openFeature('CRM-N3')}
                  >
                    Add opportunity
                  </button>
                </div>
                <CompanyBoard
                  records={records.filter((r) => r.feature === 'CRM-N3')}
                  stages={companySchemas['CRM-N3'].stages}
                  render={(r) => card(r, true)}
                  dragId={drag}
                  onDrop={(id, stage) => {
                    const r = data.records.find((x) => x.id === id);
                    if (r) move(r, stage);
                  }}
                />
              </section>
              <div className="company-two">
                <section className="panel">
                  <div className="company-panel-title">
                    <h2>Account relationships</h2>
                    <button
                      className="button"
                      disabled={readOnly}
                      onClick={() => openFeature('CRM-N1')}
                    >
                      Add account
                    </button>
                  </div>
                  {accountRecords.map((r) => (
                    <button key={r.id} className="company-account" onClick={() => inspect(r)}>
                      <span className="company-avatar">{r.title.slice(0, 2)}</span>
                      <span>
                        <strong>{r.title}</strong>
                        <small>
                          {r.values.industry || 'Industry not set'} · {r.owner}
                        </small>
                      </span>
                      <span className="status">{r.stage}</span>
                    </button>
                  ))}
                  {!accountRecords.length && (
                    <EmptyCompany
                      text="Create one account record and reuse it through sales, finance and customer success."
                      action={() => openFeature('CRM-N1')}
                      label="Create account"
                    />
                  )}
                </section>
                <section className="panel">
                  <h2>The commercial handoff</h2>
                  <p className="muted">
                    A proposal keeps its account, commitments and origin when finance reviews it and
                    customer success prepares onboarding.
                  </p>
                  <div className="company-handoff-map">
                    {[
                      ['Revenue', 'revenue'],
                      ['Finance', 'finance'],
                      ['Success', 'success'],
                    ].map(([label, path]) => (
                      <button key={path} onClick={() => navigate(path)}>
                        {label}
                        <ArrowRight size={14} />
                      </button>
                    ))}
                  </div>
                  <div className="row">
                    <button
                      className="button"
                      disabled={readOnly}
                      onClick={() => openFeature('CRM-N5')}
                    >
                      Create proposal
                    </button>
                    <button
                      className="button"
                      disabled={readOnly}
                      onClick={() => openFeature('CRM-N4')}
                    >
                      Draft follow-up
                    </button>
                    <button
                      className="button"
                      disabled={readOnly}
                      onClick={() => openFeature('CRM-N2')}
                    >
                      Qualify lead
                    </button>
                  </div>
                  {records.filter((r) => r.feature === 'CRM-N5').map((r) => card(r, true))}
                </section>
              </div>
            </>
          )}
          {area === 'success' && (
            <>
              <div className="company-two">
                <section className="panel">
                  <div className="company-panel-title">
                    <div>
                      <span className="eyebrow">VOICE OF THE CUSTOMER</span>
                      <h2>Evidence, not just requests.</h2>
                    </div>
                    <button
                      className="button"
                      disabled={readOnly}
                      onClick={() => openFeature('CX-N1')}
                    >
                      Capture feedback
                    </button>
                  </div>
                  {records
                    .filter((r) => r.feature === 'CX-N1')
                    .map((r) => (
                      <article className="company-feedback" key={r.id}>
                        <span className="eyebrow">
                          {r.values.theme || 'Feedback'} ·{' '}
                          {accountRecords.find((a) => a.id === r.values.accountId)?.title ||
                            'Unlinked account'}
                        </span>
                        <blockquote>“{r.values.quote || r.title}”</blockquote>
                        <div className="row">
                          <span className="status">{r.stage}</span>
                          <button className="text-button" onClick={() => inspect(r)}>
                            Review evidence
                          </button>
                          <button className="button" onClick={() => convertTask(r)}>
                            Create linked task <ArrowUpRight size={14} />
                          </button>
                        </div>
                      </article>
                    ))}
                  {!records.some((r) => r.feature === 'CX-N1') && (
                    <EmptyCompany
                      text="Capture a source-linked customer observation and carry it into product work."
                      action={() => openFeature('CX-N1')}
                      label="Add customer evidence"
                    />
                  )}
                </section>
                <section className="panel">
                  <h2>Care at every stage.</h2>
                  <div className="company-success-path">
                    {[
                      ['CX-N2', 'Resolve a support case'],
                      ['CX-N3', 'Coordinate onboarding'],
                      ['CX-N4', 'Review health & renewal'],
                      ['CX-N5', 'Close the feedback loop'],
                    ].map(([id, title]) => (
                      <button key={id} disabled={readOnly} onClick={() => openFeature(id)}>
                        <span>{records.filter((r) => r.feature === id).length}</span>
                        <strong>{title}</strong>
                        <ArrowRight size={16} />
                      </button>
                    ))}
                  </div>
                  <p className="muted">
                    Customer health needs explainable evidence. Updates are drafts until an
                    authorized person sends them.
                  </p>
                </section>
              </div>
              <section className="panel">
                <div className="company-panel-title">
                  <h2>Owned customer work</h2>
                  <button className="text-button" onClick={() => setTab('Records')}>
                    All customer records <ArrowRight size={14} />
                  </button>
                </div>
                <div className="company-card-grid">
                  {records
                    .filter((r) => r.feature !== 'CX-N1')
                    .slice(0, 6)
                    .map((r) => card(r))}
                </div>
                {!records.some((r) => r.feature !== 'CX-N1') && (
                  <p className="muted">
                    Onboarding, cases, renewals and follow-ups will appear here.
                  </p>
                )}
              </section>
            </>
          )}
          {area === 'finance' && (
            <>
              <div className="company-finance-heading">
                <label className="field">
                  Reporting currency
                  <select
                    value={currency}
                    onChange={(e) => commit({ selectedCurrency: e.target.value })}
                  >
                    {['USD', 'INR', 'EUR', 'GBP'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <p>
                  Totals only combine records in the selected currency. No currency conversion is
                  assumed.
                </p>
              </div>
              <div className="company-stats">
                <div className="panel">
                  <span>Allocated · {currency}</span>
                  <strong>{money(allocated, currency)}</strong>
                </div>
                <div className="panel">
                  <span>Recorded spend · {currency}</span>
                  <strong>{money(spent, currency)}</strong>
                </div>
                <div className="panel">
                  <span>Available · {currency}</span>
                  <strong>{money(allocated - spent, currency)}</strong>
                </div>
                <div className="panel">
                  <span>Purchase requests</span>
                  <strong>{records.filter((r) => r.feature === 'FIN-N2').length}</strong>
                </div>
              </div>
              <div className="company-two">
                <section className="panel">
                  <div className="company-panel-title">
                    <h2>Budgets with an owner.</h2>
                    <button
                      className="button"
                      disabled={readOnly}
                      onClick={() => openFeature('FIN-N1')}
                    >
                      New allocation
                    </button>
                  </div>
                  {records
                    .filter(
                      (r) => r.feature === 'FIN-N1' && (r.values.currency || 'USD') === currency,
                    )
                    .map((r) => (
                      <div className="company-budget" key={r.id}>
                        <div className="row">
                          <button className="company-link" onClick={() => inspect(r)}>
                            {r.title}
                          </button>
                          <strong>
                            {money(Number(r.values.spent) || 0, currency)} /{' '}
                            {money(Number(r.values.amount) || 0, currency)}
                          </strong>
                        </div>
                        <div className="company-meter">
                          <span
                            style={{
                              width: `${Math.min(100, Number(r.values.amount) ? ((Number(r.values.spent) || 0) / Number(r.values.amount)) * 100 : 0)}%`,
                            }}
                          />
                        </div>
                        <small>
                          {r.values.department || 'Unassigned department'} ·{' '}
                          {r.values.period || 'Period not set'} · {r.owner}
                        </small>
                      </div>
                    ))}
                  {!records.some((r) => r.feature === 'FIN-N1') && (
                    <EmptyCompany
                      text="Set an owned allocation and record its planning assumptions."
                      action={() => openFeature('FIN-N1')}
                      label="Create budget"
                    />
                  )}
                </section>
                <section className="panel">
                  <span className="eyebrow">REVIEW, THEN COMMIT</span>
                  <h2>Keep commercial decisions deliberate.</h2>
                  <div className="company-action-list">
                    {[
                      ['FIN-N2', 'Procurement review'],
                      ['FIN-N3', 'Invoice reconciliation'],
                      ['FIN-N4', 'Commercial decision'],
                      ['FIN-N5', 'Forecast & variance'],
                    ].map(([id, title]) => (
                      <button key={id} disabled={readOnly} onClick={() => openFeature(id)}>
                        <span>{title}</span>
                        <ArrowRight size={16} />
                      </button>
                    ))}
                  </div>
                  <div className="notice">
                    Planning and review only. No card charge, payment, contract signature or
                    provider budget change is performed.
                  </div>
                </section>
              </div>
              <section className="panel">
                <div className="company-panel-title">
                  <div>
                    <span className="eyebrow">CLOUD EFFICIENCY</span>
                    <h2>Good recommendations need evidence.</h2>
                  </div>
                  <button
                    className="button"
                    disabled={readOnly}
                    onClick={() => openFeature('OPS-N4')}
                  >
                    Add opportunity
                  </button>
                </div>
                <p className="muted">
                  Connect EC2, S3 or other service costs to utilization, a team and a reviewed
                  improvement task.
                </p>
                <div className="company-card-grid">
                  {records.filter((r) => r.feature === 'OPS-N4').map((r) => card(r))}
                </div>
              </section>
            </>
          )}
          {area === 'people' && (
            <>
              <div className="company-stats">
                <div className="panel">
                  <span>Directory records</span>
                  <strong>{records.filter((r) => r.feature === 'PEOPLE-N1').length}</strong>
                </div>
                <div className="panel">
                  <span>Available planned hours</span>
                  <strong>{capacity.capacity}</strong>
                </div>
                <div className="panel">
                  <span>Allocated hours</span>
                  <strong>{capacity.allocated}</strong>
                </div>
                <div className="panel">
                  <span>Remaining capacity</span>
                  <strong>{capacity.remaining}</strong>
                </div>
              </div>
              <div className="company-two">
                <section className="panel">
                  <div className="company-panel-title">
                    <h2>The people behind the work.</h2>
                    <button
                      className="button"
                      disabled={readOnly}
                      onClick={() => openFeature('PEOPLE-N1')}
                    >
                      Add directory record
                    </button>
                  </div>
                  {records
                    .filter((r) => r.feature === 'PEOPLE-N1')
                    .map((r) => (
                      <button className="company-account" key={r.id} onClick={() => inspect(r)}>
                        <span className="company-avatar">{r.title.slice(0, 2)}</span>
                        <span>
                          <strong>{r.title}</strong>
                          <small>
                            {r.values.role || 'Role not set'} · {r.values.team || 'Team not set'}
                          </small>
                          <small>{r.values.skills}</small>
                        </span>
                        <span className="status">{r.stage}</span>
                      </button>
                    ))}
                  {!records.some((r) => r.feature === 'PEOPLE-N1') && (
                    <EmptyCompany
                      text="Use authorized work directory details. Actual membership is managed separately in account settings."
                      action={() => openFeature('PEOPLE-N1')}
                      label="Add team member"
                    />
                  )}
                </section>
                <section className="panel">
                  <span className="eyebrow">CONTEXT BEFORE CONCLUSIONS</span>
                  <h2>Capacity is a planning conversation.</h2>
                  <p className="muted">
                    Include planned leave, blockers and corrections. Review agreed outcomes with
                    people; avoid treating message or commit counts as a measure of their value.
                  </p>
                  <div className="company-action-list">
                    {[
                      ['PEOPLE-N2', 'Coordinate onboarding / offboarding'],
                      ['PEOPLE-N3', 'Plan capacity & workload'],
                      ['PEOPLE-N4', 'Review an agreed goal'],
                    ].map(([id, title]) => (
                      <button key={id} disabled={readOnly} onClick={() => openFeature(id)}>
                        <span>{title}</span>
                        <ArrowRight size={16} />
                      </button>
                    ))}
                  </div>
                  <button className="text-button" onClick={() => navigate('company-access')}>
                    Manage real invitations & permissions <ArrowUpRight size={14} />
                  </button>
                </section>
              </div>
              <section className="panel">
                <h2>Team commitments</h2>
                <div className="company-card-grid">
                  {records.filter((r) => r.feature !== 'PEOPLE-N1').map((r) => card(r))}
                </div>
                {!records.some((r) => r.feature !== 'PEOPLE-N1') && (
                  <p className="muted">
                    Lifecycle checklists, capacity plans and agreed goals appear here.
                  </p>
                )}
              </section>
            </>
          )}
          {area === 'metrics' && (
            <>
              <section className="company-metric-hero">
                <div>
                  <span className="eyebrow">A MEASURE WITH MEANING</span>
                  <h2>
                    From a number
                    <br />
                    to a better decision.
                  </h2>
                  <p>Every measure carries a definition, an owner, a source and a timeframe.</p>
                  <button
                    className="button primary"
                    disabled={readOnly}
                    onClick={() => openFeature('BI-N1')}
                  >
                    Define a metric <Plus size={15} />
                  </button>
                </div>
                <div className="company-metric-art" aria-hidden="true">
                  {[26, 43, 36, 61, 54, 79, 92].map((v, i) => (
                    <i key={i} style={{ height: `${v}%` }} />
                  ))}
                  <span>Illustrative graphic</span>
                </div>
              </section>
              <div className="company-card-grid">
                {records
                  .filter((r) => r.feature === 'BI-N1')
                  .map((r) => (
                    <article className="panel company-metric-card" key={r.id}>
                      <span className="eyebrow">
                        {r.values.timeframe || 'Timeframe not set'} {r.sample ? '· SAMPLE' : ''}
                      </span>
                      <button className="company-link" onClick={() => inspect(r)}>
                        {r.title}
                      </button>
                      <strong className="company-metric-value">
                        {r.values.current || '—'}
                        <small>{r.values.unit}</small>
                      </strong>
                      <div className="company-meter">
                        <span
                          style={{
                            width: `${Math.min(100, Number(r.values.target) > 0 ? ((Number(r.values.current) || 0) / Number(r.values.target)) * 100 : 0)}%`,
                          }}
                        />
                      </div>
                      <p>
                        Target {r.values.target || 'not set'}
                        {r.values.unit} · {r.owner}
                      </p>
                      <details>
                        <summary>Definition & source</summary>
                        <p>{r.values.formula}</p>
                        <p>Source: {r.values.source || 'Not connected'}</p>
                        <p>Cohort: {r.values.cohort || 'Not defined'}</p>
                      </details>
                    </article>
                  ))}
              </div>
              <section className="panel">
                <div className="company-panel-title">
                  <h2>Make the decision useful.</h2>
                  <button
                    className="button"
                    disabled={readOnly}
                    onClick={() => openFeature('BI-N3')}
                  >
                    New analysis question
                  </button>
                </div>
                <div className="company-action-tiles">
                  {[
                    ['BI-N2', 'Instrumentation & quality'],
                    ['BI-N4', 'Business goals'],
                    ['BI-N5', 'Scheduled reporting'],
                    ['BI-N6', 'Experiments'],
                  ].map(([id, title]) => (
                    <button key={id} disabled={readOnly} onClick={() => openFeature(id)}>
                      <Target size={21} />
                      <strong>{title}</strong>
                      <ArrowUpRight size={15} />
                    </button>
                  ))}
                </div>
                <div className="company-inline-records">
                  {records
                    .filter((r) => r.feature !== 'BI-N1')
                    .slice(0, 6)
                    .map((r) => card(r, true))}
                </div>
              </section>
            </>
          )}
          {area === 'growth' && (
            <>
              <section className="panel">
                <div className="company-panel-title">
                  <div>
                    <span className="eyebrow">CAMPAIGN WORKSPACE</span>
                    <h2>The message follows the product.</h2>
                  </div>
                  <button
                    className="button"
                    disabled={readOnly}
                    onClick={() => openFeature('MKT-N1')}
                  >
                    Create campaign
                  </button>
                </div>
                <CompanyBoard
                  records={records.filter((r) => r.feature === 'MKT-N1')}
                  stages={companySchemas['MKT-N1'].stages}
                  render={(r) => card(r, true)}
                  dragId={drag}
                  onDrop={(id, stage) => {
                    const r = data.records.find((x) => x.id === id);
                    if (r) move(r, stage);
                  }}
                />
              </section>
              <div className="company-two">
                <section className="panel">
                  <h2>Claims deserve a second look.</h2>
                  <p className="muted">
                    Draft content, attach supporting evidence and ask a reviewer before publishing.
                  </p>
                  <div className="row">
                    <button
                      className="button"
                      disabled={readOnly}
                      onClick={() => openFeature('MKT-N2')}
                    >
                      Create content draft
                    </button>
                    <button
                      className="button"
                      disabled={readOnly}
                      onClick={() => openFeature('MKT-N4')}
                    >
                      Prepare publishing action
                    </button>
                  </div>
                  {records.filter((r) => r.feature === 'MKT-N2').map((r) => card(r, true))}
                  <div className="notice">
                    No channel posts or messages are sent from this prototype. External confirmation
                    needs a provider result or published URL.
                  </div>
                </section>
                <section className="panel">
                  <h2>A launch is a company moment.</h2>
                  <p className="muted">
                    Connect positioning and enablement to product availability, support readiness
                    and shared measures.
                  </p>
                  <div className="company-action-list">
                    {[
                      ['MKT-N3', 'Launch readiness'],
                      ['MKT-N5', 'Campaign attribution'],
                    ].map(([id, title]) => (
                      <button key={id} disabled={readOnly} onClick={() => openFeature(id)}>
                        {title}
                        <ArrowRight size={16} />
                      </button>
                    ))}
                  </div>
                  <div className="company-handoff-map">
                    <button onClick={() => navigate('release')}>
                      Release <ArrowRight size={14} />
                    </button>
                    <button onClick={() => navigate('success')}>
                      Success <ArrowRight size={14} />
                    </button>
                    <button onClick={() => navigate('revenue')}>
                      Sales <ArrowRight size={14} />
                    </button>
                  </div>
                </section>
              </div>
            </>
          )}
          {area === 'mcp' && (
            <>
              <div className="company-two">
                <section className="panel">
                  <span className="eyebrow">THE EXISTING WORK, CONNECTED</span>
                  <h2>
                    Connect the context.
                    <br />
                    Keep one owner.
                  </h2>
                  <p className="muted">
                    Bring Jira, Notion, team chat or other approved tools into the shared company
                    workflow. Define record ownership before enabling two-way changes.
                  </p>
                  <div className="company-connector-grid">
                    {['Jira', 'Notion', 'Linear', 'Slack', 'Teams', 'GitHub'].map((provider) => (
                      <button
                        key={provider}
                        disabled={readOnly}
                        onClick={() =>
                          openFeature('DATA-N2', {
                            values: { ...companyDefaults('DATA-N2'), provider },
                          })
                        }
                      >
                        <span>{provider.slice(0, 1)}</span>
                        <strong>{provider}</strong>
                        <small>Configure scope</small>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="panel">
                  <span className="eyebrow">ARCHITECT THROUGH CHATGPT</span>
                  <h2>
                    Pick up the same project
                    <br />
                    from a conversation.
                  </h2>
                  <p className="muted">
                    Prepare authenticated tools for inspecting a project, drafting requirements and
                    requesting a reviewed build. The result should return to the exact project.
                  </p>
                  <div className="company-code-sample">
                    read_project_status
                    <br />
                    draft_requirements
                    <br />
                    request_build_review
                    <br />
                    open_project_result
                  </div>
                  <button
                    className="button primary"
                    disabled={readOnly}
                    onClick={() => openFeature('DATA-N1')}
                  >
                    Prepare ChatGPT connection <ArrowRight size={15} />
                  </button>
                  <p className="muted">
                    Connection design and export only; no live ChatGPT app is registered.
                  </p>
                </section>
              </div>
              <section className="panel">
                <div className="company-panel-title">
                  <h2>Sync status & conflict ownership</h2>
                  <button
                    className="button"
                    disabled={readOnly}
                    onClick={() => openFeature('DATA-N2')}
                  >
                    Add sync mapping
                  </button>
                </div>
                {records.length ? (
                  <div className="company-card-grid">{records.map((r) => card(r))}</div>
                ) : (
                  <EmptyCompany
                    text="Connections begin as drafts. Authorization and a validated adapter are required before external sync can run."
                    action={() => openFeature('DATA-N2')}
                    label="Define a connection"
                  />
                )}
              </section>
            </>
          )}
          {area === 'botteams' && (
            <>
              <div className="company-bot-grid">
                <section className="panel company-bot-conversation">
                  <div className="company-panel-title">
                    <div>
                      <span className="eyebrow">LEAD BOT CONVERSATION</span>
                      <h2>
                        A clear goal.
                        <br />A considered response.
                      </h2>
                    </div>
                    <span className="status">{demo ? 'Demo responses' : 'AI proposals'}</span>
                  </div>
                  <label className="field">
                    Bot team
                    <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
                      <option value="">Company coordinator</option>
                      {teamRecords.map((r) => (
                        <option value={r.id} key={r.id}>
                          {r.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="company-chat" aria-live="polite">
                    {data.messages
                      .filter((m) => (m.teamId || '') === selectedTeam)
                      .map((m) => (
                        <article className={m.role} key={m.id}>
                          <span className="eyebrow">
                            {m.role === 'user' ? m.author?.name || 'Previous member' : 'LEAD BOT'}
                          </span>
                          <p>{m.text}</p>
                        </article>
                      ))}
                    {!data.messages.some((m) => (m.teamId || '') === selectedTeam) && (
                      <div className="company-chat-empty">
                        <Workflow size={30} />
                        <h3>What outcome should we work toward?</h3>
                        <p>
                          Ask the lead to propose a plan, identify specialists and surface
                          decisions. You stay in control.
                        </p>
                      </div>
                    )}
                  </div>
                  {botError && (
                    <div className="notice error" role="alert">
                      {botError}
                    </div>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendBot();
                    }}
                  >
                    <label className="field">
                      Team instruction
                      <textarea
                        rows={3}
                        value={botInput}
                        onChange={(e) => setBotInput(e.target.value)}
                        placeholder="Review our onboarding feedback and propose the smallest useful improvement…"
                      />
                    </label>
                    <div className="row">
                      <button
                        className="button primary"
                        disabled={readOnly || botBusy || !botInput.trim()}
                      >
                        {botBusy ? 'Preparing proposal…' : 'Ask the lead bot'}
                        <ArrowRight size={15} />
                      </button>
                      {botBusy && (
                        <button
                          className="button"
                          type="button"
                          onClick={() => {
                            botAbort.current?.abort();
                            notify('Request stopped. Your conversation is preserved.');
                          }}
                        >
                          Stop
                        </button>
                      )}
                      <button
                        type="button"
                        className="button"
                        onClick={() =>
                          exportFile(
                            'bot-team-conversation.json',
                            data.messages.filter((m) => (m.teamId || '') === selectedTeam),
                          )
                        }
                      >
                        Export conversation
                      </button>
                    </div>
                  </form>
                </section>
                <aside className="panel">
                  <span className="eyebrow">DELEGATION, WITH BOUNDARIES</span>
                  <h2>Specialists earn their scope.</h2>
                  <p className="muted">
                    The lead may propose temporary specialists. Approve a template, task, tools,
                    budget, concurrency and depth before activating a demonstration.
                  </p>
                  <div className="company-action-list">
                    {[
                      ['AGENT-N1', 'Create a bot team'],
                      ['AGENT-N3', 'Team policy & schedule'],
                      ['AGENT-N4', 'Propose a specialist'],
                      ['OPS-N2', 'Supervised remediation'],
                    ].map(([id, title]) => (
                      <button key={id} disabled={readOnly} onClick={() => openFeature(id)}>
                        {title}
                        <ArrowRight size={16} />
                      </button>
                    ))}
                  </div>
                  <div className="notice">
                    Runtime delegation, scheduling and external tool execution are prototypes. The
                    conversation uses the selected model when signed in.
                  </div>
                  <h3>Recent specialist proposals</h3>
                  {records
                    .filter((r) => r.feature === 'AGENT-N4')
                    .slice(0, 3)
                    .map((r) => card(r, true))}
                </aside>
              </div>
              <section className="panel company-team-canvas">
                <h3>Selected team’s structure</h3>
                <p>
                  Every team has its own delegation graph, execution dependencies, specialist
                  proposals and review history.
                </p>
                <button
                  className="button"
                  disabled={!selectedTeam}
                  onClick={() => {
                    const team = teamRecords.find((r) => r.id === selectedTeam);
                    if (team) inspect(team);
                  }}
                >
                  Open selected team workroom
                </button>
              </section>
              <section className="panel">
                <div className="company-panel-title">
                  <h2>Owned bot work</h2>
                  <button className="text-button" onClick={() => setTab('Records')}>
                    All bot records <ArrowRight size={14} />
                  </button>
                </div>
                <div className="company-card-grid">
                  {records.filter((r) => r.feature !== 'AGENT-N4').map((r) => card(r))}
                </div>
              </section>
            </>
          )}
          <section className="panel company-next">
            <div>
              <span className="eyebrow">EXPLORE THE COMPLETE PRODUCT</span>
              <h2>{featureList.length} connected feature flows.</h2>
              <p>
                Each flow has an owner, configurable choices, a review step and a saved outcome.
              </p>
            </div>
            <button className="button" onClick={() => setTab('Feature flows')}>
              Explore {info.label.toLowerCase()} <ArrowRight size={15} />
            </button>
          </section>
        </>
      )}
      {tab === 'Records' && (
        <section className="panel">
          <div className="company-record-toolbar">
            <label className="company-search">
              <Search size={15} />
              <input
                aria-label="Search company records"
                placeholder="Find a record, owner or account…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="field">
              Record type
              <select
                value={featureFilter}
                onChange={(e) => {
                  setFeatureFilter(e.target.value);
                  setFilter('All');
                }}
              >
                <option value="All">All records</option>
                {featureList.map((f) => (
                  <option key={f.id} value={f.id}>
                    {companySchemas[f.id].noun}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Stage
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option>All</option>
                {[
                  ...new Set(
                    (featureFilter === 'All'
                      ? featureList.map((f) => f.id)
                      : [featureFilter]
                    ).flatMap((id) => companySchemas[id]?.stages || []),
                  ),
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="company-checkbox">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
              />
              Show archived
            </label>
          </div>
          <div className="company-card-grid">{visible.map((r) => card(r))}</div>
          {!visible.length && (
            <EmptyCompany
              text="No records match this view. Create one or adjust the filters."
              action={() => openFeature(featureFilter === 'All' ? primary[area] : featureFilter)}
              label="Create record"
            />
          )}
        </section>
      )}
      {tab === 'Feature flows' && (
        <section className="company-flow-library">
          <div className="notice">
            These are functional company records and planning workflows. Provider actions—payments,
            publishing, permissions, infrastructure changes and unattended bots—remain explicitly
            reviewed prototypes.
          </div>
          {featureCards}
        </section>
      )}
      {tab === 'Activity' && (
        <section className="panel">
          <h2>Decisions leave a trail.</h2>
          <p className="muted">Record history stays with its owner and connected project.</p>
          {records
            .flatMap((r) => r.history.map((h) => ({ ...h, record: r })))
            .sort((a, b) => b.at.localeCompare(a.at))
            .slice(0, 80)
            .map((h, i) => (
              <button className="company-activity" key={i} onClick={() => inspect(h.record)}>
                <Clock size={16} />
                <span>
                  <strong>{h.record.title}</strong>
                  <small>
                    {h.note} · {h.stage} · {h.record.owner}
                  </small>
                </span>
                <time>{new Date(h.at).toLocaleDateString()}</time>
              </button>
            ))}
          {!records.length && (
            <EmptyCompany
              text="Saved decisions and changes will appear here."
              action={() => openFeature(primary[area])}
              label="Create first record"
            />
          )}
        </section>
      )}
      {!!Object.keys(data.drafts || {}).length && !editing && !inspecting && (
        <section className="panel">
          <h3>Continue an unfinished draft</h3>
          <div className="row">
            {Object.entries(data.drafts || {})
              .filter(([id]) => id.startsWith(currentActor.id + ':'))
              .map(([id, d]) => (
                <button
                  key={id}
                  className="button"
                  onClick={() =>
                    setEditing({
                      feature: d.feature,
                      record: data.records.find(
                        (r) => r.id === id.slice(currentActor.id.length + 1),
                      ),
                    })
                  }
                >
                  {d.title || companyFeatures.find((f) => f.id === d.feature)?.title} ·{' '}
                  {new Date(d.at).toLocaleString()}
                </button>
              ))}
          </div>
        </section>
      )}
      {inspecting && data.records.find((r) => r.id === inspecting) && (
        <CompanyRecordWorkspace
          projects={store.projects}
          key={inspecting}
          record={data.records.find((r) => r.id === inspecting)!}
          records={data.records}
          actor={currentActor}
          canManage={canManage}
          readOnly={readOnly}
          demo={demo}
          onSave={save}
          onOpen={(r) =>
            inspect(
              r,
              data.records.find((x) => x.id === inspecting),
            )
          }
          onEdit={() => {
            const r = data.records.find((x) => x.id === inspecting)!;
            setInspecting(null);
            setEditing({ feature: r.feature, record: r });
          }}
          onClose={() => {
            setInspecting(null);
            onNavigate(area === 'mcp' ? 'sync' : area, {
              returnView: navigationContext?.returnView,
            });
          }}
          onContinue={() => continueRecord(data.records.find((r) => r.id === inspecting)!)}
          onCreate={createLinked}
        />
      )}
      {editing && (
        <CompanyRecordEditor
          draft={data.drafts?.[currentActor.id + ':' + (editing.record?.id || editing.feature)]}
          onDraft={(draft) => {
            const key = currentActor.id + ':' + (editing.record?.id || editing.feature);
            const drafts = { ...normalizeCompany(storeRef.current.company).drafts };
            if (draft) drafts[key] = draft;
            else delete drafts[key];
            commit({ drafts });
          }}
          key={editing.record?.id || editing.feature}
          feature={companyFeatures.find((f) => f.id === editing.feature)!}
          record={editing.record}
          prefill={editing.prefill}
          projects={store.projects.map((p) => ({ id: p.id, title: p.title }))}
          accounts={accountRecords}
          owner={name}
          activeProject={project?.id || ''}
          readOnly={readOnly}
          onClose={() => setEditing(null)}
          onSave={(r) => {
            save(r);
            const drafts = { ...normalizeCompany(storeRef.current.company).drafts };
            delete drafts[currentActor.id + ':' + (editing.record?.id || editing.feature)];
            commit({ drafts });
            if (duplicateWarning(r))
              notify(
                'Similar identity found. Open the record workroom to compare and link before outreach.',
              );
          }}
          onContinue={(r) => {
            setEditing(null);
            const saved = allCurrent().find((x) => x.id === r.id) || r;
            inspect(saved);
          }}
        />
      )}
    </div>
  );
}

function EmptyCompany({
  text,
  action,
  label,
}: {
  text: string;
  action: () => void;
  label: string;
}) {
  return (
    <div className="company-empty">
      <Layers size={24} />
      <p>{text}</p>
      <button className="button" onClick={action}>
        {label}
        <ArrowRight size={14} />
      </button>
    </div>
  );
}
function RecordCard({
  record: r,
  account,
  projectName,
  onEdit,
  onMove,
  onHandoff,
  onArchive,
  onDrag,
  compact = false,
  readOnly = false,
}: {
  readOnly?: boolean;
  record: CompanyRecord;
  account?: string;
  projectName?: string;
  onEdit: () => void;
  onMove: (stage: string) => void;
  onHandoff: () => void;
  onArchive: () => void;
  onDrag: () => void;
  compact?: boolean;
}) {
  const s = companySchemas[r.feature];
  return (
    <article
      className={
        'company-record-card ' + (compact ? 'compact ' : '') + (r.archived ? 'archived' : '')
      }
      draggable={!r.archived && !readOnly}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', r.id);
        onDrag();
      }}
    >
      <div className="company-record-top">
        <span className="eyebrow">
          {r.feature} {r.sample ? '· EXAMPLE' : ''}
        </span>
        <button
          className="icon-button"
          aria-label={`${r.archived ? 'Restore' : 'Archive'} ${r.title}`}
          disabled={readOnly}
          onClick={onArchive}
        >
          {r.archived ? <RotateCcw size={14} /> : <Archive size={14} />}
        </button>
      </div>
      <button className="company-record-title" onClick={onEdit}>
        {r.title}
      </button>
      {account && (
        <span className="company-record-account">
          <Building2 size={12} />
          {account}
        </span>
      )}
      <p>
        {r.values.goal ||
          r.values.acceptance ||
          r.values.quote ||
          r.values.next ||
          r.values.reason ||
          r.values.case ||
          r.values.hypothesis ||
          r.values.scope ||
          r.values.recommendation ||
          r.values.question ||
          s.noun}
      </p>
      <div className="company-record-facts">
        <span>
          <span className="company-owner-dot">{r.owner.slice(0, 1)}</span>
          {r.owner}
        </span>
        {r.values.amount && (
          <strong>{money(Number(r.values.amount) || 0, r.values.currency || 'USD')}</strong>
        )}
        {r.values.estimate && <small>{r.values.estimate} pts</small>}
        {r.values.due && (
          <small>
            <Calendar size={11} />
            {r.values.due}
          </small>
        )}
      </div>
      {projectName && (
        <span className="company-record-project">
          <Layers size={12} />
          {projectName}
        </span>
      )}
      <label className="company-card-stage">
        Stage
        <select
          aria-label={`Stage for ${r.title}`}
          value={r.stage}
          disabled={r.archived || readOnly}
          onChange={(e) => onMove(e.target.value)}
        >
          {s.stages.map((stage) => (
            <option key={stage}>{stage}</option>
          ))}
        </select>
      </label>
      {!compact && !r.archived && (
        <button className="text-button" onClick={onHandoff}>
          {s.nextLabel}
          <ArrowRight size={13} />
        </button>
      )}
    </article>
  );
}
function CompanyBoard({
  records,
  stages,
  render,
  onDrop,
  dragId,
}: {
  records: CompanyRecord[];
  stages: string[];
  render: (r: CompanyRecord) => React.ReactNode;
  onDrop: (id: string, stage: string) => void;
  dragId: string | null;
}) {
  return (
    <div className="company-board">
      {stages.map((stage) => (
        <section
          key={stage}
          className="company-board-column"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain') || dragId;
            if (id) onDrop(id, stage);
          }}
        >
          <div className="company-board-heading">
            <span>{stage}</span>
            <small>{records.filter((r) => r.stage === stage).length}</small>
          </div>
          {records.filter((r) => r.stage === stage).map(render)}
          {!records.some((r) => r.stage === stage) && (
            <div className="company-dropzone">
              Drop work here
              <br />
              <span>or use its stage selector</span>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
function CompanyRecordEditor({
  draft,
  onDraft,
  feature,
  record,
  prefill,
  projects,
  accounts,
  owner,
  activeProject,
  onClose,
  onSave,
  onContinue,
  readOnly = false,
}: {
  draft?: CompanyDraft;
  onDraft: (draft: CompanyDraft | null) => void;
  readOnly?: boolean;
  feature: CompanyFeature;
  record?: CompanyRecord;
  prefill?: Partial<CompanyRecord>;
  projects: { id: string; title: string }[];
  accounts: CompanyRecord[];
  owner: string;
  activeProject: string;
  onClose: () => void;
  onSave: (r: CompanyRecord) => void;
  onContinue: (r: CompanyRecord) => void;
}) {
  const s = companySchemas[feature.id];
  const [step, setStep] = useState(0),
    [title, setTitle] = useState(draft?.title ?? record?.title ?? prefill?.title ?? ''),
    [responsible, setResponsible] = useState(draft?.owner || record?.owner || owner),
    [stage, setStage] = useState(draft?.stage || record?.stage || s.stages[0]),
    [values, setValues] = useState<Record<string, string>>({
      ...companyDefaults(feature.id),
      ...prefill?.values,
      ...record?.values,
      ...draft?.values,
    }),
    [projectId, setProjectId] = useState(
      draft?.projectId ?? record?.projectId ?? prefill?.projectId ?? activeProject,
    ),
    [errors, setErrors] = useState<string[]>([]),
    [saved, setSaved] = useState<CompanyRecord | null>(null),
    [note, setNote] = useState('');
  const draftRef = useRef(onDraft);
  draftRef.current = onDraft;
  const draftValue: CompanyDraft = {
    feature: feature.id,
    title,
    owner: responsible,
    stage,
    values,
    projectId,
    at: new Date().toISOString(),
  };
  useEffect(() => {
    if (readOnly || step !== 0) return;
    const timer = setTimeout(
      () =>
        draftRef.current({
          feature: feature.id,
          title,
          owner: responsible,
          stage,
          values,
          projectId,
          at: new Date().toISOString(),
        }),
      350,
    );
    return () => clearTimeout(timer);
  }, [title, responsible, stage, values, projectId, step, readOnly, feature.id]);
  const closeDraft = () => {
    if (step < 2 && !readOnly) onDraft(draftValue);
    onClose();
  };
  const review = () => {
    const issues = validateCompanyRecord(feature.id, title, responsible, values, stage);
    if (
      /Approved|Won|Activated|Published|Released|Verified|Complete|Ship|Resolved/.test(stage) &&
      (!record || !hasApproval(record))
    )
      issues.push(
        'Save a draft, then request review in its workroom before confirming this outcome.',
      );
    setErrors(issues);
    if (!issues.length) setStep(1);
  };
  const save = () => {
    const now = new Date().toISOString();
    const r: CompanyRecord = record
      ? {
          ...record,
          title: title.trim(),
          owner: responsible.trim(),
          stage,
          values,
          projectId,
          updatedAt: now,
          history: [
            ...record.history,
            { at: now, stage, note: note.trim() || 'Record reviewed and updated' },
          ],
        }
      : {
          ...makeCompanyRecord(
            feature.id,
            title.trim(),
            responsible.trim(),
            values,
            projectId,
            stage,
          ),
          sourceId: prefill?.sourceId,
        };
    onSave(r);
    setSaved(r);
    setStep(2);
  };
  return (
    <Modal title={feature.title} onClose={closeDraft} wide>
      <div className="row">
        <span className="status">{feature.id}</span>
        <span className="muted">
          {record ? 'Edit shared record' : `New ${s.noun}`} ·{' '}
          {record?.sample ? 'Example record' : 'Company workspace'}
        </span>
      </div>
      <div className="company-stepper">
        {['Configure', 'Review', 'Outcome'].map((label, i) => (
          <span className={i === step ? 'active' : ''} key={label}>
            {i + 1}. {label}
            {i < 2 && <ChevronRight size={14} />}
          </span>
        ))}
      </div>
      {draft && (
        <div className="notice">
          Restored saved draft. Your unfinished fields stay with this workspace until saved or
          discarded.
        </div>
      )}
      <p className="company-flow-detail">{s.detail}</p>
      {step === 0 && (
        <>
          <fieldset disabled={readOnly} className="company-editor-fieldset">
            <div className="company-editor-grid">
              <label className="field">
                Title *
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`Name this ${s.noun}`}
                  maxLength={160}
                />
              </label>
              <label className="field">
                Accountable owner *
                <input
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  maxLength={120}
                />
              </label>
              <label className="field">
                Stage
                <select value={stage} onChange={(e) => setStage(e.target.value)}>
                  {s.stages.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Connected project
                <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                  <option value="">Company-wide record</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>
              {s.fields
                .filter((f) => f.type !== 'project')
                .map((f) => (
                  <label
                    key={f.key}
                    className={
                      'field ' +
                      (f.type === 'textarea' ? 'span-two' : '') +
                      (f.type === 'toggle' ? ' company-toggle' : '')
                    }
                  >
                    {f.type === 'toggle' ? (
                      <>
                        <input
                          type="checkbox"
                          checked={values[f.key] === 'true'}
                          onChange={(e) =>
                            setValues({ ...values, [f.key]: String(e.target.checked) })
                          }
                        />
                        <span>{f.label}</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {f.label}
                          {f.required ? ' *' : ''}
                        </span>
                        {f.type === 'select' ? (
                          <select
                            value={values[f.key] || ''}
                            onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                          >
                            {f.options?.map((v) => (
                              <option key={v}>{v}</option>
                            ))}
                          </select>
                        ) : f.type === 'account' ? (
                          <select
                            value={values[f.key] || ''}
                            onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                          >
                            <option value="">No account linked</option>
                            {accounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.title}
                              </option>
                            ))}
                          </select>
                        ) : f.type === 'textarea' ? (
                          <textarea
                            rows={3}
                            value={values[f.key] || ''}
                            placeholder={f.placeholder}
                            onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                            maxLength={6000}
                          />
                        ) : (
                          <input
                            type={
                              f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'
                            }
                            min={f.min}
                            max={f.max}
                            step={f.type === 'number' ? 'any' : undefined}
                            value={values[f.key] || ''}
                            placeholder={f.placeholder}
                            onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                            maxLength={2000}
                          />
                        )}
                      </>
                    )}
                  </label>
                ))}
              {record && (
                <label className="field span-two">
                  Decision / change note
                  <textarea
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="What changed, and why?"
                  />
                </label>
              )}
            </div>
          </fieldset>
          {errors.length > 0 && (
            <div className="notice error" role="alert">
              {errors.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </div>
          )}
          {record && (
            <details className="company-editor-history">
              <summary>Record history · {record.history.length} events</summary>
              {record.history.map((h, i) => (
                <p key={i}>
                  <strong>{h.stage}</strong> · {h.note}
                  <small> {new Date(h.at).toLocaleString()}</small>
                </p>
              ))}
            </details>
          )}
          <div className="modal-footer">
            <button className="button" onClick={closeDraft}>
              Keep draft & close
            </button>
            <button
              className="text-button"
              onClick={() => {
                onDraft(null);
                onClose();
              }}
            >
              Discard this draft
            </button>
            <button className="button primary" disabled={readOnly} onClick={review}>
              Review record <ArrowRight size={15} />
            </button>
          </div>
        </>
      )}
      {step === 1 && (
        <>
          <dl className="company-review-grid">
            <div>
              <dt>Title</dt>
              <dd>{title}</dd>
            </div>
            <div>
              <dt>Owner</dt>
              <dd>{responsible}</dd>
            </div>
            <div>
              <dt>Stage</dt>
              <dd>{stage}</dd>
            </div>
            <div>
              <dt>Project</dt>
              <dd>{projects.find((p) => p.id === projectId)?.title || 'Company-wide'}</dd>
            </div>
            {s.fields
              .filter((f) => f.type !== 'project')
              .map((f) => (
                <div key={f.key}>
                  <dt>{f.label}</dt>
                  <dd>
                    {f.type === 'account'
                      ? accounts.find((a) => a.id === values[f.key])?.title || 'No account linked'
                      : f.type === 'toggle'
                        ? values[f.key] === 'true'
                          ? 'Yes'
                          : 'No'
                        : values[f.key] || 'Not specified'}
                  </dd>
                </div>
              ))}
          </dl>
          <div className="notice">
            <ShieldCheck size={17} /> Saving updates an internal workspace record. It does not send
            messages, grant access, publish content, execute bots or move money.
          </div>
          <div className="modal-footer">
            <button className="button" onClick={() => setStep(0)}>
              Back to edit
            </button>
            <button className="button primary" onClick={save}>
              Save reviewed record <Check size={15} />
            </button>
          </div>
        </>
      )}
      {step === 2 && saved && (
        <>
          <div className="company-saved">
            <CheckCircle2 size={38} />
            <h3>A clear next step.</h3>
            <p>
              <strong>{saved.title}</strong> is saved with {saved.owner} as owner. Its project,
              linked account and decision history stay attached.
            </p>
            <span className="status">{saved.stage}</span>
          </div>
          <div className="modal-footer">
            <button className="button" onClick={onClose}>
              Stay in this workspace
            </button>
            <button className="button primary" onClick={() => onContinue(saved)}>
              Open record workroom
              <ArrowRight size={15} />
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
