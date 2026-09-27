const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const editions = {
  '2.0': {
    title: 'From intent to a verified release.',
    description: 'A project-centred control plane coordinates context, agents, models and isolated execution. Developers can inspect the work; guided users follow the same project through simpler views.',
    boundary: 'The API owns identity, policy and project state. Untrusted application code belongs in a separate execution environment, never inside the API process.',
    components: [
      ['Builder UI', 'Guided prompts, preview, visual selection and the proposed repository editor share one project.'],
      ['API + Policy', 'Authenticate requests, resolve membership, enforce permissions and reserve budgets before starting work.'],
      ['Project context', 'Pin requirements, PRD/TRD, architecture, source revisions and approved decisions to a context manifest.'],
      ['Orchestrator + Agent harness', 'Coordinate specialists, persist progress, validate tool calls and pause at approval gates.'],
      ['Model gateway', 'Apply model choice, capability, privacy and cost rules; record every routing decision.'],
      ['Sandbox + Test + Release', 'Run code in isolation, collect real test evidence and release only the reviewed artifact.'],
    ],
    sequence: ['Idea or repository', 'Versioned plan', 'Bounded agent run', 'Reviewable changeset', 'Test evidence', 'Approved release'],
    detail: [
      ['Import & edit', 'RepositoryBinding pins the GitHub installation, repository and base SHA. ChangeSet records the diff against that SHA.', 'Reject stale writes; create a reviewable conflict instead of overwriting a newer commit.'],
      ['Build & verify', 'Run pins an agent-definition version, context manifest and model policy. TestRun references the exact changeset.', 'A generated claim of success cannot satisfy a test gate; a runner must produce evidence.'],
      ['Publish', 'Release binds environment, artifact hash, approvals and provider receipt.', 'Reconcile a timed-out deployment before retrying. Retain a verified rollback target.'],
    ],
    now: 'Authentication, saved projects, bounded AI requests, HTML preview and editing have working implementations. Agent, repository, testing and release configuration flows also exist.',
    next: 'Repository-backed execution, durable multi-agent orchestration, tool execution and persistent agent memory are proposed. The current preview is an isolated browser iframe, not a server sandbox.',
  },
  '3.0': {
    title: 'One project, many accountable teams.',
    description: 'Role-specific workspaces connect customer evidence, product decisions, engineering, QA, DevOps and business outcomes. Shared objects carry context across every handoff.',
    boundary: 'Role views make work relevant; server authorization determines access. Company data, bot permissions and connector scopes remain tenant-bound at every step.',
    components: [
      ['Role workspace', 'Product, engineering, QA, DevOps, business and leadership see their permitted work and decisions.'],
      ['Shared project graph', 'Link feedback, requirements, changesets, test results, releases and metrics through stable IDs.'],
      ['Approval inbox', 'Review a specific action and artifact revision, with an accountable owner and an expiry.'],
      ['Bot teams', 'A lead proposes bounded tasks for specialists. Delegation can narrow permissions, never expand them.'],
      ['Models + Scoped memory', 'Reuse approved knowledge without exposing another agent, project or department’s private data.'],
      ['Connectors', 'Jira, Notion, CRM and data systems exchange approved updates with source ownership and conflict review.'],
    ],
    sequence: ['Customer feedback', 'Product requirement', 'Developer change', 'QA evidence', 'DevOps release', 'Business outcome'],
    detail: [
      ['Team handoff', 'ContextEnvelope carries tenant, project, source object/revision, destination and return-state references.', 'Recheck destination access and preserve the original draft if access or setup is missing.'],
      ['Bot delegation', 'Child Run inherits the intersection of parent permissions, project policy and approved specialist-template scopes.', 'Apply depth, concurrency, token and tool limits. Revoke queued actions when membership changes.'],
      ['Connector sync', 'ConnectorBinding records provider IDs, field ownership, cursor and delegated scope. Events have deduplication IDs.', 'Verify webhook signatures, deduplicate delivery and surface conflicting changes for review.'],
    ],
    now: 'Company membership and shared-workspace routines are present, with role-specific views and saved business workflow records. The 2.0 foundation is reused.',
    next: 'Autonomous bot teams, live business connector actions, enterprise SSO and granular department policy are target capabilities. A configured schedule does not mean an external job ran.',
  },
  '4.0': {
    title: 'The platform, inside your boundary.',
    description: 'Bring identity, storage, workers, secrets and operations into customer-controlled infrastructure. Keep the product model compatible while making placement and egress explicit.',
    boundary: 'A real private installation uses its own customer-controlled identity and database. The hosted 4.0 demo shares the prototype foundation; it is not proof of a private-cloud deployment.',
    components: [
      ['Identity + Architect UI', 'Use the company identity provider and a single company sign-in entry, with administrative role assignment.'],
      ['API + Policy', 'Enforce installation and tenant policy before work enters customer execution pools.'],
      ['Workflow + Agent workers', 'Run pinned workflow and agent versions with quotas, checkpointing and bounded delegation.'],
      ['Postgres + Artifacts + Secrets', 'Store relational state, derived retrieval indexes and artifacts inside the approved boundary. Keep keys outside prompts.'],
      ['Execution pools + Approved models', 'Isolate untrusted code and allow only approved destinations through controlled egress.'],
      ['Signed registry + Telemetry + Recovery', 'Verify install packages, audit operations and test backups and restore paths before upgrades.'],
    ],
    sequence: ['Choose placement', 'Connect identity', 'Approve network', 'Configure workers', 'Verify installation', 'Operate & recover'],
    detail: [
      ['Bootstrap', 'Installation records an approved cloud profile, first owner, identity provider and signing trust.', 'Disable bootstrap after initial setup; email domain alone never grants company membership.'],
      ['Run placement', 'RuntimeProfile pins region, execution pool, egress, limits, secret references and artifact storage.', 'Private-model policy fails closed. Never silently send a restricted prompt to a public provider.'],
      ['Upgrade & restore', 'Upgrade references a signed image, compatible schema and tested backup; Recovery records restore evidence.', 'Use expand/contract migrations. Application rollback cannot reverse a destructive database change.'],
    ],
    now: 'Cloud, installation, governance and recovery journeys are configuration prototypes. A Docker scaffold exists, with packaging validation still required.',
    next: 'Customer-cloud installation, hardened execution pools, federated identity and certified backup/restore are proposed. Production operation is not guaranteed to fit a free tier.',
  },
};
const owners = {
  ORG:'Identity + Policy', PLAN:'Project context', BUILD:'Builder UI + Sandbox', CODE:'Repository service + Sandbox', AGENT:'Agent harness + Orchestrator', MODEL:'Model gateway', DATA:'Context + Connectors', QA:'Test + Release', RELEASE:'Release + Private lifecycle', OPS:'Audit + Usage + Telemetry', CRM:'Company records + Connectors', CX:'Company records + Project graph', FIN:'Company records + Approvals', PEOPLE:'Company records + Identity policy', BI:'Metrics catalog + Project graph', MKT:'Company records + Connectors',
};
const table = (headers, rows, label) => `<div class="table-wrap architecture-table" role="region" aria-label="${esc(label)}" tabindex="0"><table><thead><tr>${headers.map(h=>`<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((cell,i)=>i===0?`<th scope="row">${esc(cell)}</th>`:`<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const diagram = (file,alt,caption) => `<figure class="architecture-figure"><a class="architecture-image-link" href="architecture/diagrams/${file}.png" target="_blank" rel="noopener noreferrer" aria-label="Open ${esc(alt)} at full size in a new tab"><img src="architecture/diagrams/${file}.png" width="1536" height="1024" alt="${esc(alt)}"><span>Open full-size diagram ↗</span></a><figcaption>${esc(caption)}</figcaption></figure>`;
const resources = () => `<div class="architecture-resources"><span>Read the complete technical design</span><div class="actions"><a class="button" href="architecture/ARCHITECTURE.pdf" target="_blank" rel="noopener noreferrer">Architecture PDF ↗</a><a class="button" href="architecture/ARCHITECTURE.md" download>Download Markdown ↓</a></div></div>`;
export function editionArchitecture(version,tab,features,products) {
  const e=editions[version];
  const boundary=`<div class="architecture-status"><span class="pill">Proposed target design</span><p>${esc(e.boundary)}</p></div>`;
  if (tab==='architecture') return `<div class="edition-architecture">
    <header class="architecture-heading"><span class="eyebrow">ARCHITECT ${version} / SYSTEM VIEW</span><h2>${e.title}</h2><p>${e.description}</p></header>${boundary}
    ${diagram('architect-'+version[0],`Architect ${version} labelled architecture`, 'GPT-generated component view. The descriptions below define each responsibility; connections illustrate the proposed system, not live integration status.')}
    <section><h2>Component responsibilities</h2><div class="architecture-components">${e.components.map(([title,body],i)=>`<article><span class="architecture-number">${String(i+1).padStart(2,'0')}</span><h3>${title}</h3><p>${body}</p></article>`).join('')}</div></section>
    <section><h2>How work moves through the system</h2><ol class="architecture-sequence">${e.sequence.map(x=>`<li>${x}</li>`).join('')}</ol></section>
    <section><h2>Implementation boundary</h2><div class="architecture-boundaries"><article><h3>Current prototype</h3><p>${e.now}</p></article><article><h3>Proposed execution</h3><p>${e.next}</p></article></div></section>${resources()}</div>`;
  const groups=products.map(p=>({...p,rows:features.filter(f=>f.product_key===p.product_key)})).filter(p=>p.rows.length);
  return `<div class="edition-architecture">
    <header class="architecture-heading"><span class="eyebrow">ARCHITECT ${version} / TECHNICAL DESIGN</span><h2>From system boundaries to precise contracts.</h2><p>HLD explains what each system owns. LLD defines the records, permissions, transitions and recovery rules that make it work.</p></header>${boundary}
    <section><h2>HLD / technology and ownership</h2>${table(['Layer','Technology direction','Responsibility'],[
      ['Experience','React + TypeScript; proposed Monaco editor','Guided and developer views over the same project objects.'],
      ['Identity & state','Supabase / Postgres; customer-controlled equivalents in private installs','Authoritative memberships, artifact revisions and policy checks.'],
      ['Durable execution','Proposed Temporal orchestration + Lyzr runtime adapter','Checkpointed runs, bounded specialist delegation and approval waits.'],
      ['Models & knowledge','OpenRouter gateway; proposed object storage + pgvector','Policy-filtered model routing, source-linked retrieval and explicit memory scopes.'],
      ['Code execution','Proposed microVM sandbox + test/deployment adapters','Isolate untrusted code; preserve test evidence and provider receipts.'],
    ],'High-level technology decisions')}</section>
    <section><h2>LLD / edition-specific contracts</h2>${table(['Flow','Data contract','Failure and recovery'],e.detail,'Edition low-level design')}</section>
    <section><h2>Context and memory</h2>${diagram('context-memory','Labelled context and memory flow','The shared memory design applies to all three editions. Project artifacts remain the source of truth; memory is a permissioned retrieval aid.')}
    ${table(['Scope','Contents','Boundary'],[
      ['Session','Recent messages, task state and summaries','Bounded retention; no implicit company sharing.'],
      ['Agent','Specialist working notes and approved lessons','Tenant + project + agent isolation. Sharing requires explicit promotion.'],
      ['Project','PRD, TRD, HLD, LLD, code and decisions','Revisioned sources and project membership; never silently replace approved facts.'],
      ['Company','Approved templates, policies and metric definitions','Group-aware access; private HR and finance records are not globally shared.'],
      ['Execution','Traces, tool receipts, evidence and checkpoints','Run-scoped audit access; secrets redacted; retention enforced.'],
    ],'Memory scopes')}
    <p class="architecture-note">Retrieval checks membership, scope, source freshness and expiry before the model sees context. Memory writes pass validation and approval before shared promotion. Deleting a source invalidates derived retrieval entries.</p></section>
    <section><h2>Run lifecycle and controls</h2><ol class="architecture-sequence">${['Queued','Preparing','Running','Approval / validation','Completed'].map(x=>`<li>${x}</li>`).join('')}</ol><p class="architecture-note">Failure exits are failed, cancelled and timed out. Approval binds an action hash and resource revision. Cancellation stops new tool calls; external actions already completed require reconciliation.</p>
    ${table(['Contract','Required rule'],[
      ['Project revision','Writes require the expected revision. Concurrent changes produce a conflict, not silent overwrite.'],
      ['Agent definition','Each run pins its instructions, model policy, tool scopes and memory boundary.'],
      ['Tool invocation','Schema validation, permission recheck, idempotency key and provider receipt.'],
      ['Quality evidence','Tests certify one exact changeset and environment; changed code invalidates old approval.'],
      ['Cost ledger','Record run, agent, model, module and API attribution; estimates and actual charges stay separate.'],
    ],'Shared low-level contracts')}</section>
    <section><h2>Product and feature mapping</h2><p class="architecture-note">${features.length} cumulative packages across ${groups.length} product areas. Each entry links to its documented feature journey. This is architecture coverage, not a claim that every integration is live.</p>
    <div class="architecture-product-map">${groups.map(p=>`<article><header><h3>${esc(p.product)}</h3><span>${esc(owners[p.product_key])}</span></header><ul>${p.rows.map(f=>`<li data-architecture-feature="${esc(f.feature_id)}"><a href="#feature/${esc(f.feature_id)}"><span>${esc(f.feature_id)}</span>${esc(f.feature)}</a></li>`).join('')}</ul></article>`).join('')}</div></section>${resources()}</div>`;
}
