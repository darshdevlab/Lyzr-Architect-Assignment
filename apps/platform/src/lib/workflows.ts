export interface Workflow {
  id: string;
  title: string;
  treatment: string;
  scope: string;
  area: string;
}
export interface WorkflowField {
  key: string;
  label: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}
export interface WorkflowRecipe {
  intro: string;
  fields: WorkflowField[];
  outcome: string;
  handoff: string;
  handoffLabel: string;
}
export const workflows: Workflow[] = [
  {
    id: 'ORG-E1',
    title: 'Role-aware onboarding',
    treatment: 'Enhance',
    scope:
      'Signup/login/logout, profile/settings, personal or development-team workspace, builder/developer/QA/designer entry views, invitations and all theme modes.',
    area: 'settings',
  },
  {
    id: 'ORG-E2',
    title: 'Project-scoped permissions',
    treatment: 'Enhance',
    scope:
      'Project/team membership, owner/admin/builder/reviewer/viewer scopes, environment permissions and basic billing authority.',
    area: 'settings',
  },
  {
    id: 'ORG-E3',
    title: 'Collaborative project access',
    treatment: 'Enhance',
    scope: 'Project/doc/design invitations, comments, review access, ownership and safe removal.',
    area: 'settings',
  },
  {
    id: 'ORG-E4',
    title: 'Workspace budgets and administration',
    treatment: 'Enhance',
    scope:
      'Visible credits, usage, estimates, plans/purchases, invoices, project budgets, payer visibility and BYOK distinction.',
    area: 'settings',
  },
  {
    id: 'ORG-N1',
    title: 'Role home and assigned work',
    treatment: 'New',
    scope: 'My projects, build/developer/QA queues, recent work and resume/deep-link behavior.',
    area: 'settings',
  },
  {
    id: 'ORG-N3',
    title: 'Approval inbox',
    treatment: 'New',
    scope: 'Project-scoped plan/design/PR/test/release/access/budget decisions.',
    area: 'settings',
  },
  {
    id: 'PLAN-E1',
    title: 'Living specification',
    treatment: 'Enhance',
    scope:
      'Prompt-generated PRD/TRD, editable assumptions/acceptance criteria, versions and direct builder handoff; manual authoring optional.',
    area: 'plan',
  },
  {
    id: 'PLAN-E2',
    title: 'Discovery and prioritization',
    treatment: 'Enhance',
    scope:
      'App idea clarification, simple source-backed scope and feasibility for the current project.',
    area: 'plan',
  },
  {
    id: 'PLAN-E3',
    title: 'Reusable planning templates',
    treatment: 'Enhance',
    scope: 'Project brief, PRD/TRD and technical planning templates.',
    area: 'plan',
  },
  {
    id: 'PLAN-E4',
    title: 'Collaborative artifact review',
    treatment: 'Enhance',
    scope:
      'Project documents/design reviews, comments, version comparisons and implementation handoff.',
    area: 'plan',
  },
  {
    id: 'PLAN-N2',
    title: 'Project wiki and documentation',
    treatment: 'New',
    scope: 'Project wiki, architecture decisions, API docs, setup guides and runbooks.',
    area: 'plan',
  },
  {
    id: 'PLAN-N3',
    title: 'Requirement-to-release traceability',
    treatment: 'New',
    scope: 'Requirement \u2192 source change \u2192 test \u2192 release traceability for apps.',
    area: 'plan',
  },
  {
    id: 'BUILD-E1',
    title: 'Guided and advanced build views',
    treatment: 'Enhance',
    scope:
      'Complete prompt-first app builder for non-technical users plus code/terminal/advanced views for developers.',
    area: 'studio',
  },
  {
    id: 'BUILD-E2',
    title: 'Point-and-prompt editing',
    treatment: 'Enhance',
    scope:
      'Select UI element/region \u2192 prompt \u2192 compare/apply/undo; persistent main composer.',
    area: 'studio',
  },
  {
    id: 'BUILD-E3',
    title: 'Design-system continuity',
    treatment: 'Enhance',
    scope:
      'App design tokens/themes/responsive states; three platform themes each with light/dark/system; project design-system use.',
    area: 'studio',
  },
  {
    id: 'BUILD-E4',
    title: 'Understandable generation and recovery',
    treatment: 'Enhance',
    scope:
      'Lead plus frontend/backend/data/integration builder specialists; visible generation, stop/queue/retry/checkpoints; independent testing.',
    area: 'studio',
  },
  {
    id: 'BUILD-N1',
    title: 'Interactive journey map',
    treatment: 'New',
    scope:
      'Connect screens, navigation, roles and loading/empty/error states into a map; select a journey to preview or send to QA.',
    area: 'studio',
  },
  {
    id: 'BUILD-N2',
    title: 'Approved component catalog',
    treatment: 'New',
    scope: 'Use and version approved components inside development projects.',
    area: 'studio',
  },
  {
    id: 'BUILD-N3',
    title: 'Optional waiting activities',
    treatment: 'New',
    scope:
      'Optional multiple solo games/personal challenges while builds run; preserve all build controls.',
    area: 'studio',
  },
  {
    id: 'CODE-E1',
    title: 'Reliable repository onboarding',
    treatment: 'Enhance',
    scope:
      'Enhance GitHub import with repository/branch selection, framework/runtime detection, setup diagnostics and ownership mapping. Show inaccessible repositories and missing permissions clearly.',
    area: 'code',
  },
  {
    id: 'CODE-E2',
    title: 'Controlled Git synchronization',
    treatment: 'Enhance',
    scope:
      'Enhance outgoing commits with explicit branch context, sync status and conflict resolution. Provider state is authoritative; do not overwrite newer external changes.',
    area: 'code',
  },
  {
    id: 'CODE-E3',
    title: 'Reviewable change history',
    treatment: 'Enhance',
    scope:
      'Diffs/history and compatible source/document/agent/config checkpoints; restore exclusions explicit.',
    area: 'code',
  },
  {
    id: 'CODE-E4',
    title: 'Runtime configuration',
    treatment: 'Enhance',
    scope:
      'Environment configuration and scoped secret references for generated apps and managed execution.',
    area: 'code',
  },
  {
    id: 'CODE-N1',
    title: 'Browser development workspace',
    treatment: 'New',
    scope:
      'Editor, terminal, search, language diagnostics, dependency management, run/debug commands and logs inside Architect; developers can use normal code tools alongside prompts.',
    area: 'code',
  },
  {
    id: 'CODE-N2',
    title: 'Pull-request workspace',
    treatment: 'New',
    scope:
      'Open or create a PR; converse on its diff; propose fixes, run checks, request reviewers, resolve comments and merge only when repository policies allow. Display external updates and stale approvals.',
    area: 'code',
  },
  {
    id: 'CODE-N3',
    title: 'Multi-repository service workspace',
    treatment: 'New',
    scope:
      'Attach several repositories to one product, map service/API dependencies and exact commit versions, run selected services with mocks or live dependencies, and coordinate related PRs and release order.',
    area: 'code',
  },
  {
    id: 'CODE-N4',
    title: 'Validated application container export',
    treatment: 'New',
    scope: 'Export generated application Docker/container packages and validate portability.',
    area: 'code',
  },
  {
    id: 'AGENT-E1',
    title: 'Unified agent lifecycle',
    treatment: 'Enhance',
    scope:
      'Create/configure/test/version app agents; show app-agent inventory, runs and available usage/traces inside Architect.',
    area: 'agents',
  },
  {
    id: 'AGENT-E2',
    title: 'Bot hierarchy and delegation',
    treatment: 'Enhance',
    scope:
      'Multi-agent app build/test orchestration plus agent hierarchy used inside generated applications.',
    area: 'agents',
  },
  {
    id: 'AGENT-E3',
    title: 'Recurring and event-driven work',
    treatment: 'Enhance',
    scope: 'Retain existing agent schedules/triggers and project build/test automation.',
    area: 'agents',
  },
  {
    id: 'AGENT-E4',
    title: 'Permissioned memory and tool use',
    treatment: 'Enhance',
    scope:
      'Project/app-agent memory/tool permissions, approved developer MCP/plugins, scoped context and human decisions.',
    area: 'agents',
  },
  {
    id: 'AGENT-N2',
    title: 'Framework adapters',
    treatment: 'New',
    scope:
      'Developer-facing framework author/import/export adapters with explicit capability validation.',
    area: 'agents',
  },
  {
    id: 'MODEL-E1',
    title: 'Unified model selection',
    treatment: 'Enhance',
    scope: 'Builder and generated-app agent model selection.',
    area: 'models',
  },
  {
    id: 'MODEL-E2',
    title: 'Managed and customer-funded providers',
    treatment: 'Enhance',
    scope:
      'Managed models, BYOK/OpenRouter-style routing and funding distinction with per-run costs.',
    area: 'models',
  },
  {
    id: 'MODEL-E3',
    title: 'Task-aware smart routing',
    treatment: 'Enhance',
    scope:
      'Task-aware model routing for builds/app agents with capability, latency, budget and data rules.',
    area: 'models',
  },
  {
    id: 'MODEL-E4',
    title: 'Single-model and per-agent presets',
    treatment: 'Enhance',
    scope: 'Single-model/per-agent/default routing presets for development.',
    area: 'models',
  },
  {
    id: 'MODEL-N1',
    title: 'Private/open-weight endpoint catalog',
    treatment: 'New',
    scope:
      'Connect approved accessible open-weight/private provider endpoints as an inference consumer.',
    area: 'models',
  },
  {
    id: 'MODEL-N2',
    title: 'Workload evaluation and routing experiments',
    treatment: 'New',
    scope:
      'Run the same representative tasks across eligible models, compare correctness/cost/latency, approve a routing policy and canary it before broad use.',
    area: 'models',
  },
  {
    id: 'MODEL-N3',
    title: 'Inference operations console',
    treatment: 'New',
    scope: 'Developer endpoint/connector health, usage and quotas for project models.',
    area: 'models',
  },
  {
    id: 'DATA-E1',
    title: 'Unified data setup',
    treatment: 'Enhance',
    scope:
      'Extend automatic backend setup with a visible schema, sample data, validation and migration review; distinguish demo storage from persistent backend data.',
    area: 'data',
  },
  {
    id: 'DATA-E2',
    title: 'Connection lifecycle',
    treatment: 'Enhance',
    scope:
      'GitHub, app backend/data/model connections, developer MCP/plugins, scope/health/reconnect/revoke flows.',
    area: 'data',
  },
  {
    id: 'DATA-E3',
    title: 'Grounded project context',
    treatment: 'Enhance',
    scope: 'Project docs/images/references, citations, freshness and bounded builder context.',
    area: 'data',
  },
  {
    id: 'DATA-E4',
    title: 'Generated-app identity',
    treatment: 'Enhance',
    scope:
      'Generated-app login, roles, invitations and test identities distinct from Architect identity.',
    area: 'data',
  },
  {
    id: 'DATA-N3',
    title: 'Portable context packages',
    treatment: 'New',
    scope:
      'Portable code/project docs/context and supported agent configuration, with dependency manifest.',
    area: 'data',
  },
  {
    id: 'QA-E1',
    title: 'Acceptance-driven testing',
    treatment: 'Enhance',
    scope: 'App acceptance criteria, technical QA and app-owner UAT.',
    area: 'qa',
  },
  {
    id: 'QA-E2',
    title: 'UI verification and repair loop',
    treatment: 'Enhance',
    scope: 'UI/browser/accessibility tests and builder repair loop with evidence.',
    area: 'qa',
  },
  {
    id: 'QA-E3',
    title: 'Agent behavior evaluations',
    treatment: 'Enhance',
    scope: 'Generated-app/build-agent behavior tests and model comparisons.',
    area: 'qa',
  },
  {
    id: 'QA-E4',
    title: 'QA review and reproducibility',
    treatment: 'Enhance',
    scope:
      'Extend reports/artifacts with replayable steps, screenshots, logs, severity, flaky-test labeling and sign-off tied to exact code, agent and model versions.',
    area: 'qa',
  },
  {
    id: 'QA-N1',
    title: 'Service test matrix',
    treatment: 'New',
    scope:
      'Independent specialist UI/function/API/integration/security/performance tests appropriate to app; isolated/subset/full-stack service matrix.',
    area: 'qa',
  },
  {
    id: 'QA-N2',
    title: 'Preview-environment test data',
    treatment: 'New',
    scope: 'Managed isolated previews, seeded test identities/data, expiry and cleanup.',
    area: 'qa',
  },
  {
    id: 'QA-N3',
    title: 'Quality gate policy',
    treatment: 'New',
    scope:
      'Combine code scans, dependencies, tests, agent evals and required human reviews into a release decision. Explain blockers and any authorized exception rather than hiding failed checks.',
    area: 'qa',
  },
  {
    id: 'RELEASE-E1',
    title: 'Environment-aware deployment',
    treatment: 'Enhance',
    scope: 'Preview/staging/production deployment flow for generated apps.',
    area: 'release',
  },
  {
    id: 'RELEASE-E2',
    title: 'Ownership and hosting choices',
    treatment: 'Enhance',
    scope: 'Managed or customer-owned generated-app hosting; repo/hosting ownership and costs.',
    area: 'release',
  },
  {
    id: 'RELEASE-E3',
    title: 'Domain and runtime readiness',
    treatment: 'Enhance',
    scope: 'Generated-app domains/TLS/environment/secrets and runtime health.',
    area: 'release',
  },
  {
    id: 'RELEASE-E4',
    title: 'Publishing and release communication',
    treatment: 'Enhance',
    scope: 'App publication/listing with visibility, owner-cost disclosure and release notes.',
    area: 'release',
  },
  {
    id: 'RELEASE-N1',
    title: 'Coordinated service releases',
    treatment: 'New',
    scope:
      'Pin the repository commits and service versions in a release manifest; sequence compatible changes and block incompatible API/data migrations.',
    area: 'release',
  },
  {
    id: 'RELEASE-N2',
    title: 'Gradual rollout and rollback',
    treatment: 'New',
    scope: 'Application staged rollout/rollback with artifact/schema compatibility warnings.',
    area: 'release',
  },
  {
    id: 'RELEASE-N3',
    title: 'Release readiness room',
    treatment: 'New',
    scope: 'Developer release readiness: checks, reviewers, owner decision, runbooks.',
    area: 'release',
  },
  {
    id: 'RELEASE-N4',
    title: 'Product retirement and migration',
    treatment: 'New',
    scope: 'Application deprecation/migration and owned resource cleanup.',
    area: 'release',
  },
  {
    id: 'OPS-E1',
    title: 'Unified application and agent telemetry',
    treatment: 'Enhance',
    scope:
      'Application and app-agent logs/traces/errors/runtime health and Lyzr-visible telemetry through validated adapters.',
    area: 'ops',
  },
  {
    id: 'OPS-E2',
    title: 'Role-specific operational reports',
    treatment: 'Enhance',
    scope: 'Builder/developer/QA/DevOps operational reports.',
    area: 'ops',
  },
  {
    id: 'OPS-E3',
    title: 'Run and spend investigation',
    treatment: 'Enhance',
    scope:
      'Run/project/agent/model/API costs, credit ledger and confirmed vs estimated provider charges.',
    area: 'ops',
  },
  {
    id: 'OPS-E4',
    title: 'Improvement backlog',
    treatment: 'Enhance',
    scope: 'App errors/test failures and performance findings become developer improvement tasks.',
    area: 'ops',
  },
  {
    id: 'OPS-N1',
    title: 'Alerts and incident response',
    treatment: 'New',
    scope: 'Application/agent alerts, incident evidence, owner routing and recovery tasks.',
    area: 'ops',
  },
  {
    id: 'OPS-N3',
    title: 'Release outcome tracking',
    treatment: 'New',
    scope: 'App release adoption/reliability metrics against project intent.',
    area: 'ops',
  },
];
const choice = (key: string, label: string, options: string[]): WorkflowField => ({
  key,
  label,
  options,
  required: true,
});
const input = (
  key: string,
  label: string,
  placeholder: string,
  required = true,
): WorkflowField => ({ key, label, placeholder, required });
const recipe = (
  intro: string,
  fields: WorkflowField[],
  outcome: string,
  handoff: string,
  handoffLabel: string,
): WorkflowRecipe => ({ intro, fields, outcome, handoff, handoffLabel });
const env = () => choice('environment', 'Environment', ['Preview', 'Staging', 'Production']);
const evidence = () =>
  input(
    'evidence',
    'Evidence or decision notes',
    'Describe the evidence, assumptions or acceptance criteria',
  );
const owner = () => input('owner', 'Responsible owner', 'e.g. Darsh · project owner');
export const recipes: Record<string, WorkflowRecipe> = {
  'ORG-E1': recipe(
    'Choose the starting experience for a development workspace.',
    [
      choice('role', 'My role', ['Builder', 'Developer', 'QA', 'Designer']),
      choice('workspace', 'Workspace type', ['Personal', 'Development team']),
      choice('appearance', 'Appearance', ['Light', 'Dark', 'System']),
    ],
    'Onboarding preferences recorded. Account authentication and appearance are available from your profile menu.',
    'today',
    'Go to my work',
  ),
  'ORG-E2': recipe(
    'Preview permissions before granting access.',
    [
      input('email', 'Member email', 'teammate@example.com'),
      choice('role', 'Project role', ['Viewer', 'Reviewer', 'Builder', 'Admin']),
      env(),
      choice('billing', 'Billing authority', [
        'No billing access',
        'View costs',
        'Manage project budget',
      ]),
    ],
    'Permission proposal saved. No invitation or external access grant is sent in demo mode.',
    'settings',
    'Review team access',
  ),
  'ORG-E3': recipe(
    'Share one artifact with the minimum necessary access.',
    [
      input('email', 'Invitee email', 'reviewer@example.com'),
      choice('artifact', 'Share scope', ['Current project', 'PRD / TRD', 'Design review']),
      choice('access', 'Permission', ['Comment', 'Review', 'Edit']),
      input('expiry', 'Access expiry', '7 days'),
    ],
    'Share invitation draft saved with scope and expiry. Sending invitations requires a connected mail service.',
    'plan',
    'Open shared artifact',
  ),
  'ORG-E4': recipe(
    'Set a project limit before a long build.',
    [
      input('budget', 'Monthly project budget (USD)', '0'),
      choice('funding', 'Funding source', [
        'Free provider allowance',
        'Customer API key',
        'Managed credits',
      ]),
      choice('limit', 'On limit', ['Pause and ask owner', 'Allow free eligible models only']),
      owner(),
    ],
    'Budget preference saved for review. This prototype does not purchase credits or enforce provider-side billing.',
    'models',
    'Review model funding',
  ),
  'ORG-N1': recipe(
    'Make your next action visible when you return.',
    [
      choice('queue', 'Default queue', ['My projects', 'Build work', 'Code reviews', 'QA runs']),
      choice('resume', 'Resume behavior', ['Last open project', 'Assigned work', 'Project list']),
    ],
    'Home preference saved; project links keep the active project in context.',
    'today',
    'Open my work',
  ),
  'ORG-N3': recipe(
    'Record an explicit project decision.',
    [
      choice('type', 'Decision type', [
        'Plan',
        'Design',
        'Pull request',
        'Test sign-off',
        'Release',
        'Access',
        'Budget',
      ]),
      choice('decision', 'Decision', ['Approve', 'Request changes', 'Reject']),
      evidence(),
    ],
    'Decision recorded in the local activity history with its project and revision.',
    'plan',
    'Return to project',
  ),
  'PLAN-E1': recipe(
    'Turn a prompt into a reviewable implementation contract.',
    [
      choice('document', 'Document', ['PRD', 'TRD', 'Both']),
      choice('source', 'Starting point', ['Current project brief', 'Manual draft', 'Template']),
      evidence(),
    ],
    'Specification review saved. Edit the actual project documents below, then pass them directly to Build Studio.',
    'studio',
    'Open Builder',
  ),
  'PLAN-E2': recipe(
    'Clarify the smallest useful release before generating it.',
    [
      input('user', 'Primary user', 'Who is this application for?'),
      input('problem', 'Problem to solve', 'What gets easier for this user?'),
      input('success', 'Success measure', 'What observable outcome matters?'),
      choice('risk', 'Main feasibility risk', [
        'None identified',
        'Data access',
        'External API',
        'Authentication',
        'Complex integration',
      ]),
    ],
    'Discovery answers saved alongside this project. Validate assumptions before building.',
    'plan',
    'Refine specification',
  ),
  'PLAN-E3': recipe(
    'Reuse structure without inheriting another project’s data.',
    [
      choice('template', 'Template', [
        'Lean app brief',
        'Product requirements',
        'Technical design',
        'API-first service',
        'Agentic application',
      ]),
      choice('mode', 'Apply as', ['New document draft', 'Append to current draft']),
    ],
    'Template choice saved. The Planning document controls can insert a scoped starter into the editable draft.',
    'plan',
    'Open document editor',
  ),
  'PLAN-E4': recipe(
    'Ask for a focused review tied to a document revision.',
    [
      choice('artifact', 'Artifact', ['PRD', 'TRD', 'Design system']),
      input('reviewer', 'Reviewer', 'teammate@example.com'),
      input('question', 'Review question', 'What must the reviewer verify?'),
      choice('status', 'Review disposition', [
        'Request review',
        'Approve with notes',
        'Request changes',
      ]),
    ],
    'Review record saved for this revision. External notifications are not sent.',
    'studio',
    'Continue implementation',
  ),
  'PLAN-N2': recipe(
    'Keep operating knowledge attached to the application.',
    [
      choice('kind', 'Document type', [
        'Project wiki',
        'Architecture decision',
        'API reference',
        'Setup guide',
        'Runbook',
      ]),
      input('title', 'Document title', 'How to run this application'),
      input('content', 'Document content', 'Describe decisions, setup commands or recovery steps'),
    ],
    'Documentation draft saved in the project workflow record and available in its exported context package.',
    'code',
    'Open development workspace',
  ),
  'PLAN-N3': recipe(
    'Follow one requirement from intent to release.',
    [
      input('requirement', 'Requirement ID', 'REQ-001'),
      input('change', 'Change / commit reference', 'feature/add-sign-in'),
      input('test', 'Test reference', 'QA-001'),
      input('release', 'Release reference', 'Preview v1'),
    ],
    'Traceability link recorded. References are manually entered until repository and test adapters are connected.',
    'qa',
    'Verify requirement',
  ),
  'BUILD-E1': recipe(
    'Keep one prompt available while choosing your working depth.',
    [
      choice('view', 'Build view', ['Guided', 'Developer']),
      input('prompt', 'Build instruction', 'Build a useful first version of this project'),
    ],
    'Build instruction prepared. Submit it in the persistent Studio composer to run generation.',
    'studio',
    'Open persistent composer',
  ),
  'BUILD-E2': recipe(
    'Change a selected part of the interface with a precise instruction.',
    [
      input('target', 'Element or region', 'Hero heading, primary button, sidebar…'),
      input('instruction', 'Change instruction', 'Describe what should change'),
      choice('apply', 'Apply behavior', ['Review before apply', 'Save as alternative']),
    ],
    'Visual change request saved. Studio provides preview, comparison and revision controls.',
    'studio',
    'Open visual builder',
  ),
  'BUILD-E3': recipe(
    'Keep generated screens consistent with one approved system.',
    [
      choice('style', 'Project design system', [
        'Use platform theme',
        'Editorial neutral',
        'Calm product',
        'Developer dark',
      ]),
      input('accent', 'Accent color', '#8b583f'),
      choice('viewport', 'Responsive target', ['All sizes', 'Desktop', 'Tablet', 'Mobile']),
    ],
    'Design direction saved. Review responsive behavior in Studio before approving it.',
    'studio',
    'Preview the design',
  ),
  'BUILD-E4': recipe(
    'Control an orchestrated build without losing the last good result.',
    [
      choice('team', 'Build team', [
        'Lead + frontend + backend + data + QA',
        'Frontend + QA',
        'API + data + QA',
      ]),
      choice('recovery', 'On failure', [
        'Pause at checkpoint',
        'Retry once then ask',
        'Ask for guidance',
      ]),
    ],
    'Build team and recovery preferences saved. Run history should distinguish generated artifacts from simulated agent stages.',
    'studio',
    'Run a build',
  ),
  'BUILD-N1': recipe(
    'Map a user action to its next screen and recovery state.',
    [
      input('from', 'Starting screen', 'Sign in'),
      input('action', 'User action', 'Submit credentials'),
      input('to', 'Destination', 'Workspace home'),
      choice('state', 'State to verify', [
        'Success',
        'Loading',
        'Empty',
        'Error',
        'Permission denied',
      ]),
    ],
    'Journey edge saved for this project and ready for QA review.',
    'qa',
    'Test this journey',
  ),
  'BUILD-N2': recipe(
    'Choose components whose behavior and ownership are known.',
    [
      choice('component', 'Component', [
        'Navigation shell',
        'Authentication card',
        'Data table',
        'Prompt composer',
        'Agent status card',
      ]),
      input('version', 'Approved version', '1.0.0'),
      choice('policy', 'Updates', ['Pin this version', 'Review updates manually']),
    ],
    'Component dependency recorded; no remote package is installed by this prototype action.',
    'studio',
    'Use in Builder',
  ),
  'BUILD-N3': recipe(
    'Use an optional activity while retaining control of a build.',
    [
      choice('game', 'Activity', ['Memory pairs', 'Reaction challenge']),
      choice('difficulty', 'Difficulty', ['Relaxed', 'Standard', 'Challenge']),
    ],
    'Activity preference recorded. Open Studio’s waiting activities without leaving the current build.',
    'studio',
    'Open build activities',
  ),
  'CODE-E1': recipe(
    'Inspect a repository before importing its contents.',
    [
      input('repository', 'GitHub repository URL', 'https://github.com/owner/repository'),
      input('branch', 'Branch', 'main'),
      choice('runtime', 'Expected runtime', [
        'Detect automatically',
        'Node.js',
        'Python',
        'Static HTML',
      ]),
      choice('permission', 'Access check', ['Not checked', 'Read available', 'Permission missing']),
    ],
    'Repository import plan saved. Actual permission and source checks are required before any real import.',
    'code',
    'Open source workspace',
  ),
  'CODE-E2': recipe(
    'Review outgoing changes and their target branch.',
    [
      input('branch', 'Target branch', 'feature/architect-update'),
      input('message', 'Commit message', 'Describe the project change'),
      choice('remote', 'Remote state', [
        'Unknown — fetch required',
        'Up to date',
        'Newer external changes',
      ]),
      choice('conflict', 'Conflict strategy', ['Stop and review', 'Create a separate branch']),
    ],
    'Synchronization proposal saved. No remote commit, push or overwrite was performed.',
    'code',
    'Review changes',
  ),
  'CODE-E3': recipe(
    'Restore a source checkpoint without silently changing external data.',
    [
      choice('snapshot', 'Checkpoint', ['Current revision', 'Previous local checkpoint']),
      choice('scope', 'Restore scope', [
        'Source + docs',
        'Agent configuration',
        'Runtime configuration',
      ]),
      input('reason', 'Reason for restore', 'Why return to this checkpoint?'),
    ],
    'Restore plan saved. Databases, remote resources and secret values are excluded. Use Studio history for actual local source restoration.',
    'studio',
    'Open build history',
  ),
  'CODE-E4': recipe(
    'Keep configuration separate from source and environments.',
    [
      env(),
      input('name', 'Variable name', 'PUBLIC_API_URL'),
      choice('kind', 'Value type', ['Public configuration', 'Server secret reference']),
      input(
        'reference',
        'Value or secret reference',
        'For secrets enter a reference name, never a secret value',
      ),
    ],
    'Configuration reference saved locally. No secret is transmitted or installed on a runtime.',
    'release',
    'Check environment readiness',
  ),
  'CODE-N1': recipe(
    'Prepare a browser development session.',
    [
      choice('action', 'Workspace action', [
        'Edit source',
        'Search files',
        'Run diagnostics',
        'Manage dependency',
        'Inspect logs',
      ]),
      input('target', 'File, command or package', 'src/App.tsx'),
      choice('runtime', 'Execution mode', ['Local preview', 'Managed sandbox (demo)']),
    ],
    'Workspace action recorded. The source panel supports local edits; terminal output is simulated, not arbitrary server execution.',
    'code',
    'Open editor',
  ),
  'CODE-N2': recipe(
    'Make review and merge criteria visible.',
    [
      input('title', 'PR title', 'Add the first application flow'),
      input('branch', 'Head branch', 'feature/first-flow'),
      input('reviewer', 'Reviewer', 'reviewer@example.com'),
      choice('checks', 'Required checks', [
        'Tests + reviewer approval',
        'Tests + security + approval',
      ]),
      choice('decision', 'Action', ['Create PR draft', 'Request changes', 'Approve draft']),
    ],
    'Pull-request draft recorded. Real creation or merge requires GitHub authorization and current remote checks.',
    'qa',
    'Run required checks',
  ),
  'CODE-N3': recipe(
    'Attach explicit service versions and test their dependencies.',
    [
      input('service', 'Service name', 'api'),
      input('repository', 'Repository URL', 'https://github.com/owner/api'),
      input('commit', 'Pinned commit or branch', 'main'),
      choice('dependency', 'Dependency mode', [
        'Mock dependencies',
        'Selected live services',
        'Full stack',
      ]),
    ],
    'Service dependency draft saved. No repository is cloned or service started by this demo flow.',
    'qa',
    'Open service test matrix',
  ),
  'CODE-N4': recipe(
    'Package the generated application for an external runtime.',
    [
      choice('runtime', 'Container target', ['Static Nginx', 'Node.js', 'Python']),
      input('port', 'Container port', '8080'),
      choice('validation', 'Validation target', [
        'Build instructions only',
        'Local Docker check required',
      ]),
    ],
    'Container recipe saved. Export is a starter package; portability must be checked in a real Docker runtime before deployment.',
    'release',
    'Review hosting target',
  ),
  'AGENT-E1': recipe(
    'Give an app agent a bounded task and a test case.',
    [
      input('name', 'Agent name', 'Support triage agent'),
      input(
        'instruction',
        'Agent instruction',
        'Classify requests and ask before taking external actions',
      ),
      choice('stage', 'Lifecycle', ['Draft', 'Test candidate', 'Approved version']),
      input('test', 'Representative test', 'A user asks to reset their account'),
    ],
    'Agent configuration saved as a prototype draft. A live provider connection is needed to execute it.',
    'qa',
    'Evaluate this agent',
  ),
  'AGENT-E2': recipe(
    'Create an app-specific team with an explicit delegation boundary.',
    [
      input('lead', 'Lead agent', 'Application coordinator'),
      input('specialists', 'Specialists', 'Frontend, backend, data, independent QA'),
      choice('delegation', 'Delegation mode', [
        'Sequential',
        'Parallel then review',
        'Lead chooses specialist',
      ]),
      choice('approval', 'Human checkpoint', [
        'Before external action',
        'Before deployment',
        'Every delegation',
      ]),
    ],
    'App-agent delegation topology saved. Company-wide employee bot teams belong to Architect 3.0.',
    'agents',
    'Open agent canvas',
  ),
  'AGENT-E3': recipe(
    'Specify when a project task may run.',
    [
      choice('trigger', 'Trigger', ['Manual', 'Daily', 'Weekly', 'Repository event']),
      input('task', 'Task', 'Run regression suite'),
      input('timezone', 'Timezone', 'Asia/Kolkata'),
      choice('approval', 'Execution policy', ['Require approval', 'Read-only tasks automatically']),
    ],
    'Schedule draft saved. No background scheduler is running in this prototype.',
    'ops',
    'Review automation activity',
  ),
  'AGENT-E4': recipe(
    'Limit what an agent can read and act on.',
    [
      choice('context', 'Context boundary', [
        'This project only',
        'Selected documents',
        'Selected repository paths',
      ]),
      input('tools', 'Approved tools / MCP', 'GitHub read, documentation search'),
      choice('memory', 'Memory', ['No persistent memory', 'Project-scoped memory']),
      choice('writes', 'Write permission', ['Ask before every write', 'Approved sandbox writes']),
    ],
    'Permission policy saved as a draft. It does not grant connector permissions or expose account secrets.',
    'data',
    'Review connections',
  ),
  'AGENT-N2': recipe(
    'Choose the framework while keeping adapter limitations visible.',
    [
      choice('framework', 'Framework', [
        'Lyzr',
        'OpenAI Agents SDK',
        'LangGraph',
        'CrewAI',
        'Custom adapter',
      ]),
      choice('direction', 'Operation', ['Author', 'Import configuration', 'Export configuration']),
      choice('capability', 'Required capability', [
        'Tool calling',
        'Delegation',
        'Memory',
        'Streaming',
      ]),
    ],
    'Framework adapter request saved. Runtime compatibility must be validated; selecting a framework does not install it.',
    'agents',
    'Inspect agent configuration',
  ),
  'MODEL-E1': recipe(
    'Select a model suited to the build or agent task.',
    [
      choice('family', 'Model family', [
        'Auto · eligible free models',
        'OpenAI',
        'Anthropic',
        'Google',
        'Open-weight',
      ]),
      choice('task', 'Task', ['Planning', 'UI generation', 'Code', 'Independent QA']),
      choice('funding', 'Cost constraint', ['Free only', 'Use approved provider balance']),
    ],
    'Model preference saved. Studio’s live model selector is authoritative for actual prompt execution.',
    'studio',
    'Open live model selector',
  ),
  'MODEL-E2': recipe(
    'Separate provider billing from Architect demo credits.',
    [
      choice('provider', 'Provider', ['OpenRouter', 'Managed provider', 'Customer endpoint']),
      choice('source', 'Funding', ['Free allowance', 'Bring your own key']),
      input(
        'reference',
        'Credential reference',
        'OPENROUTER_API_KEY — never paste the secret here',
      ),
    ],
    'Provider reference saved. Credentials must be configured securely on the server.',
    'models',
    'Review provider health',
  ),
  'MODEL-E3': recipe(
    'Prioritize compatible models before cost and latency.',
    [
      choice('priority', 'Routing priority', [
        'Balanced',
        'Quality first',
        'Latency first',
        'Cost first',
      ]),
      choice('capability', 'Required capability', ['Text', 'Code', 'Vision', 'Tools']),
      choice('fallback', 'On no eligible model', [
        'Pause and explain',
        'Retry eligible free model',
      ]),
      input('budget', 'Per-run limit (USD)', '0'),
    ],
    'Routing policy draft saved. Only implemented server routing can enforce budget and provider constraints.',
    'studio',
    'Use live routing',
  ),
  'MODEL-E4': recipe(
    'Choose consistency or specialize the model for each task.',
    [
      choice('mode', 'Preset mode', ['Single model', 'Per-agent models', 'Smart routing']),
      choice('planning', 'Planning model', ['Auto free', 'User choice']),
      choice('building', 'Builder model', ['Auto free', 'User choice']),
      choice('testing', 'Independent tester model', [
        'Different eligible model',
        'Same model, separate context',
      ]),
    ],
    'Per-agent routing preset saved for project review. Independent QA remains a separate decision from generation.',
    'agents',
    'Assign to app agents',
  ),
  'MODEL-N1': recipe(
    'Register an inference endpoint without claiming to host it.',
    [
      input('label', 'Endpoint name', 'My open-weight endpoint'),
      input('url', 'Endpoint URL', 'https://inference.example.com/v1'),
      choice('capability', 'Protocol', ['OpenAI-compatible', 'Custom adapter']),
      input('secret', 'Secret reference', 'PRIVATE_MODEL_KEY'),
    ],
    'Endpoint draft saved. The prototype does not contact unverified endpoints or provision model infrastructure.',
    'models',
    'Inspect inference health',
  ),
  'MODEL-N2': recipe(
    'Compare the same workload before changing routing.',
    [
      input('task', 'Representative task', 'Generate an accessible sign-in form'),
      input('models', 'Candidate model IDs', 'Enter two eligible provider model IDs'),
      choice('metric', 'Primary measure', ['Correctness', 'Cost', 'Latency', 'Tool reliability']),
      choice('rollout', 'Policy rollout', ['Review only', '10% canary proposal']),
    ],
    'Evaluation experiment drafted. No scores are fabricated as measured results; live runs are required.',
    'qa',
    'Open evaluation suite',
  ),
  'MODEL-N3': recipe(
    'Investigate limits before retrying failed requests.',
    [
      choice('provider', 'Provider', ['OpenRouter', 'Customer endpoint', 'Lyzr adapter']),
      choice('check', 'Health check', ['Credentials', 'Quota', 'Capability', 'Latency']),
      choice('retry', 'Retry policy', ['Manual', 'One retry', 'Backoff then stop']),
    ],
    'Health investigation recorded. The model page distinguishes live provider responses from demonstration data.',
    'ops',
    'Inspect run history',
  ),
  'DATA-E1': recipe(
    'Review the data model before applying a migration.',
    [
      input('table', 'Table name', 'tasks'),
      input('columns', 'Columns', 'id uuid, title text, completed boolean'),
      choice('access', 'Row access', [
        'Owner only',
        'Project members',
        'Public read / owner write',
      ]),
      choice('migration', 'Apply strategy', ['Review SQL only', 'Stage migration proposal']),
    ],
    'Schema proposal saved locally. No production table or access policy was changed.',
    'data',
    'Review data model',
  ),
  'DATA-E2': recipe(
    'Connect only the scope needed for this project.',
    [
      choice('service', 'Connector', [
        'GitHub',
        'Notion',
        'Supabase',
        'OpenRouter',
        'MCP server',
        'Plugin',
      ]),
      choice('scope', 'Scope', ['Read selected resources', 'Read and write selected resources']),
      choice('action', 'Action', ['Connect draft', 'Check health', 'Reconnect', 'Revoke draft']),
    ],
    'Connection lifecycle request saved. Demo configuration never implies a live OAuth connection.',
    'data',
    'Open connections',
  ),
  'DATA-E3': recipe(
    'Give the builder specific, attributable context.',
    [
      input('source', 'Source title or URL', 'Project brief / https://…'),
      choice('type', 'Source type', [
        'Document',
        'Image reference',
        'Web reference',
        'Repository file',
      ]),
      input('scope', 'Relevant excerpt / use', 'Only use the onboarding requirements'),
      choice('freshness', 'Freshness', ['Current', 'Needs refresh', 'Archived']),
    ],
    'Context reference saved; source permissions and freshness should be validated before generation.',
    'studio',
    'Use context in Builder',
  ),
  'DATA-E4': recipe(
    'Design the generated app’s identity separately from Architect login.',
    [
      choice('provider', 'Generated app sign-in', ['Email', 'Google OAuth', 'Demo test identity']),
      input('roles', 'Application roles', 'Owner, member, viewer'),
      choice('access', 'Access rule', ['Invite only', 'Open registration', 'Allowlisted domain']),
    ],
    'Generated-app identity proposal saved. This does not change your Architect account or enable OAuth in generated code.',
    'qa',
    'Test application roles',
  ),
  'DATA-N3': recipe(
    'Export portable project knowledge with explicit dependencies.',
    [
      choice('contents', 'Include', [
        'Code + PRD + TRD',
        'Documentation only',
        'Agent configuration + docs',
      ]),
      choice('secrets', 'Secrets', ['Exclude all secret values']),
      choice('manifest', 'Manifest', ['Include dependency and integration references']),
    ],
    'Export selection saved. Use the project export action for a downloadable context package.',
    'code',
    'Open export tools',
  ),
  'QA-E1': recipe(
    'Turn a user outcome into an observable check.',
    [
      input('criterion', 'Acceptance criterion', 'A user can create and complete a task'),
      input('steps', 'Replay steps', 'Open app → add task → mark complete'),
      input('expected', 'Expected result', 'Task persists and status changes'),
      choice('type', 'Test owner', ['Automated QA proposal', 'App-owner UAT']),
    ],
    'Acceptance test definition saved. Run results must be labeled measured or simulated.',
    'qa',
    'Run test suite',
  ),
  'QA-E2': recipe(
    'Inspect the interface and send a specific repair to the builder.',
    [
      choice('viewport', 'Viewport', ['Desktop', 'Tablet', 'Mobile']),
      choice('category', 'Check', [
        'Keyboard access',
        'Visual layout',
        'Color contrast',
        'Responsive overflow',
        'Loading / error states',
      ]),
      input('finding', 'Finding', 'Describe expected and observed behavior'),
    ],
    'UI finding saved as a repair request. The test panel can send it directly to Studio.',
    'studio',
    'Repair in Builder',
  ),
  'QA-E3': recipe(
    'Test agent behavior against an expected decision.',
    [
      input('agent', 'Agent', 'Support triage'),
      input('input', 'Test input', 'A customer requests account data'),
      input('expected', 'Expected behavior', 'Ask for identity verification first'),
      choice('type', 'Evaluation', [
        'Task correctness',
        'Tool permission',
        'Prompt injection resistance',
        'Model comparison',
      ]),
    ],
    'Agent evaluation case saved. No pass is claimed before a real run.',
    'agents',
    'Review agent policy',
  ),
  'QA-E4': recipe(
    'Make a test report reproducible for another reviewer.',
    [
      input('run', 'Run reference', 'QA-001'),
      input('revision', 'Exact code / agent version', 'Current project revision'),
      choice('severity', 'Finding severity', ['Info', 'Low', 'Medium', 'High', 'Critical']),
      choice('disposition', 'Disposition', [
        'Needs review',
        'Confirmed',
        'Flaky',
        'Accepted with reason',
      ]),
      evidence(),
    ],
    'Version-bound review record saved with replay evidence.',
    'release',
    'Review release gate',
  ),
  'QA-N1': recipe(
    'Select the specialists appropriate to the application.',
    [
      choice('scope', 'Service scope', ['Isolated service', 'Selected services', 'Full stack']),
      choice('suite', 'Specialist suite', [
        'UI + functional',
        'API + integration',
        'Security + dependencies',
        'Performance',
        'All relevant suites',
      ]),
      choice('dependencies', 'Dependencies', [
        'Mocks',
        'Seeded preview',
        'Approved live test services',
      ]),
    ],
    'Service test matrix saved. The local test runner demonstrates execution states without contacting infrastructure.',
    'qa',
    'Run demonstration matrix',
  ),
  'QA-N2': recipe(
    'Create reproducible data without copying production secrets.',
    [
      input('fixture', 'Fixture name', 'first-time-user'),
      input('identities', 'Test identities', 'Owner and viewer accounts'),
      choice('expiry', 'Preview expiry', ['1 hour', '4 hours', '24 hours']),
      choice('cleanup', 'Cleanup', ['Automatic on expiry', 'Manual approval']),
    ],
    'Preview fixture and expiry plan saved. No cloud sandbox was created.',
    'data',
    'Review test data',
  ),
  'QA-N3': recipe(
    'Make blocked releases explainable.',
    [
      choice('policy', 'Required gate', [
        'Build + tests + human review',
        'Build + tests + security + human review',
      ]),
      choice('blocking', 'Block on', ['Any failed required check', 'High and critical findings']),
      choice('exception', 'Exception', ['No exception', 'Owner-approved documented exception']),
      evidence(),
    ],
    'Quality gate proposal saved. Demo sign-off must not be mistaken for independently executed tests.',
    'release',
    'Open readiness room',
  ),
  'RELEASE-E1': recipe(
    'Review the target and artifact before publishing.',
    [
      env(),
      input('artifact', 'Artifact / revision', 'Current approved revision'),
      choice('approval', 'Deployment approval', ['Owner approval required', 'Preview only']),
    ],
    'Deployment request saved. The release panel demonstrates preview/staging/production transitions; it does not create external deployments.',
    'release',
    'Open release controls',
  ),
  'RELEASE-E2': recipe(
    'Keep ownership and operating costs explicit.',
    [
      choice('hosting', 'Generated app hosting', [
        'Architect-managed demo',
        'Customer Vercel',
        'Export to customer runtime',
      ]),
      owner(),
      choice('cost', 'Cost acknowledgement', [
        'Free-tier limits understood',
        'Owner review required',
      ]),
    ],
    'Hosting decision recorded. Installing Architect itself on company infrastructure belongs to 4.0.',
    'code',
    'Review application export',
  ),
  'RELEASE-E3': recipe(
    'Check runtime configuration before mapping a domain.',
    [
      input('domain', 'Domain', 'app.example.com'),
      env(),
      choice('tls', 'TLS status', [
        'Not checked',
        'Pending DNS verification',
        'Verified externally',
      ]),
      choice('secrets', 'Required secret references', ['Not checked', 'All references documented']),
    ],
    'Domain readiness draft saved. DNS and TLS have not been changed.',
    'release',
    'Review readiness',
  ),
  'RELEASE-E4': recipe(
    'Publish understandable changes to the right audience.',
    [
      input('notes', 'Release notes', 'What changed and who benefits?'),
      choice('visibility', 'Visibility', ['Private team', 'Unlisted link', 'Public listing']),
      choice('cost', 'Owner cost disclosure', ['Included in release notes', 'Needs owner review']),
    ],
    'Publication draft saved. No listing or notification is published externally.',
    'ops',
    'Track release outcome',
  ),
  'RELEASE-N1': recipe(
    'Pin service versions and sequence compatibility checks.',
    [
      input('manifest', 'Service manifest', 'web: commit A; api: commit B'),
      choice('migration', 'Migration compatibility', [
        'Backward compatible',
        'Requires coordinated migration',
        'Unknown — block',
      ]),
      input('order', 'Release order', 'Database → API → frontend'),
    ],
    'Coordinated release manifest drafted. Incompatible or unknown migrations need review.',
    'qa',
    'Verify service compatibility',
  ),
  'RELEASE-N2': recipe(
    'Prepare a reversible application rollout.',
    [
      choice('percentage', 'Initial traffic', ['5%', '10%', '25%', '100%']),
      input('rollback', 'Rollback artifact', 'Previous compatible revision'),
      choice('schema', 'Schema compatibility', [
        'Compatible',
        'Unknown — block rollback',
        'Requires migration plan',
      ]),
      input('threshold', 'Abort threshold', 'Error rate above 2%'),
    ],
    'Rollout and rollback plan saved. No traffic or infrastructure was changed.',
    'ops',
    'Watch rollout metrics',
  ),
  'RELEASE-N3': recipe(
    'Assemble the evidence needed for one release decision.',
    [
      owner(),
      choice('tests', 'Test evidence', ['Not run', 'Demo only', 'Verified externally']),
      choice('review', 'Human review', ['Pending', 'Approved', 'Changes requested']),
      input('runbook', 'Runbook reference', 'Project wiki / recovery guide'),
    ],
    'Readiness review recorded. Demo-only or unrun checks are not production clearance.',
    'qa',
    'Inspect test evidence',
  ),
  'RELEASE-N4': recipe(
    'Retire an application without losing an owner or migration path.',
    [
      input('successor', 'Successor / export destination', 'Replacement application or archive'),
      input('date', 'Deprecation date', 'YYYY-MM-DD'),
      choice('cleanup', 'Cleanup policy', ['Archive only', 'Review resource removal checklist']),
      owner(),
    ],
    'Retirement plan saved. No deployed app, database or resource is deleted.',
    'code',
    'Export project context',
  ),
  'OPS-E1': recipe(
    'Inspect a specific application or agent run.',
    [
      choice('kind', 'Telemetry', [
        'Application logs',
        'Agent trace',
        'Runtime error',
        'Lyzr adapter',
      ]),
      input('run', 'Run / correlation ID', 'Run ID from provider'),
      choice('window', 'Time window', ['Last hour', 'Last 24 hours', 'Last 7 days']),
    ],
    'Telemetry query draft saved. Connect a validated adapter before interpreting sample metrics as real telemetry.',
    'ops',
    'Open operations console',
  ),
  'OPS-E2': recipe(
    'Show the signals relevant to a development role.',
    [
      choice('role', 'Report audience', ['Builder', 'Developer', 'QA', 'DevOps']),
      choice('metric', 'Primary metric', [
        'Build completion',
        'Change failure',
        'Test coverage',
        'Runtime reliability',
      ]),
      choice('cadence', 'Reporting period', ['Today', 'This week', 'This release']),
    ],
    'Operational report preference saved. Reports use labeled sample data until live adapters are connected.',
    'ops',
    'Review report',
  ),
  'OPS-E3': recipe(
    'Attribute cost without confusing estimates and settled charges.',
    [
      choice('group', 'Group by', ['Project', 'Agent', 'Model', 'API', 'Run']),
      choice('basis', 'Cost basis', ['Provider-confirmed', 'Estimated', 'Both, separately']),
      choice('funding', 'Funding', ['All', 'Managed credits', 'Customer API key']),
    ],
    'Cost investigation filter saved. Provider billing is authoritative; demo balances are not account charges.',
    'models',
    'Review funding and limits',
  ),
  'OPS-E4': recipe(
    'Turn evidence into a focused development task.',
    [
      input('finding', 'Finding', 'A form is not keyboard accessible'),
      input('impact', 'User impact', 'Users cannot submit using a keyboard'),
      choice('priority', 'Priority', ['Low', 'Medium', 'High', 'Urgent']),
      choice('destination', 'Send to', ['Builder', 'QA', 'Code review']),
    ],
    'Improvement task drafted with its evidence and priority.',
    'studio',
    'Open repair workspace',
  ),
  'OPS-N1': recipe(
    'Give an alert an owner and a recovery action.',
    [
      choice('signal', 'Signal', ['Error rate', 'Agent failure', 'Latency', 'Budget threshold']),
      input('threshold', 'Threshold', 'Above 5% for 5 minutes'),
      owner(),
      input('recovery', 'Recovery action', 'Pause rollout and investigate logs'),
    ],
    'Alert policy draft saved. Notifications and automatic recovery are not enabled in demo mode.',
    'release',
    'Review recovery plan',
  ),
  'OPS-N3': recipe(
    'Compare release results against the original intention.',
    [
      input('goal', 'Project goal', 'Users complete their first task'),
      input('metric', 'Outcome metric', 'Activation rate'),
      input('target', 'Target', '60% within 7 days'),
      choice('source', 'Data source', [
        'Demo sample',
        'External analytics reference',
        'Application event proposal',
      ]),
    ],
    'Release outcome tracking plan saved with explicit data provenance.',
    'plan',
    'Update project intent',
  ),
};
export function workflowKey(projectId: string) {
  return `architect:workflow:v2:${projectId}`;
}
export function validateWorkflow(id: string, values: Record<string, string>): string[] {
  const r = recipes[id];
  if (!r) return ['Unknown workflow'];
  return r.fields
    .filter((f) => f.required && !values[f.key]?.trim())
    .map((f) => `${f.label} is required.`);
}
export function getDefaults(id: string): Record<string, string> {
  return Object.fromEntries((recipes[id]?.fields || []).map((f) => [f.key, f.options?.[0] || '']));
}

export type AdvancedField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'toggle' | 'json' | 'password';
  options?: string[];
  initial?: string;
  help?: string;
  min?: number;
  max?: number;
};
export type AdvancedSection = {
  id: string;
  area: string;
  title: string;
  description: string;
  fields: AdvancedField[];
};
const txt = (key: string, label: string, initial = '', help = ''): AdvancedField => ({
  key,
  label,
  initial,
  help,
});
const memo = (key: string, label: string, initial = ''): AdvancedField => ({
  key,
  label,
  type: 'textarea',
  initial,
});
const pick = (key: string, label: string, options: string[]): AdvancedField => ({
  key,
  label,
  options,
  initial: options[0],
});
const toggle = (key: string, label: string, initial = false): AdvancedField => ({
  key,
  label,
  type: 'toggle',
  initial: String(initial),
});
const json = (key: string, label: string, initial = '{}'): AdvancedField => ({
  key,
  label,
  type: 'json',
  initial,
});
export const advancedSections: AdvancedSection[] = [
  {
    id: 'agent-identity',
    area: 'agents',
    title: 'Agent role, goal & instructions',
    description:
      'One application agent, a defined responsibility and an editable instruction contract. Mention another configured agent with @name.',
    fields: [
      txt('name', 'Agent name', 'Application assistant'),
      txt('role', 'Role', 'Application specialist'),
      memo('goal', 'Goal', 'Help the user complete the application’s core task.'),
      memo(
        'instructions',
        'Instructions',
        'Use only approved project context. Ask before changing external data. Report uncertainty.',
      ),
      pick('type', 'Agent type', [
        'Single agent',
        'Managerial agent',
        'Voice agent',
        'Imported A2A agent',
      ]),
      txt('native', 'Native sub-agent references'),
      txt('external', 'A2A agent references'),
      txt('version', 'Version label', '1.0.0'),
    ],
  },
  {
    id: 'agent-output',
    area: 'agents',
    title: 'Output formats & examples',
    description:
      'Design text, structured data and artifact outputs. Formats are capability requirements, not proof that a provider supports generation.',
    fields: [
      pick('format', 'Output format', ['Text', 'Structured JSON', 'Image', 'Downloadable file']),
      json(
        'schema',
        'JSON output schema',
        '{"type":"object","properties":{"answer":{"type":"string"}}}',
      ),
      memo('examples', 'Input / output examples'),
      pick('image', 'Image provider requirement', ['Not required', 'Provider must support images']),
      pick('file', 'File artifact format', ['CSV', 'PDF', 'DOCX', 'PPTX']),
      toggle('strict', 'Require schema validation', true),
    ],
  },
  {
    id: 'agent-memory',
    area: 'agents',
    title: 'Memory, knowledge & groundedness',
    description:
      'Define what the agent may remember and which evidence it may cite. Memory is a draft policy until connected to a runtime.',
    fields: [
      toggle('short', 'Short-term conversation memory', true),
      toggle('long', 'Long-term project memory'),
      txt('retention', 'Retention duration', '7 days'),
      txt('knowledge', 'Knowledge base references'),
      txt('graph', 'Knowledge graph reference'),
      txt('semantic', 'Semantic model reference'),
      memo('global', 'Project context'),
      toggle('citations', 'Require citations', true),
      toggle('grounded', 'Groundedness check', true),
      toggle('reflection', 'Reflection step'),
      pick('unknown', 'When evidence is insufficient', [
        'Ask for clarification',
        'Explain uncertainty',
        'Escalate to owner',
      ]),
    ],
  },
  {
    id: 'agent-safety',
    area: 'agents',
    title: 'Responsible AI & tool permissions',
    description:
      'Review policy intent before enabling a real runtime. No prototype toggle enforces a server policy by itself.',
    fields: [
      toggle('pii', 'Mask sensitive output', true),
      toggle('fairness', 'Fairness / bias review', true),
      toggle('injection', 'Prompt-injection defense requirement', true),
      toggle('human', 'Require human approval for external writes', true),
      txt('allowed', 'Allowed tools / MCP servers'),
      txt('blocked', 'Blocked tool actions', 'delete, purchase, publish'),
      txt('skills', 'Skill references'),
      pick('violation', 'Policy violation', ['Block and explain', 'Ask a reviewer']),
      memo(
        'judges',
        'LLM-as-judge rubric (beta)',
        'Assess relevance, factual support and permission compliance.',
      ),
    ],
  },
  {
    id: 'agent-voice',
    area: 'agents',
    title: 'Voice & event automation',
    description:
      'Capture voice and event requirements as app-agent configuration. Telephony, voice generation and background schedules require live adapters.',
    fields: [
      pick('provider', 'Voice provider', ['None', 'Bring your own provider']),
      txt('voice', 'Voice identifier'),
      txt('language', 'Language', 'en'),
      txt('telephony', 'Telephony connector reference'),
      pick('trigger', 'Trigger type', ['Manual', 'Schedule', 'Webhook', 'Repository event']),
      txt('schedule', 'Schedule expression', '0 9 * * 1'),
      txt('timezone', 'Timezone', 'Asia/Kolkata'),
      toggle('enabled', 'Enable when a runtime is connected'),
      txt('webhook', 'Webhook route', '/events/app-agent'),
    ],
  },
  {
    id: 'agent-deploy',
    area: 'agents',
    title: 'API, A2A & publication',
    description:
      'Prepare a deployment contract, an agent card and examples. Exported samples contain references rather than secret values.',
    fields: [
      txt('endpoint', 'API endpoint', 'https://your-runtime.example/agents/run'),
      txt('credential', 'Credential reference', 'LYZR_API_KEY'),
      json(
        'card',
        'A2A agent card',
        '{"name":"Application assistant","url":"https://your-runtime.example/a2a","version":"1.0.0","skills":[]}',
      ),
      memo('examples', 'A2A example requests', 'What can this application help me do?'),
      pick('auth', 'A2A authentication', [
        'Bearer credential reference',
        'OAuth adapter',
        'Public read-only',
      ]),
      toggle('publish', 'Submit to app marketplace review'),
      txt('blueprint', 'Blueprint name'),
      memo(
        'guide',
        'How to use',
        'Configure a runtime, set the server credential, then send a test request.',
      ),
    ],
  },
  {
    id: 'model-parameters',
    area: 'models',
    title: 'Advanced inference parameters',
    description:
      'Provider capabilities differ. These are saved configuration requirements; live Studio calls only use server-supported parameters.',
    fields: [
      toggle('override', 'Enable parameter overrides'),
      { key: 'temperature', label: 'Temperature', type: 'number', initial: '0.7', min: 0, max: 2 },
      { key: 'topP', label: 'Top P', type: 'number', initial: '1', min: 0, max: 1 },
      {
        key: 'tokens',
        label: 'Maximum output tokens',
        type: 'number',
        initial: '4096',
        min: 1,
        max: 65536,
      },
      pick('reasoning', 'Reasoning effort', ['Provider default', 'Low', 'Medium', 'High']),
      pick('search', 'Web-search context', ['Disabled', 'Small', 'Medium', 'Large']),
      pick('voice', 'Voice provider', ['Not required', 'Customer provider']),
      pick('complexity', 'Complexity routing', ['Automatic', 'Simple task', 'Complex reasoning']),
      toggle('cancel', 'Allow cancellation', true),
    ],
  },
  {
    id: 'data-knowledge',
    area: 'data',
    title: 'Retrieval, knowledge & source ingestion',
    description:
      'Configure ingestion and retrieval intent. Uploading to the prototype does not index a vector database automatically.',
    fields: [
      pick('source', 'Source format', [
        'Text / Markdown',
        'PDF',
        'DOCX',
        'CSV / Excel',
        'Web reference',
        'Repository files',
      ]),
      txt('collection', 'Collection name', 'project-knowledge'),
      { key: 'chunk', label: 'Chunk size', type: 'number', initial: '800', min: 100, max: 10000 },
      toggle('citations', 'Preserve source citations', true),
      toggle('refresh', 'Refresh source before use', true),
      txt('graph', 'Knowledge graph reference'),
      txt('semantic', 'Semantic model reference'),
      txt('skills', 'Skill package references'),
      memo(
        'context',
        'Bounded context policy',
        'Only include documents explicitly attached to this project.',
      ),
    ],
  },
  {
    id: 'data-tools',
    area: 'data',
    title: 'Tools, connectors, skills & MCP',
    description:
      'Scope each service action. Connector availability depends on that provider’s authorization and runtime adapter.',
    fields: [
      pick('connector', 'Connector family', [
        'MCP server',
        'Composio',
        'GitHub',
        'Notion',
        'Dropbox',
        'Email',
        'Web search',
        'External API',
      ]),
      txt('endpoint', 'Connector endpoint'),
      txt('credential', 'Server credential reference'),
      memo('actions', 'Allowed actions', 'Search and read selected project resources.'),
      memo('resources', 'Allowed resource IDs / paths'),
      toggle('write', 'Allow approved write actions'),
      toggle('delete', 'Allow delete actions'),
      toggle('confirm', 'Human confirmation for consequential actions', true),
      pick('health', 'Connection state', [
        'Not connected',
        'Needs authorization',
        'Validation requested',
        'Revoked draft',
      ]),
    ],
  },
  {
    id: 'data-identity',
    area: 'data',
    title: 'Generated-app login & private routes',
    description:
      'The generated app’s accounts are separate from Architect’s own accounts. Review security requirements before implementing them.',
    fields: [
      pick('provider', 'Application identity', [
        'Supabase Auth',
        'Customer identity provider',
        'Demo identities',
      ]),
      toggle('signup', 'Allow sign up', true),
      toggle('password', 'Use provider password hashing', true),
      toggle('sessions', 'Provider-managed sessions', true),
      toggle('private', 'Protect private routes', true),
      txt('roles', 'Application roles', 'owner, member, viewer'),
      txt('expiry', 'Session expiry', 'Provider default'),
      json('policy', 'Sample access rule', '{"resource":"tasks","read":"owner","write":"owner"}'),
    ],
  },
  {
    id: 'data-analysis',
    area: 'data',
    title: 'Tabular analysis & visualization',
    description:
      'Keep the documented CSV / Excel analysis entry available in 2.0; company BI dashboards expand in 3.0.',
    fields: [
      txt('dataset', 'Dataset reference'),
      pick('chart', 'Visualization', ['Table', 'Bar', 'Line', 'Scatter']),
      txt('dimension', 'Dimension column'),
      txt('measure', 'Measure column'),
      pick('aggregation', 'Aggregation', ['Count', 'Sum', 'Average', 'Minimum', 'Maximum']),
      memo('question', 'Analysis question'),
    ],
  },
  {
    id: 'plan-discovery',
    area: 'plan',
    title: 'Consultant & tailored recommendations',
    description:
      'Capture the user, pain point, tools and measurable outcome. Recommendations should be treated as hypotheses, not guaranteed time savings.',
    fields: [
      txt('person', 'Name'),
      txt('email', 'Email (optional)'),
      txt('organization', 'Organization (optional)'),
      pick('role', 'Role / prompt category', [
        'General',
        'Development',
        'Analysts',
        'Marketing',
        'Sales',
        'Legal',
        'HR',
        'Support',
        'Productivity',
        'Data & Analysis',
      ]),
      memo('pain', 'What takes too much time?'),
      txt('tools', 'Existing tools'),
      memo('context', 'Business context'),
      memo('outcome', 'Desired outcome'),
      pick('persistence', 'Data persistence', [
        'Session only',
        'Saved personal data',
        'Shared project data',
      ]),
    ],
  },
  {
    id: 'plan-artifacts',
    area: 'plan',
    title: 'Plan & mockup review',
    description:
      'Decide which proposal should drive implementation and record the reason. A mockup reference can be added before generating application code.',
    fields: [
      pick('artifact', 'Artifact', ['Plan', 'App mockup', 'Both']),
      txt('mockup', 'Mockup reference'),
      pick('decision', 'Decision', ['Needs review', 'Selected for build', 'Request alternative']),
      memo('feedback', 'Review feedback'),
      toggle('include', 'Include in builder context', true),
    ],
  },
  {
    id: 'code-repository',
    area: 'code',
    title: 'Repository import & synchronization',
    description:
      'A repository URL is a reference until a real GitHub adapter validates it. Private source requires explicit provider permissions.',
    fields: [
      txt('repo', 'URL or owner/repository'),
      txt('branch', 'Branch (blank means default)'),
      pick('visibility', 'Repository visibility', ['Public', 'Private']),
      pick('method', 'Source access', ['Public clone plan', 'Connected GitHub account']),
      toggle('initial', 'Create owned repository / initial push proposal'),
      toggle('autosync', 'Propose subsequent commit synchronization'),
      pick('conflict', 'External-change policy', [
        'Stop on newer changes',
        'Create a separate branch',
      ]),
      txt('commit', 'Pinned commit ID'),
      memo('summary', 'Change summary'),
    ],
  },
  {
    id: 'code-environment',
    area: 'code',
    title: 'Runtime environment & dependency references',
    description:
      'Save named configuration references. Never paste production keys into a prototype field.',
    fields: [
      pick('environment', 'Scope', ['Preview', 'Staging', 'Production']),
      txt('runtime', 'Runtime version', 'Node 22'),
      txt('install', 'Install command', 'npm install'),
      txt('build', 'Build command', 'npm run build'),
      txt('start', 'Start command', 'npm start'),
      txt('port', 'Port', '3000'),
      memo(
        'references',
        'Environment variable references',
        'OPENROUTER_API_KEY → server secret store',
      ),
      memo('dependencies', 'Dependency notes'),
    ],
  },
  {
    id: 'qa-playground',
    area: 'qa',
    title: 'Playground sessions & evaluation policy',
    description:
      'Prepare agent sessions and their artifacts. AI feedback, simulated runs and real browser evidence must remain distinguishable.',
    fields: [
      txt('session', 'Session name', 'Acceptance review'),
      memo('input', 'Test input'),
      memo('expected', 'Expected outcome'),
      pick('judge', 'Judge mode', [
        'Human review',
        'LLM-as-judge proposal (beta)',
        'Deterministic assertion',
      ]),
      memo(
        'rubric',
        'Evaluation rubric',
        'Correctness, relevance, permission compliance and evidence.',
      ),
      toggle('artifacts', 'Retain outputs / artifacts', true),
      toggle('traces', 'Retain traces with sensitive values masked', true),
      pick('simulation', 'Simulation type', [
        'Single scenario',
        'Adversarial input',
        'Multi-turn conversation',
      ]),
    ],
  },
  {
    id: 'release-listing',
    area: 'release',
    title: 'Publish details & marketplace listing',
    description:
      'Prepare a complete listing without publishing or purchasing a domain. Marketplace usage may consume the application owner’s provider credits.',
    fields: [
      txt('name', 'Public app name'),
      pick('category', 'Category', [
        'Productivity',
        'Development',
        'Support',
        'Analytics',
        'Research',
        'Other',
      ]),
      memo('description', 'Full description'),
      { key: 'short', label: 'Short description', initial: '', max: 160 },
      txt('tags', 'Tags (up to 8, comma separated)'),
      toggle('marketplace', 'Publish to marketplace proposal'),
      pick('repository', 'Repository ownership', [
        'Own GitHub repository',
        'Managed private repository',
      ]),
      txt('domain', 'Custom domain (optional)'),
      txt('subdomain', 'Default subdomain proposal'),
      toggle('cost', 'Owner understands usage and provider costs'),
    ],
  },
  {
    id: 'release-private',
    area: 'release',
    title: 'Private hosting compatibility',
    description:
      'Retain the current private / VPC hosting entry as a scoped request in 2.0. Installing the entire Architect platform belongs to 4.0.',
    fields: [
      pick('target', 'Generated app hosting', [
        'Managed demo',
        'Customer VPC',
        'Customer on-premise',
      ]),
      txt('owner', 'Infrastructure owner'),
      txt('network', 'Network / ingress requirements'),
      memo('dependencies', 'Application runtime dependencies'),
      toggle('review', 'Requires infrastructure review', true),
    ],
  },
  {
    id: 'ops-analytics',
    area: 'ops',
    title: 'Usage, traces & report filters',
    description:
      'Choose the scope and time range. Values must come from a real adapter before they can be described as measured.',
    fields: [
      pick('scope', 'User scope', ['My usage', 'All project users']),
      pick('range', 'Date range', ['7 days', '30 days', '90 days', '12 months']),
      pick('group', 'Breakdown', ['Application', 'Agent', 'Model', 'API', 'Run']),
      pick('view', 'Evidence view', ['Usage', 'Traces', 'Transcripts', 'Reports']),
      txt('correlation', 'Run / trace identifier'),
      toggle('empty', 'Explain empty data', true),
      toggle('estimate', 'Label estimated cost separately', true),
    ],
  },
  {
    id: 'workspace-access',
    area: 'settings',
    title: 'Organizations, sub-accounts & SSO',
    description:
      'Capture project-level workspace preferences. SSO and sub-account provisioning are demonstrations until a supported identity adapter is connected.',
    fields: [
      txt('organization', 'Organization name'),
      pick('scope', 'Default scope', ['Me', 'Organization']),
      txt('subaccount', 'Sub-account label'),
      pick('role', 'Organization role', ['Member', 'Admin', 'Owner']),
      pick('sso', 'Identity option', [
        'Google',
        'Email',
        'GitHub (setup required)',
        'LinkedIn (setup required)',
        'SAML / SSO (enterprise prototype)',
      ]),
      txt('domain', 'Allowed email domain'),
      toggle('relaxed', 'Relaxed view'),
      toggle('pin', 'Pin sidebar', true),
    ],
  },
  {
    id: 'workspace-billing',
    area: 'settings',
    title: 'Credits, allowance & purchase preview',
    description:
      'A demonstration ledger is separate from provider billing. Saving this form never charges a card or changes a subscription.',
    fields: [
      {
        key: 'allowance',
        label: 'Demo monthly credit allowance',
        type: 'number',
        initial: '100',
        min: 0,
      },
      { key: 'remaining', label: 'Demo credits remaining', type: 'number', initial: '100', min: 0 },
      txt('reset', 'Demo reset date'),
      pick('plan', 'Plan preview', ['Free', 'Builder plan preview', 'Team plan preview']),
      txt('promo', 'Promotional credit code'),
      txt('payer', 'Billing owner'),
      txt('invoice', 'Invoice recipient'),
      toggle('acknowledge', 'Understand no purchase is processed', true),
    ],
  },
  {
    id: 'workspace-audit',
    area: 'settings',
    title: 'Audit filters & resource decisions',
    description:
      'Filter locally recorded decisions; external account audit events need a connected backend adapter.',
    fields: [
      pick('action', 'Action', [
        'All',
        'Create',
        'Update',
        'Delete proposal',
        'Access change',
        'Release decision',
      ]),
      pick('resource', 'Resource', ['All', 'Project', 'Agent', 'Document', 'Member', 'Connection']),
      txt('actor', 'Actor'),
      txt('start', 'From date'),
      txt('end', 'To date'),
      pick('page', 'Page size', ['10', '25', '50']),
    ],
  },
];
export function advancedDefaults(section: AdvancedSection) {
  return Object.fromEntries(section.fields.map((f) => [f.key, f.initial || '']));
}
export function validateAdvanced(
  section: AdvancedSection,
  values: Record<string, string>,
): string[] {
  const errors: string[] = [];
  for (const f of section.fields) {
    const v = values[f.key] || '';
    if (f.type === 'json' && v.trim()) {
      try {
        JSON.parse(v);
      } catch {
        errors.push(`${f.label}: enter valid JSON.`);
      }
    }
    if (f.type === 'number' && v.trim()) {
      const n = Number(v);
      if (
        !Number.isFinite(n) ||
        (f.min !== undefined && n < f.min) ||
        (f.max !== undefined && n > f.max)
      )
        errors.push(
          `${f.label}: value must be between ${f.min ?? 'no minimum'} and ${f.max ?? 'no maximum'}.`,
        );
    }
    if (f.type !== 'number' && f.max && v.length > f.max)
      errors.push(`${f.label}: maximum ${f.max} characters.`);
  }
  if (
    section.id === 'release-listing' &&
    (values.tags || '').split(',').filter((v) => v.trim()).length > 8
  )
    errors.push('Use at most 8 tags.');
  return errors;
}
export const flowNodeTypes = [
  'AI Agent',
  'A2A Agent',
  'AI Swarm',
  'Tool',
  'LLM',
  'Decide',
  'Rank',
  'Guardrails',
  'Trigger',
  'If',
  'Switch',
  'Merge',
  'Filter',
  'Loop',
  'Wait',
  'Wait for Approval',
  'Stop & Error',
  'No-Op',
  'Set',
  'Aggregate',
  'Sort',
  'Limit',
  'Remove Duplicates',
  'Rename Keys',
  'TOON',
  'Code',
  'HTTP Request',
  'Execute nested SuperFlow',
  'Date/Time',
  'Crypto',
  'Parse Document',
  'Extract Fields',
  'Label Document',
];
export const flowTemplates = [
  'Empty flow',
  'AI Email Reply with human approval',
  'Ask the AI',
  'Code Reviewer',
  'Web Page Summarizer',
  'Batch Sentiment Analyzer',
  'Smart Email Triage',
  'Research Swarm',
  'ReAct Agent',
];

export function validateFlowImport(nodes: unknown): string[] {
  if (!Array.isArray(nodes) || nodes.length === 0 || nodes.length > 100)
    return ['A workflow needs 1–100 nodes.'];
  const errors: string[] = [];
  if (
    !nodes.every(
      (b) =>
        b &&
        typeof b.id === 'string' &&
        typeof b.name === 'string' &&
        typeof b.role === 'string' &&
        Number.isFinite(b.x) &&
        Number.isFinite(b.y) &&
        (b.parent === null || typeof b.parent === 'string'),
    )
  )
    return ['Nodes need an ID, name, role, finite coordinates and a parent ID or null.'];
  const ids = new Set(nodes.map((b) => b.id));
  if (ids.size !== nodes.length) errors.push('Node IDs must be unique.');
  if (!ids.has('lead')) errors.push('Include the lead node as the workflow root.');
  for (const n of nodes) {
    if (n.parent && !ids.has(n.parent)) errors.push(`Unknown parent for ${n.name}.`);
    const visited = new Set<string>();
    let b = n;
    while (b) {
      if (visited.has(b.id)) {
        errors.push(`Hierarchy cycle involving ${n.name}.`);
        break;
      }
      visited.add(b.id);
      b = nodes.find((x) => x.id === b.parent);
    }
  }
  return [...new Set(errors)];
}
