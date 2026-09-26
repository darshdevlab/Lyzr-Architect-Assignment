import type { CompanyRecord } from './company-features';
export type Actor = { id: string; name: string };
export type CompanySnapshot = {
  revision: number;
  at: string;
  actor: Actor;
  title: string;
  stage: string;
  values: Record<string, string>;
  note: string;
};
export type CompanyReview = {
  revision: number;
  requestedBy: Actor;
  reviewer: string;
  decision: 'Pending' | 'Approved' | 'Changes requested' | 'Rejected';
  evidence: string;
  decidedBy?: Actor;
};
export type CompanyComment = {
  id: string;
  at: string;
  actor: Actor;
  text: string;
  resolved: boolean;
};
export type CompanyLink = { id: string; relation: string };
export type ChecklistItem = {
  id: string;
  text: string;
  owner: string;
  done: boolean;
  evidence: string;
};
export type CompanyRun = {
  id: string;
  at: string;
  status:
    | 'Planned'
    | 'Running simulation'
    | 'Needs review'
    | 'Approved simulation'
    | 'Cancelled'
    | 'Failed simulation';
  steps: { name: string; state: string; evidence: string }[];
  sourceRevision: number;
  parentId?: string;
};
export type CompanyMeta = {
  revision: number;
  snapshots: CompanySnapshot[];
  review?: CompanyReview;
  comments: CompanyComment[];
  links: CompanyLink[];
  checklist: ChecklistItem[];
  voters: string[];
  runs: CompanyRun[];
  graph?: {
    id: string;
    name: string;
    role: string;
    parent: string;
    dependsOn: string;
    model: string;
    tools: string;
    x: number;
    y: number;
  }[];
  schedule?: { cadence: string; time: string; timezone: string; event: string; enabled: boolean };
  teamPreset?: {
    role: string;
    widgets: string;
    filters: string;
    templates: string;
    workflows: string;
    version: number;
  };
};
export function recordMeta(r: CompanyRecord): CompanyMeta {
  const m = r.meta;
  return {
    revision: typeof m?.revision === 'number' ? m.revision : 1,
    snapshots: Array.isArray(m?.snapshots) ? m.snapshots : [],
    comments: Array.isArray(m?.comments) ? m.comments : [],
    links: Array.isArray(m?.links) ? m.links : [],
    checklist: Array.isArray(m?.checklist) ? m.checklist : [],
    voters: Array.isArray(m?.voters) ? m.voters : [],
    runs: Array.isArray(m?.runs) ? m.runs : [],
    review: m?.review,
    graph: m?.graph,
    schedule: m?.schedule,
    teamPreset: m?.teamPreset,
  };
}
export function reviseRecord(
  previous: CompanyRecord | undefined,
  next: CompanyRecord,
  actor: Actor,
  note = 'Record updated',
): CompanyRecord {
  const m = recordMeta(previous || next);
  const changed =
    !!previous &&
    (previous.title !== next.title ||
      JSON.stringify(previous.values) !== JSON.stringify(next.values) ||
      JSON.stringify(previous.meta?.graph) !== JSON.stringify(next.meta?.graph) ||
      JSON.stringify(previous.meta?.schedule) !== JSON.stringify(next.meta?.schedule));
  const revision = changed ? m.revision + 1 : m.revision;
  const snapshot =
    previous && changed
      ? {
          revision: m.revision,
          at: new Date().toISOString(),
          actor,
          title: previous.title,
          stage: previous.stage,
          values: { ...previous.values },
          note,
        }
      : null;
  return {
    ...next,
    updatedAt: new Date().toISOString(),
    meta: {
      ...m,
      ...next.meta,
      revision,
      snapshots: snapshot ? [...m.snapshots, snapshot] : m.snapshots,
      review: changed ? undefined : next.meta?.review || m.review,
    },
  };
}
export function requestReview(r: CompanyRecord, actor: Actor, reviewer: string): CompanyRecord {
  if (!reviewer.trim()) throw new Error('Choose the accountable reviewer.');
  const m = recordMeta(r);
  return {
    ...r,
    meta: {
      ...m,
      review: {
        revision: m.revision,
        requestedBy: actor,
        reviewer: reviewer.trim(),
        decision: 'Pending',
        evidence: '',
      },
    },
  };
}
export function decideReview(
  r: CompanyRecord,
  actor: Actor,
  decision: 'Approved' | 'Changes requested' | 'Rejected',
  evidence: string,
  canManage: boolean,
  simulation = false,
): CompanyRecord {
  const m = recordMeta(r),
    review = m.review;
  if (!review || review.revision !== m.revision)
    throw new Error('Request a review of the current revision first.');
  if (!evidence.trim()) throw new Error('Add decision evidence before reviewing.');
  if (!simulation && review.requestedBy.id === actor.id)
    throw new Error('The author cannot independently approve their own change.');
  if (!simulation && !canManage && ![actor.id, actor.name].includes(review.reviewer))
    throw new Error('This decision belongs to the assigned reviewer.');
  return {
    ...r,
    meta: {
      ...m,
      review: {
        ...review,
        decision,
        evidence,
        decidedBy: simulation
          ? { id: 'demo-reviewer', name: 'Simulated independent reviewer' }
          : actor,
      },
    },
  };
}
export function hasApproval(r: CompanyRecord) {
  const m = recordMeta(r);
  return m.review?.decision === 'Approved' && m.review.revision === m.revision;
}
export function voteRecord(r: CompanyRecord, actor: Actor): CompanyRecord {
  const m = recordMeta(r);
  const voters = m.voters.includes(actor.id)
    ? m.voters.filter((x) => x !== actor.id)
    : [...m.voters, actor.id];
  return { ...r, values: { ...r.values, votes: String(voters.length) }, meta: { ...m, voters } };
}
export function companyEvidence(r: CompanyRecord) {
  return Object.entries(r.values)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
}
export function calculateVariance(r: CompanyRecord) {
  const plan = Number(r.values.plan) || 0,
    actual = Number(r.values.actual) || 0,
    forecast = Number(r.values.forecast) || 0;
  return {
    plan,
    actual,
    forecast,
    variance: actual - plan,
    forecastVariance: forecast - plan,
    percent: plan ? ((actual - plan) / plan) * 100 : null,
  };
}
export function parseImport(text: string) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('Include a header and one data row.');
  const headers = lines[0].split(',').map((x) => x.trim().toLowerCase());
  if (!headers.includes('title')) throw new Error('CSV needs a title column.');
  return lines
    .slice(1)
    .map((line, i) => {
      const cells = line.split(',');
      if (cells.length !== headers.length)
        throw new Error(
          `Row ${i + 2} has an unexpected column count. Use plain values without embedded commas.`,
        );
      return Object.fromEntries(headers.map((h, j) => [h, cells[j].trim()]));
    })
    .filter((r) => r.title);
}
export function nextOccurrences(cadence: string, time: string, now = new Date()) {
  const [h, m] = time.split(':').map(Number);
  return Array.from({ length: 3 }, (_, i) => {
    const d = new Date(now);
    d.setHours(h || 9, m || 0, 0, 0);
    d.setDate(d.getDate() + (cadence === 'Weekly' ? 7 : 1) * (i + 1));
    return d.toISOString();
  });
}
export function companyRun(r: CompanyRecord, kind: string): CompanyRun {
  const names =
    kind === 'analysis'
      ? [
          'Validate permitted source',
          'Compare supplied measures',
          'Review limitations',
          'Prepare decision',
        ]
      : kind === 'sync'
        ? [
            'Compare source fields',
            'Apply selected owner rules',
            'Preview changes',
            'Record reconciliation',
          ]
        : kind === 'publish'
          ? [
              'Verify approved asset',
              'Preview audience and channel',
              'Simulate delivery attempt',
              'Inspect confirmation',
            ]
          : kind === 'experiment'
            ? [
                'Validate allocation and exposure',
                'Inspect primary measure',
                'Check guardrails',
                'Review uncertainty',
              ]
            : [
                'Validate task and permissions',
                'Collect specialist proposals',
                'Compare conflicts and evidence',
                'Request independent review',
              ];
  return {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    status: 'Needs review',
    sourceRevision: recordMeta(r).revision,
    steps: names.map((name) => ({
      name,
      state: 'Simulated',
      evidence: 'Rehearsal using the saved record. No provider action executed.',
    })),
  };
}

export function validateTeamGraph(graph: NonNullable<CompanyMeta['graph']>) {
  for (const field of ['parent', 'dependsOn'] as const) {
    for (const node of graph) {
      const seen = new Set<string>();
      let id = node.id;
      while (id) {
        if (seen.has(id))
          return `The ${field === 'parent' ? 'management' : 'execution'} graph contains a cycle.`;
        seen.add(id);
        const current = graph.find((x) => x.id === id);
        if (!current) return 'An edge references a missing specialist.';
        id = current[field];
      }
    }
  }
  return '';
}
export function sprintReadiness(sprint: CompanyRecord, scope: CompanyRecord[]) {
  if (!sprint.values.start || !sprint.values.end || sprint.values.start > sprint.values.end)
    return 'Set a valid sprint date range.';
  if (!scope.length) return 'Attach reviewed scope items in Linked work.';
  if (
    scope.reduce((n, x) => n + (Number(x.values.estimate) || 0), 0) >
    (Number(sprint.values.capacity) || 0)
  )
    return 'Scope exceeds capacity. Reduce scope or review capacity.';
  return '';
}
export function reportingCycle(
  records: CompanyRecord[],
  recordId: string,
  parentId: string,
  key = 'managerId',
) {
  const visited = new Set([recordId]);
  let id = parentId;
  while (id) {
    if (visited.has(id)) return true;
    visited.add(id);
    id = records.find((x) => x.id === id)?.values[key] || '';
  }
  return false;
}
