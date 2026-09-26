import type { CompanyMeta } from './company-workflows';
export interface CompanyFeature {
  id: string;
  title: string;
  area: string;
  scope: string;
}
export const companyFeatures: CompanyFeature[] = [
  {
    id: 'ORG-N2',
    title: 'Company portfolio',
    area: 'company',
    scope:
      'Group projects into products and programs; show owners, dependencies, milestones and delivery health without turning every user into an administrator.',
  },
  {
    id: 'ORG-N4',
    title: 'Reusable company workspace blueprints',
    area: 'company',
    scope:
      'Versioned bundles of approved design systems, workflows, agent teams, model policies and connection requirements; preview dependencies and instantiate an independent project with approved local overrides.',
  },
  {
    id: 'PLAN-N1',
    title: 'Sprint and Kanban delivery',
    area: 'delivery',
    scope:
      'Epics, stories, tasks, bugs, backlog, sprint goals, capacity, estimates, owners, dependencies, blockers and retrospectives. AI proposes work; people approve scope and responsibility.',
  },
  {
    id: 'PLAN-N4',
    title: 'Collaborative brainstorming and decisions',
    area: 'delivery',
    scope:
      'Shared idea board, alternatives, clustering, comments, voting, decision rationale and conversion to an opportunity/prototype/task.',
  },
  {
    id: 'PLAN-N5',
    title: 'Strategic roadmap and trade-off planning',
    area: 'delivery',
    scope:
      'Goals to initiatives/milestones, alternatives, capacity/dependencies, forecast assumptions and change impact across teams.',
  },
  {
    id: 'AGENT-N1',
    title: 'Bot-team workroom',
    area: 'botteams',
    scope:
      'Persistent conversation with a lead bot and specialist activity feed; assign a goal, inspect delegation, intervene, cancel work and review evidence-backed deliverables.',
  },
  {
    id: 'AGENT-N3',
    title: 'Bot-team operations',
    area: 'botteams',
    scope:
      'Reusable team blueprints, ownership transfer, run budgets, tool health, version pinning and team evaluations; connect bot work directly to sprint tasks and approvals.',
  },
  {
    id: 'AGENT-N4',
    title: 'Dynamic specialist creation and delegated execution',
    area: 'botteams',
    scope:
      'A lead or execution agent can propose or create temporary specialists from approved templates at runtime, within tool/data/budget/concurrency/depth limits; preserve lineage, results and lifecycle cleanup.',
  },
  {
    id: 'DATA-N1',
    title: 'Architect through ChatGPT',
    area: 'mcp',
    scope:
      'Expose selected Architect project tools through an authenticated ChatGPT integration: inspect status, draft requirements, request builds and open the exact result in Architect. Enforce the same permissions and review policies.',
  },
  {
    id: 'DATA-N2',
    title: 'Existing-work system synchronization',
    area: 'mcp',
    scope:
      'Connect issue trackers, docs and team chat with explicit ownership of each record, external IDs, conflict rules and sync status; avoid creating competing sources of truth.',
  },
  {
    id: 'OPS-N2',
    title: 'Supervised remediation',
    area: 'botteams',
    scope:
      'An operations bot diagnoses a fault, proposes a patch or rollback, runs checks and requests the required action approval; record retries and prevent duplicate external side effects.',
  },
  {
    id: 'OPS-N4',
    title: 'Cloud cost allocation and efficiency recommendations',
    area: 'finance',
    scope:
      'Join connected cloud billing and utilization data; allocate EC2/S3 and other supported service costs to projects/teams/environments; surface evidence-backed efficiency opportunities and reviewed implementation tasks.',
  },
  {
    id: 'CRM-N1',
    title: 'Accounts and relationship records',
    area: 'revenue',
    scope:
      'Shared accounts, contacts, ownership, relationship history and stable identities. Customer-success views reuse these records.',
  },
  {
    id: 'CRM-N2',
    title: 'Lead capture, qualification and routing',
    area: 'revenue',
    scope: 'Capture/import, deduplicate, qualify, assign and retain source/contact preferences.',
  },
  {
    id: 'CRM-N3',
    title: 'Opportunity and pipeline management',
    area: 'revenue',
    scope:
      'Stages, opportunities, next steps, commitments and conversion status using explicit definitions.',
  },
  {
    id: 'CRM-N4',
    title: 'Sales activities and follow-ups',
    area: 'revenue',
    scope:
      'Prepare follow-ups, maintain activity history, schedule authorized bot work and expose failed or pending actions.',
  },
  {
    id: 'CRM-N5',
    title: 'Proposals and commercial handoffs',
    area: 'revenue',
    scope:
      'Proposal records and customer commitments link to finance review and customer-success onboarding; renewal work is owned by CX-N4.',
  },
  {
    id: 'CX-N1',
    title: 'Feedback intake and customer evidence',
    area: 'success',
    scope:
      'Capture source-linked feedback, group themes/duplicates and connect accounts to product opportunities.',
  },
  {
    id: 'CX-N2',
    title: 'Support cases and escalations',
    area: 'success',
    scope: 'Case ownership, routing, escalation and links to technical incidents or product work.',
  },
  {
    id: 'CX-N3',
    title: 'Customer onboarding and activation',
    area: 'success',
    scope:
      'Onboarding milestones, adoption tasks and customer-success handoff; metric definitions use shared BI capabilities.',
  },
  {
    id: 'CX-N4',
    title: 'Account health, retention and renewals',
    area: 'success',
    scope:
      'Explainable health signals, renewal coordination, churn reasons and retention actions using shared account/commercial records.',
  },
  {
    id: 'CX-N5',
    title: 'Close the customer feedback loop',
    area: 'success',
    scope:
      'Connect requests to decisions and shipped changes, prepare reviewed customer updates and record follow-up outcomes.',
  },
  {
    id: 'FIN-N1',
    title: 'Business budgets and allocations',
    area: 'finance',
    scope:
      'Project/department budgets and approved investment limits; uses company approval/budget infrastructure.',
  },
  {
    id: 'FIN-N2',
    title: 'Purchase requests and procurement review',
    area: 'finance',
    scope: 'Request, owner, supporting evidence, commercial review handoff and approval status.',
  },
  {
    id: 'FIN-N3',
    title: 'Invoice status and reconciliation exceptions',
    area: 'finance',
    scope:
      'Authorized invoice data, period/currency handling, matching exceptions and owner resolution.',
  },
  {
    id: 'FIN-N4',
    title: 'Commercial and investment decisions',
    area: 'finance',
    scope:
      'Review proposal terms, business cases, assumptions and funding decisions; CRM owns the originating proposal.',
  },
  {
    id: 'FIN-N5',
    title: 'Financial variance and forecasts',
    area: 'finance',
    scope:
      'Spend versus plan, explained variances and editable forecasts; shared BI/reporting supplies execution infrastructure.',
  },
  {
    id: 'PEOPLE-N1',
    title: 'Employee directory and skills',
    area: 'people',
    scope:
      'Authorized employee/team/skills records; ORG remains the authority for company membership and permissions.',
  },
  {
    id: 'PEOPLE-N2',
    title: 'Employee onboarding, offboarding and access requests',
    area: 'people',
    scope:
      'Coordinate employee lifecycle tasks, access-request approvals and bot ownership transfer.',
  },
  {
    id: 'PEOPLE-N3',
    title: 'Team capacity and workload',
    area: 'people',
    scope:
      'Available capacity, workload, leave context and blockers; teams can correct incomplete context.',
  },
  {
    id: 'PEOPLE-N4',
    title: 'Agreed goals and manager review context',
    area: 'people',
    scope:
      'Role-aware goals, quality/outcomes evidence and human review, without treating activity counts as autonomous employment decisions.',
  },
  {
    id: 'BI-N1',
    title: 'Metric catalog and definitions',
    area: 'metrics',
    scope: 'Owner, formula, source, timeframe, cohort, target and currency where relevant.',
  },
  {
    id: 'BI-N2',
    title: 'Instrumentation and data-quality planning',
    area: 'metrics',
    scope:
      'Event/property plans, implementation links, duplicate/missing-event checks and data freshness.',
  },
  {
    id: 'BI-N3',
    title: 'Prompt-to-analysis and dashboards',
    area: 'metrics',
    scope:
      'Authorized queries, charts, filters, segment comparisons and drill-down to supporting records; DATA owns connectors.',
  },
  {
    id: 'BI-N4',
    title: 'Business goals and decision tracking',
    area: 'metrics',
    scope:
      'Company goals, targets and evidence-backed decision records linked to owned follow-up work.',
  },
  {
    id: 'BI-N5',
    title: 'Scheduled reporting and distribution',
    area: 'metrics',
    scope:
      'Report audiences, cadence, snapshots/exports and delivery status; AGENT provides scheduling and permission infrastructure.',
  },
  {
    id: 'BI-N6',
    title: 'Experiments and outcome analysis',
    area: 'metrics',
    scope:
      'Hypotheses, assignment/exposure, variants, measures, guardrails, data quality and explicit ship/revise/stop decisions.',
  },
  {
    id: 'MKT-N1',
    title: 'Campaign and audience planning',
    area: 'growth',
    scope: 'Campaign briefs, audience definitions, calendars, tasks and accountable owners.',
  },
  {
    id: 'MKT-N2',
    title: 'Content and asset review',
    area: 'growth',
    scope:
      'Drafts, approved claims, assets, revisions and content approval using shared document/review infrastructure.',
  },
  {
    id: 'MKT-N3',
    title: 'Go-to-market and launch coordination',
    area: 'growth',
    scope:
      'Positioning, packaging/pricing proposals, sales enablement, support readiness and dependency on actual release availability.',
  },
  {
    id: 'MKT-N4',
    title: 'Supported channel publishing',
    area: 'growth',
    scope:
      'Approved connected publishing actions, execution confirmation, drafts and failure/retry states; no assumption every channel is supported.',
  },
  {
    id: 'MKT-N5',
    title: 'Campaign performance and attribution',
    area: 'growth',
    scope:
      'Campaign outcomes, lead-source and attribution rules, conversion analysis and follow-up work using shared BI metric definitions.',
  },
];
export type CompanyField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'toggle' | 'account' | 'project';
  options?: string[];
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
};
export type CompanySchema = {
  noun: string;
  stages: string[];
  fields: CompanyField[];
  next: string;
  nextLabel: string;
  detail: string;
};
const text = (key: string, label: string, placeholder = '', required = false): CompanyField => ({
  key,
  label,
  placeholder,
  required,
});
const memo = (key: string, label: string, placeholder = '', required = false): CompanyField => ({
  key,
  label,
  placeholder,
  required,
  type: 'textarea',
});
const pick = (key: string, label: string, options: string[]): CompanyField => ({
  key,
  label,
  options,
  type: 'select',
});
const number = (key: string, label: string, min = 0, max?: number): CompanyField => ({
  key,
  label,
  type: 'number',
  min,
  max,
});
const date = (key: string, label: string): CompanyField => ({ key, label, type: 'date' });
const toggle = (key: string, label: string): CompanyField => ({ key, label, type: 'toggle' });
const account = (): CompanyField => ({
  key: 'accountId',
  label: 'Related account',
  type: 'account',
});
const project = (): CompanyField => ({
  key: 'projectId',
  label: 'Connected project',
  type: 'project',
});
const schema = (
  noun: string,
  stages: string[],
  fields: CompanyField[],
  next: string,
  nextLabel: string,
  detail: string,
): CompanySchema => ({ noun, stages, fields, next, nextLabel, detail });
export const companySchemas: Record<string, CompanySchema> = {
  'ORG-N2': schema(
    'product',
    ['Discovery', 'In progress', 'At risk', 'Shipped'],
    [
      project(),
      text('program', 'Program', 'Customer experience'),
      memo('dependencies', 'Dependencies'),
      date('milestone', 'Next milestone'),
      pick('health', 'Health', ['On track', 'Needs attention', 'Blocked']),
    ],
    'delivery',
    'Plan delivery',
    'Groups real workspace projects into owned products. Health and milestone values are entered by the team, not inferred from surveillance.',
  ),
  'ORG-N4': schema(
    'blueprint',
    ['Draft', 'In review', 'Approved', 'Retired'],
    [
      text('version', 'Version', '1.0.0'),
      text('design', 'Design-system reference'),
      text('agents', 'Agent-team blueprint'),
      text('models', 'Model policy', 'Free eligible models'),
      text('connections', 'Required integrations'),
      memo('overrides', 'Allowed local overrides'),
    ],
    'studio',
    'Create from blueprint',
    'Approved blueprint records can seed independent projects; saved connection references do not grant account access.',
  ),
  'PLAN-N1': schema(
    'work item',
    ['Backlog', 'Ready', 'In progress', 'In review', 'Done'],
    [
      pick('kind', 'Work type', ['Story', 'Task', 'Bug', 'Epic', 'Sprint']),
      project(),
      text('sprint', 'Sprint', 'Sprint 01'),
      number('estimate', 'Estimate (points)'),
      number('capacity', 'Available capacity (points)'),
      date('due', 'Due date'),
      text('dependency', 'Depends on'),
      memo(
        'acceptance',
        'Acceptance criteria',
        'What observable outcome confirms this is done?',
        true,
      ),
      memo('blocker', 'Blocker / retrospective notes'),
    ],
    'studio',
    'Open connected builder',
    'Work is stored in the shared workspace. Drag or move cards between states; an assigned owner remains accountable for decisions.',
  ),
  'PLAN-N4': schema(
    'idea',
    ['Explore', 'Shortlisted', 'Decided', 'Converted'],
    [
      project(),
      text('cluster', 'Theme / cluster'),
      memo('alternative', 'Alternatives'),
      memo('evidence', 'Evidence and rationale', 'Link research or explain the trade-off', true),
      number('votes', 'Team votes'),
      text('decision', 'Decision owner'),
      memo('comment', 'Discussion note'),
    ],
    'delivery',
    'Turn into delivery work',
    'Ideas and votes provide context for a decision. Converting an idea creates an explicit linked delivery task.',
  ),
  'PLAN-N5': schema(
    'initiative',
    ['Proposed', 'Planned', 'In progress', 'Delivered'],
    [
      project(),
      text('goal', 'Company goal'),
      pick('horizon', 'Horizon', ['Now', 'Next', 'Later']),
      date('milestone', 'Milestone'),
      number('capacity', 'Capacity needed (points)'),
      text('dependencies', 'Cross-team dependencies'),
      memo('assumptions', 'Forecast assumptions'),
      memo('tradeoff', 'Alternative and change impact'),
    ],
    'metrics',
    'Connect outcome metrics',
    'Roadmap dates are forecasts with assumptions; changes are reviewed alongside delivery dependencies.',
  ),
  'AGENT-N1': schema(
    'bot team',
    ['Draft', 'Ready', 'Running demo', 'Paused', 'Complete'],
    [
      project(),
      text('lead', 'Lead bot', 'Team coordinator'),
      memo('goal', 'Team goal', 'Describe the result and the evidence you expect', true),
      text('specialists', 'Approved specialists', 'Research, delivery, independent review'),
      pick('approval', 'Review policy', [
        'Before external actions',
        'Before deliverable publication',
        'Every step',
      ]),
    ],
    'delivery',
    'Send result to delivery',
    'Live conversation can use OpenRouter. Specialist execution and external tools remain explicitly simulated unless a runtime is connected.',
  ),
  'AGENT-N3': schema(
    'team policy',
    ['Draft', 'In review', 'Approved', 'Retired'],
    [
      text('team', 'Bot team reference'),
      text('version', 'Pinned version', '1.0.0'),
      number('budget', 'Run budget (USD)'),
      text('tools', 'Approved tool connections'),
      text('successor', 'Ownership transfer to'),
      memo('evaluation', 'Team evaluation rubric'),
      pick('schedule', 'Schedule', ['Manual', 'Daily', 'Weekly', 'Event-driven']),
    ],
    'mcp',
    'Review tools and permissions',
    'Schedule and ownership-transfer plans are recorded; no unattended background process runs from a prototype setting.',
  ),
  'AGENT-N4': schema(
    'specialist proposal',
    ['Proposed', 'Approved', 'Active demo', 'Completed', 'Cleaned up'],
    [
      text('parent', 'Parent agent'),
      text('template', 'Approved template', 'Research specialist'),
      memo('task', 'Delegated task', 'Describe a bounded task', true),
      number('budget', 'Maximum budget (USD)'),
      number('concurrency', 'Maximum concurrent specialists', 1, 8),
      number('depth', 'Maximum delegation depth', 1, 3),
      text('tools', 'Allowed tools'),
      text('retention', 'Cleanup / retention', 'Remove after reviewed result'),
    ],
    'botteams',
    'Review specialist lineage',
    'Temporary specialists require bounded scope and approval. A saved proposal does not spawn autonomous provider agents.',
  ),
  'DATA-N1': schema(
    'ChatGPT connection',
    ['Draft', 'Needs setup', 'Review requested', 'Configured externally'],
    [
      project(),
      text('endpoint', 'Architect tool endpoint', 'https://your-host.example/mcp'),
      pick('scope', 'Tool scope', [
        'Read project status',
        'Draft requirements',
        'Request reviewed builds',
      ]),
      text('auth', 'Authentication requirement', 'OAuth with user-scoped permissions'),
      memo('review', 'Human-review policy'),
      text('return', 'Deep-link destination', 'Current project'),
    ],
    'company',
    'Return to project portfolio',
    'Exports a connection manifest and permission design. It does not register a live ChatGPT app or expose private project data.',
  ),
  'DATA-N2': schema(
    'sync connection',
    ['Draft', 'Needs authorization', 'Mapped', 'Conflict', 'Paused'],
    [
      pick('provider', 'System', ['Jira', 'Notion', 'Linear', 'Slack', 'Teams', 'GitHub']),
      text('external', 'External workspace / record ID'),
      pick('authority', 'Source of truth', [
        'External system',
        'Architect',
        'Field-level ownership',
      ]),
      pick('direction', 'Sync direction', [
        'Read only',
        'Architect → external',
        'Two-way proposal',
      ]),
      pick('conflict', 'Conflict handling', [
        'Ask owner',
        'External field owner wins',
        'Architect field owner wins',
      ]),
      text('mapping', 'Field mapping', 'title → summary; status → state'),
      memo('evidence', 'Last result / unresolved conflict'),
    ],
    'delivery',
    'Open related work',
    'Records ownership and conflict resolution. Connector grants, remote changes and notifications require a live adapter and explicit authorization.',
  ),
  'OPS-N2': schema(
    'remediation',
    ['Detected', 'Diagnosed', 'Awaiting approval', 'Rehearsed', 'Resolved externally'],
    [
      project(),
      text('incident', 'Incident reference'),
      memo('diagnosis', 'Diagnosis and evidence'),
      pick('action', 'Proposed action', ['Patch', 'Rollback', 'Pause job', 'Escalate']),
      memo('checks', 'Required verification'),
      text('idempotency', 'Unique action reference'),
      number('retries', 'Maximum retries', 0, 3),
      memo('approval', 'Owner decision'),
    ],
    'qa',
    'Verify proposed recovery',
    'Keeps evidence, retries and approvals visible. This prototype cannot automatically patch production or repeat external side effects.',
  ),
  'OPS-N4': schema(
    'cost opportunity',
    ['Observed', 'Validated', 'Approved', 'Task created', 'Measured externally'],
    [
      project(),
      pick('provider', 'Cloud', ['AWS', 'Azure', 'GCP']),
      pick('service', 'Service', [
        'EC2 / compute',
        'S3 / object storage',
        'Database',
        'Network',
        'Other',
      ]),
      text('team', 'Cost owner / team'),
      pick('environment', 'Environment', ['Development', 'Preview', 'Staging', 'Production']),
      number('amount', 'Monthly observed cost (USD)'),
      number('saving', 'Estimated monthly saving (USD)'),
      memo('evidence', 'Billing and utilization evidence'),
      memo('recommendation', 'Efficiency recommendation'),
    ],
    'delivery',
    'Create optimization task',
    'Cost figures are user-entered or sample data. Recommendations need billing/utilization evidence and review before infrastructure changes.',
  ),
  'CRM-N1': schema(
    'account',
    ['Prospect', 'Active', 'At risk', 'Archived'],
    [
      text('company', 'Company name', 'Acme Research', true),
      text('contact', 'Business contact'),
      text('email', 'Business email'),
      text('industry', 'Industry'),
      memo('history', 'Relationship history'),
      pick('preference', 'Contact preference', [
        'Ask before outreach',
        'Email approved',
        'Do not contact',
      ]),
    ],
    'success',
    'Open customer success',
    'Account identity is reused across opportunities, customer feedback and renewals; creating a record does not send outreach.',
  ),
  'CRM-N2': schema(
    'lead',
    ['New', 'Qualified', 'Assigned', 'Converted', 'Closed'],
    [
      account(),
      text('email', 'Business email'),
      pick('source', 'Source', ['Inbound', 'Referral', 'Campaign', 'Import']),
      text('campaign', 'Campaign reference'),
      memo('need', 'Need / qualification evidence'),
      pick('contact', 'Contact preference', ['Unknown — review', 'Opted in', 'Do not contact']),
      text('route', 'Assigned team'),
    ],
    'revenue',
    'Review pipeline',
    'Potential duplicates are flagged by email or company. Qualification and routing remain human decisions.',
  ),
  'CRM-N3': schema(
    'opportunity',
    ['Discovery', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'],
    [
      account(),
      number('amount', 'Expected value'),
      pick('currency', 'Currency', ['USD', 'INR', 'EUR', 'GBP']),
      number('probability', 'Probability (%)', 0, 100),
      date('close', 'Expected close date'),
      text('next', 'Next step'),
      memo('commitment', 'Customer commitments'),
    ],
    'finance',
    'Review commercial terms',
    'Stages and expected value are entered explicitly. Closing a record does not sign a contract or book revenue.',
  ),
  'CRM-N4': schema(
    'sales activity',
    ['Draft', 'Review required', 'Scheduled proposal', 'Completed externally', 'Failed'],
    [
      account(),
      pick('type', 'Activity', ['Call', 'Email draft', 'Meeting', 'Bot follow-up']),
      date('due', 'Due date'),
      memo('message', 'Follow-up draft'),
      pick('authorization', 'Outreach authorization', [
        'Not approved',
        'Owner approved draft',
        'Customer preference checked',
      ]),
      memo('outcome', 'Result / failure reason'),
    ],
    'botteams',
    'Prepare a supervised follow-up',
    'No email, calendar event or external message is sent by saving this activity.',
  ),
  'CRM-N5': schema(
    'proposal',
    ['Draft', 'Finance review', 'Approved internally', 'Accepted externally', 'Handoff complete'],
    [
      account(),
      number('amount', 'Proposed value'),
      pick('currency', 'Currency', ['USD', 'INR', 'EUR', 'GBP']),
      memo('scope', 'Deliverables and exclusions'),
      memo('terms', 'Commercial terms'),
      date('expiry', 'Proposal expiry'),
      text('handoff', 'Customer-success owner'),
    ],
    'finance',
    'Create finance review',
    'Internal approval is distinct from customer acceptance. Finance and success handoffs preserve the originating proposal ID.',
  ),
  'CX-N1': schema(
    'feedback',
    ['New', 'Triaged', 'Linked to work', 'Addressed', 'Closed'],
    [
      account(),
      text('source', 'Source link / reference'),
      pick('theme', 'Theme', [
        'Usability',
        'Reliability',
        'Missing capability',
        'Onboarding',
        'Pricing',
      ]),
      memo('quote', 'Customer evidence', 'What did the customer actually report?', true),
      text('duplicate', 'Duplicate / related feedback ID'),
      pick('impact', 'Impact', ['Low', 'Medium', 'High']),
    ],
    'delivery',
    'Create a product task',
    'Feedback is evidence linked to a customer, not an automatic promise to build a feature.',
  ),
  'CX-N2': schema(
    'support case',
    ['Open', 'Triaged', 'In progress', 'Escalated', 'Resolved'],
    [
      account(),
      pick('priority', 'Priority', ['Low', 'Normal', 'High', 'Urgent']),
      text('incident', 'Technical incident reference'),
      memo('problem', 'Reported problem', 'Describe the failure and reproduction steps', true),
      date('response', 'Response target'),
      memo('resolution', 'Resolution notes'),
    ],
    'ops',
    'Escalate to operations',
    'Technical escalation retains customer context without exposing unrestricted personal data to an agent.',
  ),
  'CX-N3': schema(
    'onboarding',
    ['Not started', 'In progress', 'Blocked', 'Activated'],
    [
      account(),
      text('milestone', 'Activation milestone'),
      date('due', 'Target date'),
      text('metric', 'Activation metric reference'),
      memo('checklist', 'Onboarding tasks'),
      memo('blocker', 'Blocker / owner action'),
    ],
    'metrics',
    'Define activation measure',
    'Track customer progress against a defined activation outcome and explicit task ownership.',
  ),
  'CX-N4': schema(
    'renewal',
    ['Healthy', 'Watch', 'At risk', 'Renewal review', 'Renewed externally', 'Churned'],
    [
      account(),
      date('renewal', 'Renewal date'),
      pick('health', 'Health assessment', ['Healthy', 'Watch', 'At risk', 'Insufficient evidence']),
      memo('signals', 'Evidence behind health'),
      number('amount', 'Renewal value'),
      pick('currency', 'Currency', ['USD', 'INR', 'EUR', 'GBP']),
      memo('action', 'Retention action'),
      memo('reason', 'Churn / renewal reason'),
    ],
    'revenue',
    'Review shared account',
    'Health must cite explainable evidence; financial or contractual outcomes require confirmation outside this prototype.',
  ),
  'CX-N5': schema(
    'customer update',
    ['Request linked', 'Decision recorded', 'Release verified', 'Draft update', 'Closed'],
    [
      account(),
      text('request', 'Feedback / request ID'),
      project(),
      text('release', 'Shipped release reference'),
      memo('decision', 'Product decision rationale'),
      memo('message', 'Customer update draft'),
      memo('outcome', 'Follow-up outcome'),
    ],
    'release',
    'Verify release before update',
    'Preparing an update does not send it. A real release must be verified before claiming a requested change shipped.',
  ),
  'FIN-N1': schema(
    'budget',
    ['Draft', 'Review', 'Approved', 'Frozen'],
    [
      project(),
      text('department', 'Department'),
      pick('currency', 'Currency', ['USD', 'INR', 'EUR', 'GBP']),
      number('amount', 'Approved / proposed allocation'),
      number('spent', 'Recorded spend'),
      text('period', 'Budget period', '2026 Q4'),
      memo('assumptions', 'Budget assumptions'),
    ],
    'metrics',
    'Inspect financial measures',
    'Budgets and spend are internal planning records. They neither transfer money nor change provider billing limits.',
  ),
  'FIN-N2': schema(
    'purchase request',
    ['Submitted', 'Evidence needed', 'In review', 'Approved internally', 'Declined'],
    [
      text('vendor', 'Vendor'),
      number('amount', 'Requested amount'),
      pick('currency', 'Currency', ['USD', 'INR', 'EUR', 'GBP']),
      memo('reason', 'Business need'),
      text('evidence', 'Supporting document reference'),
      text('budget', 'Budget reference'),
      memo('decision', 'Review decision'),
    ],
    'finance',
    'Review against budget',
    'Approval records a procurement decision only. No payment, order or subscription is created.',
  ),
  'FIN-N3': schema(
    'invoice exception',
    ['Unmatched', 'Under review', 'Matched', 'Resolved externally'],
    [
      account(),
      text('invoice', 'Invoice number'),
      number('amount', 'Invoice amount'),
      pick('currency', 'Currency', ['USD', 'INR', 'EUR', 'GBP']),
      text('period', 'Accounting period'),
      text('match', 'Matching proposal / purchase ID'),
      memo('exception', 'Mismatch / exception'),
      memo('resolution', 'Owner resolution'),
    ],
    'revenue',
    'Inspect originating proposal',
    'Tracks authorized invoice references and reconciliation notes, without executing payments or bookkeeping entries.',
  ),
  'FIN-N4': schema(
    'commercial review',
    ['Proposed', 'Review', 'Approved internally', 'Request changes', 'Declined'],
    [
      account(),
      text('proposal', 'Originating proposal ID'),
      number('amount', 'Investment / proposal amount'),
      pick('currency', 'Currency', ['USD', 'INR', 'EUR', 'GBP']),
      memo('case', 'Business case'),
      memo('assumptions', 'Key assumptions and risks'),
      memo('decision', 'Funding decision rationale'),
      text('terms', 'Approved commercial terms'),
      text('expiry', 'Terms expiry'),
      text('handoff', 'Customer-success owner'),
    ],
    'success',
    'Prepare commercial handoff',
    'Human reviewers assess terms and funding; the system does not independently sign contracts or approve spending.',
  ),
  'FIN-N5': schema(
    'forecast',
    ['Draft', 'Reviewed', 'Published internally'],
    [
      text('period', 'Forecast period', '2026 Q4'),
      text('department', 'Department'),
      pick('currency', 'Currency', ['USD', 'INR', 'EUR', 'GBP']),
      number('plan', 'Planned spend'),
      number('actual', 'Actual recorded spend'),
      number('forecast', 'Forecast spend'),
      memo('variance', 'Variance explanation'),
    ],
    'metrics',
    'Open decision dashboard',
    'Variance is calculated from entered values and presented with its currency and assumptions.',
  ),
  'PEOPLE-N1': schema(
    'team member',
    ['Active', 'Onboarding', 'On leave', 'Archived'],
    [
      text('email', 'Work email'),
      text('team', 'Team / function'),
      text('role', 'Role'),
      text('manager', 'Manager'),
      text('skills', 'Skills'),
      text('timezone', 'Timezone'),
    ],
    'people',
    'Review team capacity',
    'Directory records do not grant Architect membership. Identity, invitations and actual access remain in workspace administration.',
  ),
  'PEOPLE-N2': schema(
    'lifecycle checklist',
    ['Requested', 'Approved', 'In progress', 'Complete', 'Cancelled'],
    [
      text('person', 'Team member reference'),
      pick('type', 'Lifecycle', ['Onboarding', 'Offboarding', 'Access request']),
      memo('tasks', 'Required tasks'),
      text('access', 'Requested access scope'),
      text('transfer', 'Bot / project ownership transfer'),
      date('due', 'Due date'),
      memo('decision', 'Approver decision'),
    ],
    'company-access',
    'Review actual workspace access',
    'Lifecycle coordination does not grant or revoke identity access automatically.',
  ),
  'PEOPLE-N3': schema(
    'capacity plan',
    ['Proposed', 'Confirmed', 'Needs adjustment'],
    [
      text('team', 'Team'),
      text('period', 'Planning period', 'Sprint 01'),
      number('capacity', 'Available hours'),
      number('allocated', 'Allocated hours'),
      number('leave', 'Planned leave hours'),
      memo('context', 'Blockers / missing context'),
      memo('correction', 'Team correction'),
    ],
    'delivery',
    'Adjust sprint scope',
    'Capacity supports planning and can be corrected by the team. It is not an individual productivity score.',
  ),
  'PEOPLE-N4': schema(
    'agreed goal',
    ['Draft', 'Agreed', 'In progress', 'Review', 'Complete'],
    [
      text('person', 'Goal owner'),
      memo('goal', 'Agreed outcome'),
      text('measure', 'Success measure'),
      date('review', 'Review date'),
      memo('evidence', 'Quality / outcome evidence'),
      memo('discussion', 'Manager and employee discussion'),
    ],
    'metrics',
    'Connect outcome measure',
    'Human review uses agreed outcomes and context. Activity counts do not drive automated employment decisions.',
  ),
  'BI-N1': schema(
    'metric',
    ['Draft', 'Defined', 'Instrumented', 'Retired'],
    [
      text('formula', 'Formula', 'activated users / signups', true),
      text('source', 'Data source'),
      text('timeframe', 'Timeframe', 'Last 30 days'),
      text('cohort', 'Cohort / segment'),
      number('current', 'Current value', -1000000000),
      number('target', 'Target', -1000000000),
      text('unit', 'Unit', '%'),
      text('currency', 'Currency, if monetary'),
    ],
    'metrics',
    'View metric dashboard',
    'Metric values are manually entered unless a connected source is explicitly verified. Formula, owner and timeframe remain visible.',
  ),
  'BI-N2': schema(
    'event plan',
    ['Planned', 'Implementation', 'Validation', 'Verified externally'],
    [
      project(),
      text('event', 'Event name', 'first_task_completed'),
      memo('properties', 'Required event properties'),
      text('source', 'Implementation / source reference'),
      pick('quality', 'Quality check', [
        'Not checked',
        'Missing event',
        'Duplicate event',
        'Validated externally',
      ]),
      date('freshness', 'Last validated date'),
    ],
    'code',
    'Open instrumentation work',
    'Defines event contracts and data-quality checks. No tracking script is installed by saving the plan.',
  ),
  'BI-N3': schema(
    'analysis',
    ['Question', 'In progress', 'Review', 'Decision ready'],
    [
      memo('question', 'Analysis question', 'What changed and why?', true),
      text('source', 'Authorized data source'),
      pick('chart', 'Chart', ['Table', 'Bar', 'Line', 'Metric']),
      text('segment', 'Segment comparison'),
      text('filters', 'Filters / timeframe'),
      memo('finding', 'Finding and evidence'),
      memo('limitations', 'Limitations'),
    ],
    'delivery',
    'Turn insight into action',
    'Analysis records and entered charts are functional. Prompted narratives must not be mistaken for executed database queries.',
  ),
  'BI-N4': schema(
    'business goal',
    ['Proposed', 'Active', 'At risk', 'Achieved', 'Closed'],
    [
      text('metric', 'Metric reference'),
      number('target', 'Target', -1000000000),
      date('deadline', 'Target date'),
      memo('decision', 'Decision rationale'),
      text('followup', 'Owned follow-up task'),
      memo('evidence', 'Outcome evidence'),
    ],
    'delivery',
    'Open follow-up work',
    'Links a decision to an accountable follow-up rather than treating dashboards as the end of the workflow.',
  ),
  'BI-N5': schema(
    'report schedule',
    ['Draft', 'Review', 'Ready for connector', 'Paused'],
    [
      text('audience', 'Approved audience'),
      pick('cadence', 'Cadence', ['Daily', 'Weekly', 'Monthly', 'Manual']),
      text('timezone', 'Timezone', 'Asia/Kolkata'),
      pick('format', 'Snapshot format', ['CSV', 'JSON', 'Markdown']),
      text('channel', 'Delivery channel reference'),
      memo('content', 'Included metrics / report scope'),
    ],
    'botteams',
    'Review scheduled bot work',
    'Exports work now. Scheduled external distribution requires a connected runtime and approved audience; it is not running in the background.',
  ),
  'BI-N6': schema(
    'experiment',
    ['Hypothesis', 'Design', 'Running externally', 'Review', 'Ship', 'Revise', 'Stop'],
    [
      memo('hypothesis', 'Hypothesis', 'We believe… because…', true),
      text('variants', 'Variants', 'Control / proposed flow'),
      text('assignment', 'Assignment / exposure method'),
      text('primary', 'Primary metric'),
      text('guardrail', 'Guardrail metrics'),
      pick('quality', 'Data quality', [
        'Not assessed',
        'Insufficient sample',
        'Validated externally',
      ]),
      memo('result', 'Observed results and uncertainty'),
      memo('decision', 'Ship / revise / stop rationale'),
    ],
    'growth',
    'Coordinate outcome rollout',
    'Experiment planning is functional; randomization, exposure tracking and statistical claims require actual measurement.',
  ),
  'MKT-N1': schema(
    'campaign',
    ['Brief', 'Planned', 'In progress', 'Review', 'Complete'],
    [
      text('audience', 'Audience definition'),
      text('goal', 'Campaign goal'),
      date('start', 'Start date'),
      date('end', 'End date'),
      text('channels', 'Proposed channels'),
      number('budget', 'Planned budget (USD)'),
      memo('tasks', 'Owned tasks'),
    ],
    'metrics',
    'Define campaign measures',
    'Audience and campaign records prepare work. Saving a brief does not contact anyone or spend advertising budget.',
  ),
  'MKT-N2': schema(
    'content asset',
    ['Draft', 'In review', 'Changes requested', 'Approved'],
    [
      text('campaign', 'Campaign reference'),
      pick('format', 'Content type', [
        'Article',
        'Email draft',
        'Social draft',
        'Landing page',
        'Sales asset',
      ]),
      memo('content', 'Content draft'),
      memo('claims', 'Approved claims and supporting evidence'),
      text('asset', 'Asset reference / URL'),
      text('version', 'Revision', '1'),
      memo('feedback', 'Reviewer feedback'),
    ],
    'growth',
    'Prepare publishing review',
    'Content is editable and versioned through record history. Approval does not publish it.',
  ),
  'MKT-N3': schema(
    'launch',
    ['Planning', 'Dependencies', 'Ready internally', 'Released externally', 'Follow-up'],
    [
      project(),
      text('release', 'Required release reference'),
      memo('positioning', 'Positioning'),
      memo('pricing', 'Packaging / pricing proposal'),
      memo('enablement', 'Sales enablement'),
      memo('support', 'Support readiness'),
      memo('dependencies', 'Cross-team dependencies'),
    ],
    'release',
    'Verify product availability',
    'Launch readiness depends on the actual product release, support and commercial approvals.',
  ),
  'MKT-N4': schema(
    'publishing action',
    ['Draft', 'Approval required', 'Ready for connector', 'Confirmed externally', 'Failed'],
    [
      text('asset', 'Approved content ID'),
      pick('channel', 'Channel', [
        'Company website',
        'Email',
        'LinkedIn',
        'Other supported connector',
      ]),
      date('date', 'Proposed publication date'),
      text('approver', 'Content approver'),
      text('external', 'Published URL / provider result ID'),
      memo('failure', 'Failure / retry notes'),
      toggle('approval', 'Content approved for the intended audience'),
    ],
    'mcp',
    'Check publishing connector',
    'This interface stores drafts and externally verified outcomes. It does not post to a channel or send messages.',
  ),
  'MKT-N5': schema(
    'campaign result',
    ['Collecting', 'Review', 'Decision ready', 'Actioned'],
    [
      text('campaign', 'Campaign ID'),
      pick('attribution', 'Attribution rule', [
        'First touch',
        'Last touch',
        'Multi-touch proposal',
        'Unknown',
      ]),
      number('leads', 'Qualified leads'),
      number('conversions', 'Conversions'),
      number('spend', 'Recorded spend (USD)'),
      text('source', 'Measurement source'),
      memo('finding', 'Finding and follow-up'),
    ],
    'revenue',
    'Review attributed leads',
    'Attribution rules and source confidence stay visible. Results are entered records, not inferred tracking data.',
  ),
};
export type CompanyRecord = {
  meta?: CompanyMeta;
  id: string;
  feature: string;
  title: string;
  owner: string;
  stage: string;
  values: Record<string, string>;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  history: { at: string; stage: string; note: string }[];
  sample?: boolean;
  sourceId?: string;
  archived?: boolean;
};
export type CompanyMessage = {
  author?: { id: string; name: string };
  id: string;
  role: 'user' | 'assistant';
  text: string;
  at: string;
  teamId?: string;
};
export type CompanyDraft = {
  feature: string;
  title: string;
  owner: string;
  stage: string;
  values: Record<string, string>;
  projectId: string;
  at: string;
};
export type CompanyData = {
  drafts?: Record<string, CompanyDraft>;
  rolePresets?: Record<
    string,
    {
      role: string;
      widgets: string;
      filters: string;
      templates: string;
      workflows: string;
      version: number;
      previous?: unknown;
    }
  >;
  version: 1;
  records: CompanyRecord[];
  messages: CompanyMessage[];
  departmentViews: Record<string, string[]>;
  selectedCurrency: string;
};
export const emptyCompany = (): CompanyData => ({
  version: 1,
  records: [],
  messages: [],
  departmentViews: {},
  selectedCurrency: 'USD',
});
export function companyDefaults(id: string): Record<string, string> {
  return Object.fromEntries(
    (companySchemas[id]?.fields || []).map((f) => [
      f.key,
      f.type === 'toggle' ? 'false' : f.options?.[0] || '',
    ]),
  );
}
export function validateCompanyRecord(
  id: string,
  title: string,
  owner: string,
  values: Record<string, string>,
  stage?: string,
): string[] {
  const schema = companySchemas[id];
  if (!Object.hasOwn(companySchemas, id) || !schema) return ['Unknown feature.'];
  const errors: string[] = [];
  if (stage && !schema.stages.includes(stage))
    errors.push('Choose a stage supported by this workflow.');
  if (!title.trim()) errors.push('A title is required.');
  if (!owner.trim()) errors.push('An accountable owner is required.');
  for (const f of schema.fields) {
    const v = values[f.key] || '';
    if (f.required && !v.trim()) errors.push(`${f.label} is required.`);
    if (f.type === 'number' && v.trim()) {
      const n = Number(v);
      if (
        !Number.isFinite(n) ||
        (f.min !== undefined && n < f.min) ||
        (f.max !== undefined && n > f.max)
      )
        errors.push(`${f.label} is outside its allowed range.`);
    }
    if (f.type === 'date' && v && !/^\d{4}-\d{2}-\d{2}$/.test(v))
      errors.push(`${f.label} must be a date.`);
  }
  if (id === 'MKT-N4' && stage === 'Confirmed externally' && !values.external?.trim())
    errors.push(
      'A provider result ID or published URL is required to record external confirmation.',
    );
  if (
    id === 'AGENT-N4' &&
    ['Approved', 'Active demo'].includes(stage || '') &&
    (!values.budget || !values.concurrency || !values.depth)
  )
    errors.push('Set budget, concurrency and depth limits before approving delegation.');
  return errors;
}
export function normalizeCompany(value: unknown): CompanyData {
  const empty = emptyCompany();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return empty;
  const r = value as Record<string, unknown>;
  if (Array.isArray(r.records))
    empty.records = (r.records as CompanyRecord[])
      .filter(
        (x) =>
          x &&
          typeof x.id === 'string' &&
          Object.hasOwn(companySchemas, x.feature) &&
          typeof x.title === 'string' &&
          typeof x.owner === 'string' &&
          typeof x.stage === 'string' &&
          typeof x.projectId === 'string' &&
          x.values &&
          typeof x.values === 'object' &&
          Object.values(x.values).every((v) => typeof v === 'string'),
      )
      .map((x) => ({
        ...x,
        history: Array.isArray(x.history)
          ? x.history.filter(
              (h) =>
                h &&
                typeof h.at === 'string' &&
                typeof h.stage === 'string' &&
                typeof h.note === 'string',
            )
          : [],
      }));
  if (Array.isArray(r.messages))
    empty.messages = (r.messages as CompanyMessage[]).filter(
      (x) =>
        x &&
        typeof x.id === 'string' &&
        ['user', 'assistant'].includes(x.role) &&
        typeof x.text === 'string' &&
        typeof x.at === 'string',
    );
  if (
    r.departmentViews &&
    typeof r.departmentViews === 'object' &&
    !Array.isArray(r.departmentViews)
  )
    empty.departmentViews = Object.fromEntries(
      Object.entries(r.departmentViews).filter(
        ([, v]) => Array.isArray(v) && v.every((x) => typeof x === 'string'),
      ),
    ) as Record<string, string[]>;
  if (r.drafts && typeof r.drafts === 'object' && !Array.isArray(r.drafts))
    empty.drafts = Object.fromEntries(
      Object.entries(r.drafts).filter(
        ([, v]) =>
          v &&
          typeof v === 'object' &&
          typeof (v as CompanyDraft).feature === 'string' &&
          typeof (v as CompanyDraft).title === 'string' &&
          (v as CompanyDraft).values &&
          typeof (v as CompanyDraft).values === 'object',
      ),
    ) as CompanyData['drafts'];
  if (r.rolePresets && typeof r.rolePresets === 'object' && !Array.isArray(r.rolePresets))
    empty.rolePresets = r.rolePresets as CompanyData['rolePresets'];
  if (
    typeof r.selectedCurrency === 'string' &&
    ['USD', 'INR', 'EUR', 'GBP'].includes(r.selectedCurrency)
  )
    empty.selectedCurrency = r.selectedCurrency;
  return empty;
}
export function currencyTotal(
  records: CompanyRecord[],
  feature: string,
  key: string,
  currency: string,
) {
  return records
    .filter(
      (r) => r.feature === feature && !r.archived && (r.values.currency || 'USD') === currency,
    )
    .reduce((sum, r) => sum + (Number(r.values[key]) || 0), 0);
}
export function capacitySummary(records: CompanyRecord[]) {
  const plans = records.filter((r) => r.feature === 'PEOPLE-N3' && !r.archived);
  const capacity = plans.reduce(
    (s, r) => s + (Number(r.values.capacity) || 0) - (Number(r.values.leave) || 0),
    0,
  );
  const allocated = plans.reduce((s, r) => s + (Number(r.values.allocated) || 0), 0);
  return { capacity, allocated, remaining: capacity - allocated };
}
export const roleRoutes: Record<string, { intro: string; focus: string; areas: string[] }> = {
  'Product manager': {
    intro: 'Keep the outcome connected to the work.',
    focus: 'From customer evidence to a reviewed decision, a build and a measurable result.',
    areas: ['delivery', 'success', 'metrics', 'company'],
  },
  Developer: {
    intro: 'Clarity before the next commit.',
    focus: 'See your sprint, inspect the requirement and carry the project straight into code.',
    areas: ['delivery', 'code', 'qa', 'botteams'],
  },
  QA: {
    intro: 'Confidence before release.',
    focus: 'Review acceptance criteria, inspect evidence and bring failures back to their owners.',
    areas: ['qa', 'delivery', 'success', 'release'],
  },
  Designer: {
    intro: 'Give the product a coherent language.',
    focus: 'Bring design decisions, reusable systems and reviewed prototypes into delivery.',
    areas: ['delivery', 'studio', 'company', 'success'],
  },
  Finance: {
    intro: 'Every commitment, in context.',
    focus: 'Review budgets, commercial decisions and the evidence behind a forecast.',
    areas: ['finance', 'revenue', 'metrics', 'company'],
  },
  Sales: {
    intro: 'Move the relationship forward.',
    focus: 'Know the account, choose the next step and make a clear commercial handoff.',
    areas: ['revenue', 'success', 'finance', 'growth'],
  },
  'Customer success': {
    intro: 'Close the loop with the customer.',
    focus: 'Turn feedback into owned work, verify the outcome and prepare a thoughtful update.',
    areas: ['success', 'revenue', 'delivery', 'metrics'],
  },
  HR: {
    intro: 'Make room for people to do good work.',
    focus:
      'Coordinate onboarding, workload and agreed goals without reducing people to activity counts.',
    areas: ['people', 'delivery', 'company', 'metrics'],
  },
  DevOps: {
    intro: 'Operate with a clear way back.',
    focus: 'Connect release health, incident evidence and reviewed cost improvements.',
    areas: ['ops', 'release', 'finance', 'botteams'],
  },
  CXO: {
    intro: 'See the company, not just the activity.',
    focus: 'Follow goals, investment and delivery confidence back to the evidence.',
    areas: ['company', 'metrics', 'finance', 'people'],
  },
  'Program manager': {
    intro: 'See the dependencies. Protect the outcome.',
    focus: 'Review portfolio milestones, team capacity and cross-functional decisions.',
    areas: ['company', 'delivery', 'people', 'metrics'],
  },
  Viewer: {
    intro: 'Stay informed. Keep the context.',
    focus: 'Inspect shared work and evidence without changing it.',
    areas: ['company', 'metrics', 'delivery'],
  },
  Marketing: {
    intro: 'Make the story match the product.',
    focus: 'Prepare campaigns, review claims and coordinate launches with real availability.',
    areas: ['growth', 'metrics', 'revenue', 'release'],
  },
};
export const roleAliases: Record<string, string> = {
  'QA reviewer': 'QA',
  'QA engineer': 'QA',
  'Customer experience': 'Customer success',
  'People & HR': 'HR',
  Executive: 'CXO',
  Owner: 'CXO',
  Admin: 'CXO',
  Administrator: 'CXO',
  'Marketing manager': 'Marketing',
};
export function canonicalCompanyRole(role: string) {
  return roleAliases[role] || role;
}
export function roleHome(role: string) {
  return roleRoutes[canonicalCompanyRole(role)] || roleRoutes['Product manager'];
}
export function makeCompanyRecord(
  feature: string,
  title: string,
  owner: string,
  values: Record<string, string>,
  projectId = '',
  stage?: string,
): CompanyRecord {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    feature,
    title,
    owner,
    stage: stage || companySchemas[feature].stages[0],
    values: { ...companyDefaults(feature), ...values },
    projectId,
    createdAt: now,
    updatedAt: now,
    history: [
      { at: now, stage: stage || companySchemas[feature].stages[0], note: 'Record created' },
    ],
  };
}
