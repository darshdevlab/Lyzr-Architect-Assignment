const $ = (s) => document.querySelector(s);
const esc = (v) =>
  String(v ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const safeUrl = (u) => (/^https:\/\//.test(u || '') ? u : '#');
let D, C;
let filter = { query: '', product: 'all', kind: 'all', scope: 'all' };
const edition = {
  '2.0': {
    title: 'Build with confidence.',
    label: 'The builder platform',
    intro:
      'A complete path from an idea or existing repository to a reviewed application. Keep the easy start; reveal professional controls when the work needs them.',
    why: 'The assignment begins here: preserve the non-technical experience and give developers ownership of code, agents, models, testing and release.',
    roles: 'Individual builders · Developers · QA · Designers',
    path: [
      'Describe or import',
      'Review a living plan',
      'Build with agents',
      'Inspect, revise & test',
      'Review release',
    ],
    boundary:
      'Core application delivery. Department-wide operating systems belong in 3.0; installing Architect itself belongs in 4.0.',
  },
  '3.0': {
    title: 'One company. Connected work.',
    label: 'The company platform',
    intro:
      'Bring product, engineering and business teams around the same evidence, decisions and projects. Each person starts with their own responsibilities, without fragmenting the work.',
    why: 'Shipping software starts before a prompt and continues after deployment. Connect customer signals, planning, work, reporting and bot teams to the builder underneath.',
    roles: 'Product · Engineering · Sales · CX · Finance · People · Leadership',
    path: [
      'Join a role workspace',
      'Connect sources',
      'Turn signals into a decision',
      'Delegate & approve work',
      'Measure the outcome',
    ],
    boundary:
      'Adds company-wide workflows to the 2.0 foundation. Roles change views and responsibilities; they do not create a second copy of a project.',
  },
  '4.0': {
    title: 'Your platform. Your perimeter.',
    label: 'The private infrastructure platform',
    intro:
      'Operate Architect within a company’s infrastructure and policies. Separate where the platform runs from where generated applications are deployed.',
    why: 'Some organizations need control over network boundaries, identity, data placement and operations. Make installation and governance understandable, observable and recoverable.',
    roles: 'Platform admins · Security · DevOps · Infrastructure owners',
    path: [
      'Choose installation',
      'Validate prerequisites',
      'Configure identity & network',
      'Install & verify',
      'Operate, upgrade & recover',
    ],
    boundary:
      'Private deployment is a guided prototype unless a real installation is explicitly verified. A Docker download or cloud configuration screen is not proof of an installed control plane.',
  },
};
function sourceLinks(ids = []) {
  return `<div class="source-row">${ids
    .map((id) => {
      const s = D.market.sources[id];
      return s
        ? `<a class="source" target="_blank" rel="noopener noreferrer" href="${esc(safeUrl(s.url))}">${esc(s.title)} ↗</a>`
        : '';
    })
    .join('')}</div>`;
}
function heading(n, t, note = '') {
  return `<div class="section-heading" id="${n}"><h2>${t}</h2>${note ? `<p>${note}</p>` : ''}</div>`;
}
function callout(t, b) {
  return `<div class="callout"><div><strong>${t}</strong><p>${b}</p></div></div>`;
}
function shot(s) {
  return `<button class="screenshot card" data-shot="${esc(s.id)}"><img src="${esc(s.image)}" alt="${esc(s.platform + ' — ' + s.label)}" loading="lazy"><span class="caption"><span>${esc(s.label.replaceAll('-', ' '))}</span><span>Expand ↗</span></span></button>`;
}
function pageHead(k, title, lead) {
  return `<div class="page-head"><div class="eyebrow">${k}</div><h1 class="page-title">${title}</h1><p class="lead">${lead}</p></div>`;
}
const platformIdentity = {
  architect: { name: 'Architect + Lyzr', logo: '../architect-mascot.svg' },
  replit: { name: 'Replit', logo: 'replit.png' },
  lovable: { name: 'Lovable', logo: 'lovable.svg' },
  emergent: { name: 'Emergent', logo: 'emergent.png' },
  v0: { name: 'Vercel v0', logo: 'v0.svg' },
  rocket: { name: 'Rocket.new', logo: 'rocket.svg' },
  bolt: { name: 'Bolt', logo: 'bolt.png' },
  codex: { name: 'Codex Cloud', logo: 'codex.svg' },
  cursor: { name: 'Cursor', logo: 'cursor.png' },
  claude: { name: 'Claude Code', logo: 'claude.svg' },
  claude_chat: { name: 'Claude', logo: 'claude.svg' },
};
function platformLogo(p) {
  return `<span class="research-logo"><img src="media/platforms/${platformIdentity[p.key].logo}" alt="" width="32" height="32"></span>`;
}
function researchChart({ id, title, description, field, anchor, unit }) {
  const value = (p) => p[field].length;
  const max = Math.max(...visiblePlatforms().map(value));
  return `<section class="research-chart" aria-labelledby="${id}"><div class="chart-heading"><span class="eyebrow">${unit}</span><h2 id="${id}">${title}</h2><p>${description}</p></div><div class="chart-bars">${visiblePlatforms()
    .map(
      (p) =>
        `<a class="chart-row" href="#platform/${p.key}" data-anchor="${anchor}" aria-label="${esc(platformIdentity[p.key].name)}: ${value(p)} ${unit.toLowerCase()}. Open research."><span class="chart-label">${esc(platformIdentity[p.key].name)}</span><span class="bar-track" aria-hidden="true"><span class="bar-fill" style="width:${(value(p) / max) * 100}%"></span></span><strong>${value(p)}</strong></a>`,
    )
    .join(
      '',
    )}</div><p class="chart-footnote">Select a row to open its ${anchor === 'inventory' ? 'feature inventory' : 'user journey'}. Bar length shows the count, not product quality.</p></section>`;
}
const expandedNavSections = new Set();
let previousNavSection = null;
function nav() {
  const route = location.hash.slice(1) || 'home';
  const section = /^(explore|platform|comparison|blockers)/.test(route)
    ? 'explore'
    : /^(build|feature|baseline|scope)/.test(route)
      ? 'build'
      : route;
  if (section !== previousNavSection) {
    expandedNavSections.add(section);
    previousNavSection = section;
  }
  const sectionButton = (key, number, label) =>
    `<button class="nav-head nav-section ${section === key ? 'active' : ''}" data-nav-section="${key}" aria-expanded="${expandedNavSections.has(key)}" aria-controls="nav-${key}"><i>${number}</i><span>${label}</span><span class="nav-chevron" aria-hidden="true"></span></button>`;
  $('#nav').innerHTML =
    `<a class="nav-child intro-nav ${route === 'home' ? 'active' : ''}" href="#home">Assignment introduction</a>
    ${sectionButton('explore', '01', 'Explore')}
    <div id="nav-explore" ${expandedNavSections.has('explore') ? '' : 'hidden'}>
      <a class="nav-child nav-comparison ${route === 'comparison' ? 'active' : ''}" href="#comparison"><span class="comparison-dot" aria-hidden="true"></span>Comparison</a>
      ${visiblePlatforms()
        .map(
          (p) =>
            `<a class="nav-child platform-nav ${route.split('/').slice(0, 2).join('/') === 'platform/' + p.key ? 'active' : ''}" ${route.split('/').slice(0, 2).join('/') === 'platform/' + p.key ? 'aria-current="page"' : ''} href="#platform/${p.key}"><span>${esc(platformIdentity[p.key].name)}</span></a>`,
        )
        .join('')}
    </div>
    ${sectionButton('build', '02', 'Build')}
    <div id="nav-build" ${expandedNavSections.has('build') ? '' : 'hidden'}>
      <a class="nav-child ${route.startsWith('scope') ? 'active' : ''}" href="#scope/products/inherited" ${route.startsWith('scope') ? 'aria-current="page"' : ''}>Product Scope</a>
      ${Object.keys(edition)
        .map(
          (v) =>
            `<a class="nav-child ${route.split('/').slice(0, 2).join('/') === 'build/' + v ? 'active' : ''}" href="#build/${v}">Architect ${v}<b>${v === '2.0' ? 'BUILD' : v === '3.0' ? 'COMPANY' : 'PRIVATE'}</b></a>`,
        )
        .join('')}
      <a class="nav-child ${route === 'features' || route.startsWith('feature/') ? 'active' : ''}" href="#features">Feature atlas <b>109</b></a>
    </div>
    <a class="nav-head ${route === 'deploy' ? 'active' : ''}" href="#deploy"><i>03</i> Deploy</a>`;
}
function introduction() {
  return `<section class="assignment-intro" aria-labelledby="intro-name">
    <div class="eyebrow">Lyzr · Product Manager assignment</div>
    <div class="author-profile">
      <img class="author-portrait" src="media/darsh-portrait.png" alt="Illustrated portrait of Darsh Dave" width="152" height="152" fetchpriority="high">
      <div class="author-details"><p class="author-kicker">A product assignment by,</p><h1 id="intro-name">Darsh Dave<span>.</span></h1><p class="author-title">AI Product Manager</p><a class="portfolio-link" href="https://darshdave.com" target="_blank" rel="noopener noreferrer">darshdave.com <span aria-hidden="true">↗</span><span class="sr-only"> — opens in a new tab</span></a></div>
    </div>
    <div class="intro-summary"><h2>From understanding the problem<br>to building what comes next.</h2></div>
    <section class="contact-details" aria-labelledby="contact-title">
        <h2 id="contact-title">Contact details</h2>
        <address class="contact-links">
          <a href="tel:+917676121429"><span>Phone</span>+91-7676121429</a>
          <a href="mailto:darsh.dave1999@gmail.com"><span>Email</span>darsh.dave1999@gmail.com</a>
          <a
            href="https://www.linkedin.com/in/darsh-dave/"
            target="_blank"
            rel="noopener noreferrer"
            ><span>LinkedIn ↗</span>linkedin.com/in/darsh-dave/</a
          >
          <a href="https://github.com/darshdevlab" target="_blank" rel="noopener noreferrer"
            ><span>GitHub ↗</span>github.com/darshdevlab</a
          >
        </address>
      </section>
    <div class="intro-paths" aria-label="Explore the assignment">
      <a class="intro-path" href="#explore"><div class="path-top"><span class="path-number">01 / THE RESEARCH</span><span class="path-arrow" aria-hidden="true">↗</span></div><h2>Explore</h2><p>The platforms, the people, and the possibilities. Follow the feature research, user journeys, comparisons and screenshots.</p><span class="path-action">Discover the thinking <span aria-hidden="true">→</span></span></a>
      <a class="intro-path intro-path-build" href="#build"><div class="path-top"><span class="path-number">02 / THE PRODUCT</span><span class="path-arrow" aria-hidden="true">↗</span></div><h2>Build</h2><p>From insight to interaction. Explore Architect 2.0, 3.0 and 4.0, the product decisions behind them, and the working prototypes.</p><span class="path-action">Explore the work <span aria-hidden="true">→</span></span></a>
      <a class="intro-path intro-path-deploy" href="#deploy"><div class="path-top"><span class="path-number">03 / THE LIVE EXPERIENCE</span><span class="path-arrow" aria-hidden="true">↗</span></div><h2>Deploy</h2><p>See how the code, database, Google sign-in and hosting connect—from GitHub to our custom domains.</p><span class="path-action">Explore the setup <span aria-hidden="true">→</span></span></a>
    </div>
    <p class="intro-footnote">Research → Product thinking → Design → Working prototypes</p>
  </section>`;
}
function deployments() {
  const repo = 'https://github.com/darshdevlab/Lyzr-Architect-Assignment';
  const steps = [
    {
      name: 'GitHub',
      title: 'Organize the code in one repository.',
      description:
        'Lyzr-Architect-Assignment keeps the three editions and the assignment together. The editions reuse the same application; a build setting selects the interface.',
      items: [
        [
          'Application',
          'apps/platform contains the React/Vite interface, server API, database schemas and tests.',
        ],
        [
          'Assignment',
          'apps/assignment contains this case study. Research and curated evidence live in docs.',
        ],
        [
          'Configuration',
          'Environment examples are committed; actual keys stay outside Git. Shared build scripts live in scripts.',
        ],
      ],
      path: 'Code → Shared application → Edition-specific build',
      link: repo,
      linkLabel: 'View repository',
    },
    {
      name: 'Supabase',
      title: 'Share identity and project data.',
      description:
        'The architect-prototypes project is the common backend for Architect 2.0, 3.0 and 4.0. We retain one set of accounts and project records across the three experiences.',
      items: [
        [
          'Database',
          'The application schemas define personal workspaces, company membership, shared projects and generation quotas.',
        ],
        [
          'Permissions',
          'Row-level security and authenticated database functions enforce access. A company role determines which shared records a member can use.',
        ],
        [
          'Authentication',
          'Email/password and Google use Supabase Auth. The three application origins are on the redirect allowlist; Architect 2 is the default site URL.',
        ],
      ],
      path: 'Sign in → Check identity and membership → Load permitted projects',
      link: repo + '/tree/main/apps/platform/supabase',
      linkLabel: 'View database schemas',
    },
    {
      name: 'Google Cloud Console',
      title: 'Connect Google sign-in to Supabase.',
      description:
        'The Architect Prototypes Google Cloud project supplies the Google identity configuration. Supabase completes the sign-in and returns the user to the edition they opened.',
      items: [
        [
          'App configuration',
          'Configure the app identity and consent information in Google Cloud, then create a Web application OAuth client.',
        ],
        [
          'Callback',
          'Use the Supabase authentication callback as the authorized redirect URI. Connect the client ID and secret to the Google provider in Supabase.',
        ],
        [
          'Return to the app',
          'Allow the application URLs in Supabase. The app receives its Supabase session after Google sign-in; credentials are not embedded in the frontend.',
        ],
      ],
      path: 'Architect → Supabase Auth → Google → Supabase callback → Architect',
    },
    {
      name: 'Vercel',
      title: 'Publish four experiences from the shared code.',
      description:
        'Each Architect edition has its own Vercel deployment and URL. They use the same Supabase backend configuration and API implementation; the assignment is a separate static deployment.',
      items: [
        [
          'Platform builds',
          'Use apps/platform as the root, pnpm build as the build command and dist as the output. Set VITE_EDITION to 2, 3 or 4 for the matching deployment.',
        ],
        [
          'Assignment build',
          'Use the repository root, run pnpm build:assignment and publish apps/assignment/dist. It contains the case study and curated evidence assets.',
        ],
        [
          'Publishing',
          'The recorded deployment process uses the authenticated Vercel CLI. The GitHub repository stores the code; automatic GitHub-to-Vercel publishing was not configured in the setup record.',
        ],
      ],
      path: 'Verify locally → Build the selected edition → Publish to Vercel → Check the URL',
    },
    {
      name: 'Environment & AI',
      title: 'Keep provider credentials on the server.',
      description:
        'The UI uses public Supabase configuration. Live prompting goes through the application API, which verifies the signed-in user before requesting a model through OpenRouter.',
      items: [
        [
          'Public settings',
          'VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY connect the browser to Supabase. VITE_EDITION selects the experience.',
        ],
        [
          'Server secret',
          'OPENROUTER_API_KEY belongs in server environment settings. It is not a VITE variable and is never included in browser code or the repository.',
        ],
        [
          'Request controls',
          'The API validates the session, checks request quotas and restricts generation to the configured free-model catalog. Provider limits can still affect availability.',
        ],
      ],
      path: 'Prompt → Authenticated API → Quota check → OpenRouter → App preview',
    },
    {
      name: 'GoDaddy & domains',
      title: 'Connect the four custom addresses.',
      description:
        'The darshdave.com domain is managed in GoDaddy. The recorded migration reused its existing wildcard DNS record and attached each subdomain to its matching Vercel project.',
      items: [
        [
          'Domain mapping',
          'Architect 2, 3 and 4 each receive their own subdomain. The assignment uses lyzrassignment.darshdave.com.',
        ],
        [
          'Authentication URLs',
          'Add all three application origins to Supabase’s authentication redirect allowlist so Google can return users to the correct edition.',
        ],
        [
          'Verification',
          'The migration record documents completed Google sign-in on all three custom origins on 27 September 2026, plus the existing project in Architect 2 and company access gates in 3 and 4.',
        ],
      ],
      path: 'GoDaddy DNS → Vercel domain mapping → HTTPS address → Sign-in check',
      link: repo + '/blob/main/docs/DOMAIN-MIGRATION.md',
      linkLabel: 'View migration record',
    },
  ];
  return `${pageHead('03 / Deploy', 'From code to a live platform.', 'How we connected GitHub, Vercel, Supabase and Google sign-in, then published the four experiences on our own domain.')}
    <nav class="deployment-index" aria-label="Deployment setup sections">${steps.map((step, i) => `<a href="#deploy" data-anchor="deploy-step-${i + 1}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(step.name)}</a>`).join('')}</nav>
    <div class="deployment-steps">${steps.map((step, i) => `<section class="deployment-step" aria-labelledby="deploy-step-${i + 1}"><div class="deployment-step-heading"><span class="deployment-number">${String(i + 1).padStart(2, '0')}</span><div><span class="eyebrow">${esc(step.name)}</span><h2 id="deploy-step-${i + 1}">${esc(step.title)}</h2><p>${esc(step.description)}</p></div></div><dl class="deployment-details">${step.items.map(([label, detail]) => `<div><dt>${esc(label)}</dt><dd>${esc(detail)}</dd></div>`).join('')}</dl><p class="deployment-path"><span>Connection flow</span>${esc(step.path)}</p>${step.link ? `<a class="deployment-source" href="${step.link}" target="_blank" rel="noopener noreferrer">${step.linkLabel} ↗</a>` : ''}</section>`).join('')}</div>
    ${heading('deployment-addresses', 'One foundation. Four addresses.')}
    <div class="table-wrap" role="region" aria-label="Deployment configuration" tabindex="0"><table class="deployment-table"><thead><tr><th scope="col">Experience</th><th scope="col">Build configuration</th><th scope="col">Shared services</th><th scope="col">Address</th></tr></thead><tbody>${Object.keys(
      edition,
    )
      .map(
        (v) =>
          `<tr><th scope="row">Architect ${v}</th><td>apps/platform<br><code>VITE_EDITION=${v[0]}</code></td><td>Supabase accounts, database and backend configuration</td><td><a href="${esc(safeUrl(C.versions[v].liveUrl))}" target="_blank" rel="noopener noreferrer">architect${v[0]}.darshdave.com ↗</a></td></tr>`,
      )
      .join(
        '',
      )}<tr><th scope="row">Assignment</th><td>Repository root<br><code>pnpm build:assignment</code></td><td>Static research and product showcase</td><td><a href="https://lyzrassignment.darshdave.com" target="_blank" rel="noopener noreferrer">lyzrassignment.darshdave.com ↗</a></td></tr></tbody></table></div>
    <p class="screenshot-note">This describes the hosted prototype setup. Architect 4.0’s company-cloud installation screens demonstrate a proposed workflow; this published edition runs on Vercel.</p>`;
}

function overview() {
  const featureCount = visiblePlatforms().reduce((n, p) => n + p.features.length, 0);
  const journeyCount = visiblePlatforms().reduce((n, p) => n + p.journey.length, 0);
  return `<div class="research-dashboard">
    <header class="research-heading"><div><div class="eyebrow">01 / Explore</div><h1>The platforms. The patterns.</h1><p>Explore the evidence behind Architect. Choose a platform to see its features, user journey and screenshots.</p></div><a class="button" href="#comparison">Compare platforms <span aria-hidden="true">↗</span></a></header>
    <section aria-labelledby="platform-directory"><div class="directory-heading"><h2 id="platform-directory">Explored platforms</h2><span>${visiblePlatforms().length} research records · One shared brief</span></div>
      <div class="platform-directory">${visiblePlatforms()
        .map(
          (p) =>
            `<a class="platform-tile" href="#platform/${p.key}">${platformLogo(p)}<span class="platform-tile-copy"><strong>${esc(platformIdentity[p.key].name)}</strong><small>${p.key === 'claude' ? 'Access & upgrade flow' : p.key === 'claude_chat' ? 'Chat / Artifacts exploration' : `${p.features.length} groups · ${p.journey.length} stages`}</small></span><span class="tile-arrow" aria-hidden="true">↗</span></a>`,
        )
        .join('')}</div>
    </section>
    <section class="research-metrics" aria-label="Research summary">
      <article><span class="metric-label">Feature groups documented</span><strong>${featureCount}</strong><p>Grouped observations across ${visiblePlatforms().length} records</p></article>
      <article><span class="metric-label">User journey stages mapped</span><strong>${journeyCount}</strong><p>Entry, actions, responses and design implications</p></article>
    </section>
    <div class="research-charts">
      ${researchChart({ id: 'feature-coverage', title: 'Features, platform by platform.', description: 'Number of feature groups in each saved inventory.', field: 'features', anchor: 'inventory', unit: 'Feature groups' })}
      ${researchChart({ id: 'journey-coverage', title: 'Follow the user journey.', description: 'Number of documented stages in each exploration.', field: 'journey', anchor: 'journey', unit: 'Journey stages' })}
    </div>
    <p class="research-scope-note">Counts describe our research coverage, not every feature a platform offers or fully completed journeys. Claude Code covers its access gate; Claude Chat / Artifacts is a separate exploration.</p>
    </div>${heading('method', 'One brief. Different experiences.')}<div class="split"><div class="card"><h3>The SupportDesk benchmark</h3><p>Build a responsive support app with a demo entry, dashboard, searchable ticket inbox, create/update actions, editable knowledge base, agent settings and persistent activity. AI suggestions must cite the knowledge base and require human approval before a reply is sent.</p><br><p>The shared follow-up added a Needs approval filter, dashboard count and a timestamped approval event. Fictional data only; no paid connections or automatic publishing.</p></div><div class="card"><h3>What this comparison can tell us</h3><p>We observed how platforms explain progress, expose controls, support correction and handle limits. Account tiers, available credits, model defaults and recovery interventions differed. Cursor also had a small trailing text-entry artifact.</p><br><p>This is product research, not a controlled model benchmark or a universal performance ranking. Claude Code was gated; free Claude Chat / Artifacts is a separate comparison.</p></div></div>${researchBoundaries()}`;
}
function journeyIcon(title) {
  const paths = /ship|deploy|publish|launch|handoff/i.test(title)
    ? '<path d="M12 16V3m-5 5 5-5 5 5M5 14v6h14v-6"/>'
    : /preview|inspect|review/i.test(title)
      ? '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8m-4-4v4m-5-10 3 3 6-6"/>'
      : /build|generat|run|execution|develop/i.test(title)
        ? '<path d="m8 5-6 7 6 7m8-14 6 7-6 7m-3-16-2 18"/>'
        : /connect|orchestrat|extend|collaborat|share/i.test(title)
          ? '<circle cx="5" cy="12" r="3"/><circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8 10 7-4m-7 8 7 4"/>'
          : /plan|prompt|clarify|direction|submit|instructions/i.test(title)
            ? '<path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h5"/>'
            : /configure|model|custom|manage|context|backend/i.test(title)
              ? '<path d="M3 6h18M3 12h18M3 18h18"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>'
              : /recover|iterat|revis|refine|version/i.test(title)
                ? '<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>'
                : '<path d="M3 6h7l2 3h9v11H3zM3 6V4h7l2 2h7v3"/>';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}
function architectFeatureChecklist(context) {
  if (!D.architectInventory) return '';
  let featureNumber = 0;
  return `<section class="feature-table-section" data-architect-checklist="${context}">
    <div class="feature-table-heading"><div><span class="eyebrow">Detailed inventory</span><h2>Every recorded Architect feature</h2></div><span class="feature-count">422 features · 39 groups</span></div>
    <p class="feature-table-description">Native Architect and connected Lyzr Studio controls, with the original exploration status.</p>
    <div class="table-wrap feature-inventory-wrap" role="region" aria-label="Detailed Architect feature inventory" tabindex="0"><table class="detailed-feature-table"><thead><tr><th scope="col">No.</th><th scope="col">Feature name</th><th scope="col">Product area</th><th scope="col">Recorded coverage</th></tr></thead><tbody>${D.architectInventory.groups.map((g) => g.features.map((f) => `<tr><td class="feature-row-number">${String(++featureNumber).padStart(3, '0')}</td><th scope="row">${esc(f)}</th><td>${esc(g.group)}<span class="feature-scope">${esc(g.scope)}</span></td><td>${esc(g.status)}</td></tr>`).join('')).join('')}</tbody></table></div>
  </section>`;
}
function horizontalJourney(p, flow, index) {
  const steps = flow.stageIndices.map((i) => p.journey[i]);
  let nodes;
  if (steps.length === 1) {
    const step = steps[0];
    const actions = step[1]
      .split('→')
      .map((part) => part.trim())
      .filter(Boolean);
    nodes = actions.map((action) => ({ title: 'User action', body: action, icon: step[0] }));
    nodes.push({ title: 'Recorded response / outcome', body: step[2], icon: 'Review' });
  } else {
    nodes = steps.map((step) => ({
      title: step[0],
      body: step[1],
      response: step[2],
      icon: step[0],
    }));
  }
  return `<article class="documented-flow" id="documented-flow-${index}" data-source-stages="${flow.stageIndices.join(',')}"><h3><span class="flow-title-number">${String(index + 1).padStart(2, '0')}</span>${esc(flow.title)}</h3><div class="horizontal-journey" role="region" aria-label="${esc(flow.title)} journey" tabindex="0"><ol>${nodes.map((node, i) => `<li><div class="horizontal-node-heading"><span class="journey-mini-icon">${journeyIcon(node.icon)}</span><span>${esc(node.title)}</span><span class="horizontal-node-number">${i + 1}</span></div><p>${esc(node.body)}</p>${node.response ? `<div class="horizontal-node-response"><span>Recorded response</span><p>${esc(node.response)}</p></div>` : ''}</li>`).join('')}</ol></div><details class="flow-notes"><summary>Recorded observations</summary>${steps.map((step) => `<p><strong>${esc(step[0])}:</strong> ${esc(step[3])}</p>`).join('')}</details></article>`;
}
function featureJourneyCoverage(p) {
  return `<section class="feature-table-section" id="inventory">
    <div class="feature-table-heading"><div><span class="eyebrow">Feature coverage</span><h2>What the platform offers</h2></div><span class="feature-count">${p.features.length} recorded groups</span></div>
    <p class="feature-table-description">Feature names, recorded controls and the scope of our exploration.</p>
    <div class="table-wrap feature-inventory-wrap" role="region" aria-label="${esc(p.name)} feature coverage" tabindex="0"><table class="feature-journey-coverage platform-feature-table"><thead><tr><th scope="col">Feature name</th><th scope="col">What it is & what it includes</th><th scope="col">Exploration & limitations</th></tr></thead><tbody>${p.features.map((f) => `<tr><th scope="row">${esc(f[0])}</th><td>${esc(f[1])}</td><td>${esc(f[2])}</td></tr>`).join('')}</tbody></table></div>
  </section>`;
}
function platform(key) {
  const p = D.platforms.find((x) => x.key === key);
  if (!p) return notfound();
  const tabNames = [
    ['features', 'Features'],
    ['journey', 'User Journey'],
    ['insights', 'Insights'],
  ];
  const requestedTab = location.hash.split('/')[2];
  const active = tabNames.some(([id]) => id === requestedTab) ? requestedTab : 'features';
  return `${pageHead('01 / Explore', esc(p.name), esc(p.position))}
    <div class="platform-tabs" role="tablist" aria-label="${esc(p.name)} exploration">
      ${tabNames.map(([id, label]) => `<button role="tab" id="platform-tab-${id}" aria-controls="platform-panel-${id}" aria-selected="${id === active}" tabindex="${id === active ? '0' : '-1'}" data-platform-tab="${id}" data-platform-key="${key}">${label}</button>`).join('')}
    </div>
    <section role="tabpanel" id="platform-panel-features" aria-labelledby="platform-tab-features" tabindex="0" ${active === 'features' ? '' : 'hidden'}>
      ${featureJourneyCoverage(p)}
      ${key === 'architect' ? architectFeatureChecklist('features') : ''}
    </section>
    <section role="tabpanel" id="platform-panel-journey" aria-labelledby="platform-tab-journey" tabindex="0" ${active === 'journey' ? '' : 'hidden'}>
      ${heading('journey', `${esc(platformIdentity[key].name)}: documented journeys`, `${p.journeyFlows.length} grouped flows · ${p.journey.length} recorded stages`)}
      <div class="documented-flows">${p.journeyFlows.map((flow, i) => horizontalJourney(p, flow, i)).join('')}</div>
    </section>
    <section role="tabpanel" id="platform-panel-insights" aria-labelledby="platform-tab-insights" tabindex="0" ${active === 'insights' ? '' : 'hidden'}>
      ${heading('insights', 'Outcome & observations', 'What happened, and what it means')}
      <article class="platform-outcome"><span class="eyebrow">Final outcome</span><h3>What we achieved in this exploration</h3><p>${esc(p.access)}</p></article>
      <div class="outcome-evidence">${p.outputScreenshot ? shot(p.outputScreenshot) : ''}<p class="screenshot-note">${esc(p.outputNote || '')}</p></div>
      ${heading('observations', 'What we observed about the platform')}
      <div class="split"><article class="card"><h3>What worked well</h3><ul class="bullet-list">${p.good.map((text) => `<li>${esc(text)}</li>`).join('')}</ul></article><article class="card"><h3>Friction & limitations</h3><ul class="bullet-list">${p.friction.map((text) => `<li>${esc(text)}</li>`).join('')}</ul></article></div>
      <article class="platform-learning"><span class="eyebrow">Takeaway for Architect</span><p>${esc(p.lesson)}</p></article>

    </section>`;
}
function selectPlatformTab(key, tab, focus = true) {
  history.pushState(null, '', `#platform/${key}/${tab}`);
  render();
  if (focus) document.getElementById(`platform-tab-${tab}`)?.focus({ preventScroll: true });
}
function overlapComparison() {
  const capabilities = [
    ['Prompt & iteration', 'Intent and follow-up changes'],
    ['Planning & context', 'Briefs, files and project knowledge'],
    ['Preview & inspection', 'See the result and investigate'],
    ['Code & history', 'Inspect or recover changes'],
    ['Connections', 'Repositories, tools and services'],
    ['Sharing & release', 'Hand off or publish the work'],
  ];
  const overlap = {
    architect: [
      'Prompt, attachments and chat revisions',
      'Editable PRD, mockups and prompt library',
      'App preview, reload and console',
      'File tree, commits, revert and code download',
      'GitHub setup; Studio tools and data connectors',
      'Deploy, domains and marketplace setup',
    ],
    replit: [
      'Agent composer and follow-up prompts',
      'Planning control, attachments and design systems',
      'Embedded preview, device presets and logs',
      'Files, shell, checkpoints and Git history',
      'Repository imports, integration catalog and MCP',
      'Publishing, domains and collaborator invites',
    ],
    lovable: [
      'Build, Chat and Plan modes',
      'Attachments, design directions and project context',
      'Preview, device modes and visual editing',
      'Code tree, history, bookmarks and revert',
      'Source sync, cloud services and custom MCP',
      'Publish, share, remix and domain controls',
    ],
    emergent: [
      'App prompts, questions and revisions',
      'File upload, templates and MCP context',
      'Preview, device modes and visual editing',
      'Build tool trace; version recovery not recorded',
      'GitHub import, MCP and service connectors',
      'Publishing controls; team sharing not recorded',
    ],
    v0: [
      'Prompt composer and iterative chat',
      'Attachments, templates and design systems',
      'Embedded and standalone preview',
      'File trace and ZIP download; recovery not recorded',
      'Vercel handoff; service integrations in its dashboard',
      'Invites, visibility and Vercel publish setup',
    ],
    rocket: [
      'Build prompts and suggested next steps',
      'Context inputs, template matching and Solve mode',
      'Preview, fullscreen and edit controls',
      'Versions, diffs, rollback and labels',
      'GitHub, Figma and business-tool connectors',
      'Staging, production and domain controls',
    ],
    bolt: [
      'Chat prompts and follow-up changes',
      'Plan mode, attachments, context and skills',
      'Preview, visual selection and terminal output',
      'Code editor, versions, bookmarks and revert',
      'GitHub, MCP and backend/Supabase options',
      'Email sharing, link permissions and publish',
    ],
    codex: [
      'Repository task prompt and continued revisions',
      'Environment and project instructions',
      'Diffs and logs; app preview recovered locally',
      'File diffs, test summaries and patch export',
      'GitHub, GitLab beta, Slack and Linear entries',
      'PR/draft PR controls; app hosting not recorded',
    ],
    cursor: [
      'Agent composer and iterative code changes',
      'Workspace context, rules, skills and subagents',
      'Built-in browser, design mode and console',
      'Editor, changes, Git controls and worktrees',
      'Plugins, MCP and repository review providers',
      'Branch/commit/review controls; hosting not recorded',
    ],
    claude: [
      'Docs: coding prompts and continued sessions',
      'Docs: project instructions, memory and skills',
      'Docs: session outputs and diffs; execution gated',
      'Docs: file edits, commands and Git/PR workflows',
      'Docs: MCP, repositories and development tools',
      'Docs: pull requests and local handoff',
    ],
    claude_chat: [
      'Conversation and artifact follow-up prompts',
      'Attachments, project context and skills',
      'Inline and expanded artifact preview',
      'Artifact download/duplicate; repository Git not recorded',
      'Connector catalog, custom MCP and plugins',
      'Conversation/artifact sharing and export',
    ],
  };
  return `<section class="overlap-comparison" aria-labelledby="overlap-title">
    ${heading('overlap', '<span id="overlap-title">Where the platforms overlap</span>', 'The same user needs, implemented differently')}
    <p class="overlap-intro">Read down a column to compare how each platform handles the same capability. These are recorded surfaces; availability does not mean every action was executed. “Docs” means documentation only, and “not recorded” means our research did not establish it.</p>
    <div class="table-wrap overlap-table-wrap" role="region" aria-label="Shared capabilities across explored platforms" tabindex="0">
      <table class="overlap-table"><caption class="sr-only">Platform-wise overlap in prompting, planning, preview, code, connections and release</caption>
        <thead><tr><th scope="col">Platform</th>${capabilities.map(([name, description]) => `<th scope="col">${name}<span class="overlap-column-note">${description}</span></th>`).join('')}</tr></thead>
        <tbody>${visiblePlatforms()
          .map(
            (p) =>
              `<tr><th scope="row"><a class="comparison-platform" href="#platform/${p.key}">${platformLogo(p)}<span>${esc(platformIdentity[p.key].name)}</span></a></th>${overlap[p.key].map((text) => `<td>${esc(text)}</td>`).join('')}</tr>`,
          )
          .join('')}</tbody>
      </table>
    </div>
  </section>`;
}
function comparison() {
  const featureHighlights = {
    architect: [
      'Editable PRD, mockups and app preview',
      'Agent configuration, knowledge and tools in Lyzr Studio',
      'Visual multi-agent workflows and deployment setup',
    ],
    replit: [
      'Project imports and browser development environment',
      'Agent planning, checkpoints, files and shell',
      'Database, authentication and hosting controls',
    ],
    lovable: [
      'Design directions and visual selection/editing',
      'Cloud database, authentication and storage',
      'Source sync, publishing and security scans',
    ],
    emergent: [
      'Web/mobile inputs and model selection',
      'Build/test activity, preview and visual edits',
      'MCP context, service connectors and publishing',
    ],
    v0: [
      'UI generation, templates and design systems',
      'Model choice, task checklist and file trace',
      'Project sharing and Vercel publishing handoff',
    ],
    rocket: [
      'Build, Solve and Intelligence modes',
      'Version diffs, labels and rollback',
      'Separate staging and production controls',
    ],
    bolt: [
      'Visual editing, code editor and terminal',
      'Database, authentication and server functions',
      'MCP, skills, version history and publishing',
    ],
    codex: [
      'Repository-based delegated coding tasks',
      'Configurable execution environments',
      'Diffs, test summaries and pull-request review',
    ],
    cursor: [
      'Local IDE, agent composer and execution approvals',
      'Source review, terminal and built-in browser',
      'Rules, skills, subagents, MCP and worktrees',
    ],
    claude: [
      'Repository reading, editing and command execution',
      'Project instructions, skills, hooks and subagents',
      'MCP, diffs and PR workflows — documented; execution gated',
    ],
    claude_chat: [
      'Conversational generation and artifact preview',
      'Projects, attachments, skills and connectors',
      'Artifact editing, export and sharing',
    ],
  };
  return `${pageHead('01 / Explore / Comparison', 'Compare the platforms.', 'Positioning, differentiation and shared capabilities, side by side.')}
    <section class="platform-positioning" aria-labelledby="positioning-title">
      ${heading('positioning', '<span id="positioning-title">Platform positioning</span>', 'Who it serves and the value it promises')}
      <div class="table-wrap positioning-table-wrap" role="region" aria-label="Platform positioning comparison" tabindex="0">
        <table class="positioning-table"><caption class="sr-only">Platform positioning, target audiences and reasons to choose each platform</caption>
          <thead><tr><th scope="col">Platform</th><th scope="col">Positioning</th><th scope="col">Target users</th><th scope="col">Why people choose it</th></tr></thead>
          <tbody>${visiblePlatforms()
            .map((p) => {
              const m = D.market.platforms.find((item) => item.key === p.key);
              return `<tr><th scope="row"><a class="comparison-platform" href="#platform/${p.key}">${platformLogo(p)}<span>${esc(platformIdentity[p.key].name)}</span></a></th><td>${esc(m.positioning)}<details class="comparison-sources"><summary>Sources</summary>${sourceLinks(m.positioning_sources)}</details></td><td>${esc(m.audience)}</td><td>${esc(m.why_people_use_it)}</td></tr>`;
            })
            .join('')}</tbody>
        </table>
      </div>
      <p class="screenshot-note">Positioning summarizes saved vendor sources; reasons to choose each platform are research interpretations, not a user satisfaction survey.</p>
    </section>
    <section aria-labelledby="platform-comparison-title" class="platform-comparison">
      ${heading('market-map', '<span id="platform-comparison-title">Platform differentiation</span>', 'Research recorded 26 September 2026')}
      <div class="table-wrap comparison-table-wrap" role="region" aria-label="Platform differentiation, features, target users and reported user numbers" tabindex="0">
        <table class="comparison-table"><caption class="sr-only">Platform-by-platform comparison based on saved exploration and attributed market research</caption>
          <thead><tr><th scope="col">Platform</th><th scope="col">Key features</th><th scope="col">What makes it different</th><th scope="col">Target users</th><th scope="col">Reported users</th></tr></thead>
          <tbody>${visiblePlatforms()
            .map((p) => {
              const m = D.market.platforms.find((item) => item.key === p.key);
              return `<tr><th scope="row"><a class="comparison-platform" href="#platform/${p.key}">${platformLogo(p)}<span>${esc(platformIdentity[p.key].name)}</span></a><span class="comparison-record-count">${p.features.length} feature groups explored</span></th>
              <td><ul class="comparison-feature-list">${featureHighlights[p.key].map((f) => `<li>${esc(f)}</li>`).join('')}</ul></td>
              <td>${esc(m.differentiation_synthesis)}<details class="comparison-sources"><summary>Positioning sources</summary>${sourceLinks(m.positioning_sources)}</details></td>
              <td>${esc(m.audience)}</td>
              <td><strong class="adoption-value">${esc(m.reported_user_metric)}</strong><span class="adoption-date">${esc(m.metric_date || 'Undated claim; recorded 26 Sep 2026')}</span><p>${esc(m.metric_type)}</p><details class="comparison-sources"><summary>Context & source</summary><p>${esc(m.metric_caveat)}</p>${sourceLinks(m.metric_sources)}</details></td></tr>`;
            })
            .join('')}</tbody>
        </table>
      </div>
      <p class="screenshot-note">User figures are historical reported claims, not a live ranking. Registered, cumulative, daily and weekly users are different measures; undisclosed totals are left unspecified. Feature highlights combine exploration and documentation; each platform page records what was exercised.</p>
    </section>${overlapComparison()}`;
}
function researchBoundaries() {
  return `<section class="research-boundaries" aria-labelledby="research-boundaries-title">${heading('research-boundaries', '<span id="research-boundaries-title">Research boundaries</span>', 'What affected the exploration')}
    <div class="grid">
      <article class="card"><h3>Claude Code access</h3><p>The free account reached an upgrade gate. Claude Chat / Artifacts was explored separately; it is not a Claude Code result.</p></article>
      <article class="card"><h3>Credits & follow-ups</h3><p>Lovable, Emergent and v0 reached usage limits. Available features and earlier outputs were explored, but some follow-up revisions could not be completed.</p></article>
      <article class="card"><h3>Environment & recovery</h3><p>Cursor was explored through the desktop app after the cloud route was gated. Codex generated repository changes; its app preview needed local recovery.</p></article>
    </div>
    <p class="screenshot-note">Each platform page records the actions exercised and the outcomes observed. Paid-only features and untested integrations are identified in its feature inventory.</p>
  </section>`;
}
function versionCards() {
  return Object.entries(edition)
    .map(
      ([v, e]) =>
        `<a class="card link version-card" href="#build/${v}"><span class="tiny">${e.label.toUpperCase()}</span><div class="edition">${v}</div><h3>${e.title}</h3><p>${e.why}</p><div class="card-footer"><span>${D.features.filter((f) => f.primary_introduction === v).length} packages first introduced</span><span>↗</span></div></a>`,
    )
    .join('');
}
function scopePage() {
  const [, requestedView, requestedCategory] = location.hash.slice(1).split('/');
  const view = ['features', 'journeys'].includes(requestedView) ? requestedView : 'products';
  const category = ['inherited', 'enhanced', 'new'].includes(requestedCategory)
    ? requestedCategory
    : 'inherited';
  const inherited = category === 'inherited';
  const labels = {
    inherited: 'Inherited from Lyzr’s architect.new',
    enhanced: 'Enhanced',
    new: 'New',
  };
  const byId = new Map(D.features.map((f) => [f.feature_id, f]));
  const rows = inherited
    ? D.baseline
    : D.features.filter((f) => f.classification === (category === 'enhanced' ? 'Enhance' : 'New'));
  const groups = D.products
    .map((p) => ({
      ...p,
      rows: rows.filter(
        (f) =>
          (inherited ? byId.get(f.parent_feature)?.product_key : f.product_key) === p.product_key,
      ),
    }))
    .filter((p) => p.rows.length);
  const scopeTabs = (items, selected, level) =>
    `<div class="${level === 'view' ? 'platform-tabs scope-main-tabs' : 'scope-category-tabs'}" role="tablist" aria-label="${level === 'view' ? 'Scope type' : 'Scope classification'}">${items.map(([id, name]) => `<button role="tab" id="scope-${level}-${id}" aria-selected="${selected === id}" aria-controls="${level === 'view' ? 'scope-view-panel' : 'scope-category-panel'}" tabindex="${selected === id ? 0 : -1}" data-scope-route="${level === 'view' ? id + '/' + category : view + '/' + id}" aria-label="${esc(name)}">${level === 'view' ? name : `<span class="scope-category-name">${id === 'inherited' ? 'Inherited' : name}</span><span class="scope-category-caption">${{ inherited: 'Lyzr’s architect.new', enhanced: 'Existing, improved', new: 'Proposed capabilities' }[id]}</span>`}</button>`).join('')}</div>`;
  const productTable = `<div class="table-wrap scope-table-wrap" role="region" aria-label="${esc(labels[category])} product scope" tabindex="0"><table class="scope-table"><thead><tr><th scope="col">Product</th><th scope="col">${inherited ? 'Inherited coverage' : category === 'enhanced' ? 'What we enhance' : 'New capabilities'}</th><th scope="col">${inherited ? 'Interactions' : 'Feature packages'}</th><th scope="col">${inherited ? 'Mapped into' : 'First introduced'}</th></tr></thead><tbody>${groups
    .map((g) => {
      const packages = inherited
        ? [...new Set(g.rows.map((r) => r.parent_feature))].map((id) => byId.get(id))
        : g.rows;
      const names = inherited
        ? [...new Set(g.rows.map((r) => r.original_interaction))]
        : g.rows.map((r) => r.feature);
      const versions = [...new Set(packages.map((f) => f.primary_introduction))].sort();
      return `<tr><th scope="row"><button class="scope-product-link" data-scope-product="${g.product_key}" data-scope-category="${category}">${esc(g.product)}<span>View feature scope →</span></button></th><td><ul class="scope-feature-names">${names.map((name) => `<li>${esc(name)}</li>`).join('')}</ul></td><td><span class="scope-number">${g.rows.length}</span></td><td>${versions.map((v) => `<span class="pill">${v}</span>`).join(' ')}</td></tr>`;
    })
    .join('')}</tbody></table></div>`;
  const featureTables = groups
    .map(
      (g) =>
        `<section class="scope-product-group" id="scope-product-${g.product_key}"><div class="feature-table-heading"><h2>${esc(g.product)}</h2><span class="feature-count">${g.rows.length} ${inherited ? 'interactions' : 'packages'}</span></div><div class="table-wrap scope-table-wrap" role="region" aria-label="${esc(g.product)} ${esc(labels[category])} features" tabindex="0"><table class="scope-table"><thead><tr><th scope="col">Feature</th><th scope="col">${inherited ? 'Original interaction' : 'Defined scope'}</th><th scope="col">${inherited ? 'Recorded evidence' : 'First version'}</th><th scope="col">${inherited ? 'Planned treatment' : 'User journey'}</th></tr></thead><tbody>${g.rows.map((f) => (inherited ? `<tr><th scope="row"><span class="scope-id">${esc(f.baseline_id)}</span>${esc(f.feature)}</th><td>${esc(f.original_interaction)}</td><td>${esc(f.evidence_status)}</td><td><span class="pill">${esc(f.treatment)}</span><span class="scope-parent">${esc(byId.get(f.parent_feature).feature)}</span></td></tr>` : `<tr><th scope="row"><span class="scope-id">${esc(f.feature_id)}</span>${esc(f.feature)}</th><td>${esc(f.source_scope)}</td><td><span class="pill">${esc(f.primary_introduction)}</span></td><td><button class="scope-flow-link" data-feature="${esc(f.feature_id)}">View flow →</button></td></tr>`)).join('')}</tbody></table></div></section>`,
    )
    .join('');
  return `${pageHead('02 / Build / Product Scope', 'Product Scope', 'The existing foundation, the improvements we designed, and the capabilities we propose—organized by product.')}
    ${scopeTabs(
      [
        ['products', 'Product Scope'],
        ['features', 'Feature Scope'],
        ['journeys', 'User Journey'],
      ],
      view,
      'view',
    )}
    <section role="tabpanel" id="scope-view-panel" aria-labelledby="scope-view-${view}">
      ${scopeTabs(Object.entries(labels), category, 'category')}
      <section role="tabpanel" id="scope-category-panel" aria-labelledby="scope-category-${category}">
        <div class="scope-summary"><div><span class="eyebrow">${esc(labels[category])}</span><h2>${view === 'products' ? 'The product map' : view === 'journeys' ? 'Journeys, product by product' : 'Features, product by product'}</h2></div><div class="scope-totals"><span><strong>${groups.length}</strong> product areas</span><span><strong>${rows.length}</strong> ${inherited ? 'inherited interactions' : 'feature packages'}</span></div></div>
        <p class="scope-context">${inherited ? 'The recorded Architect and connected Lyzr Studio foundation. Each interaction keeps its evidence and planned treatment.' : category === 'enhanced' ? 'Existing capabilities expanded for our platform, using the documented enhancement packages.' : 'Proposed capabilities across both existing product areas and new workspaces.'} Product areas can appear in multiple categories. Inherited interactions and feature packages are counted separately.</p>
        ${view === 'products' ? productTable : view === 'journeys' ? scopeJourneys(groups, inherited, byId) : featureTables}
      </section>
    </section>`;
}
function scopeJourneys(groups, inherited, byId) {
  return `${inherited ? '<p class="scope-context">Inherited interactions are grouped under their mapped planned journey. These flows describe our proposed platform; the inherited evidence remains listed separately below each journey.</p>' : ''}${groups
    .map((g) => {
      const features = inherited
        ? [...new Set(g.rows.map((r) => r.parent_feature))].map((id) => byId.get(id))
        : g.rows;
      return `<section class="scope-product-group scope-journey-product" id="scope-journeys-${g.product_key}"><div class="feature-table-heading"><h2>${esc(g.product)}</h2><span class="feature-count">${features.length} ${inherited ? 'mapped journeys' : 'journeys'}</span></div>${features
        .map((f) => {
          const j = f.journey;
          const inheritedRows = inherited
            ? g.rows.filter((r) => r.parent_feature === f.feature_id)
            : [];
          const handoffs = D.handoffs.filter((h) => h.from_feature === f.feature_id);
          return `<article class="scope-journey" id="scope-journey-${f.feature_id}" data-journey-id="${f.feature_id}">
        <header class="scope-journey-header"><div><span class="scope-id">${esc(f.feature_id)}${inherited ? ' · Mapped planned journey' : ''}</span><h3>${esc(f.feature)}</h3></div><span class="pill">First in ${esc(f.primary_introduction)}</span></header>
        <p class="scope-journey-actors"><strong>Who</strong> ${esc(j.actors)}</p>
        <div class="scope-journey-entry"><div><span>Sign in & arrival</span><p>${esc(j.signup_entry)}</p></div><div><span>Start here</span><p>${esc(j.entry)}</p></div></div>
        <div class="scope-journey-path" role="region" aria-label="${esc(f.feature)} steps" tabindex="0"><ol>${j.primary_flow
          .split('→')
          .map(
            (step, i) =>
              `<li><span class="scope-step-number">${String(i + 1).padStart(2, '0')}</span><p>${esc(step.trim())}</p></li>`,
          )
          .join('')}</ol></div>
        <div class="scope-journey-options"><span>Options & decisions</span><p>${esc(j.current_scope)}</p></div>
        <div class="scope-journey-result"><div><span>Final outcome</span><p>${esc(j.outcome)}</p></div><div><span>If something goes wrong</span><p>${esc(j.recovery)}</p></div></div>
        ${
          handoffs.length
            ? `<div class="scope-journey-handoffs"><span>Continue to</span>${handoffs
                .map((h) => {
                  const next = byId.get(h.to_feature);
                  return `<button data-feature="${esc(h.to_feature)}" title="${esc(h.carried_context)}">${esc(h.action)} → ${esc(next.product)} · ${esc(next.feature)}</button>`;
                })
                .join('')}</div>`
            : ''
        }
        ${inheritedRows.length ? `<div class="scope-inherited-records"><span>Inherited interactions covered · ${inheritedRows.length}</span><ul>${inheritedRows.map((r) => `<li data-inherited-id="${esc(r.baseline_id)}"><strong>${esc(r.feature)}</strong><small>${esc(r.baseline_id)} · ${esc(r.evidence_status)} · ${esc(r.treatment)}</small></li>`).join('')}</ul></div>` : ''}
      </article>`;
        })
        .join('')}</section>`;
    })
    .join('')}`;
}
function selectScope(route, focusId) {
  history.pushState(null, '', '#scope/' + route);
  render();
  if (focusId) document.getElementById(focusId)?.focus({ preventScroll: true });
}
function build() {
  return `${pageHead('02 / Build', 'One foundation.<br>Three ways forward.', 'A deliberate progression from building an application, to connecting a company’s work, to operating the platform within its own infrastructure. Three different frontends share the project, identity and data foundation.')}<div class="grid">${versionCards()}</div>${callout('Custom domains verified.', 'The custom-domain editions loaded and Google sign-in completed on 27 September 2026. Historical warnings and pending Google reviews for the old Vercel URLs remain documented; these checks are not a clearance of those reviews.')}${callout('Scope is cumulative. Counts are not additive to the baseline.', 'Architect 2.0 introduces 65 packages; 3.0 adds 42, reaching 107; 4.0 adds 2, reaching 109, while extending existing packages for private operation. These packages include 40 enhancements and 69 new proposals. The 422 existing interactions are a different unit and are not added to 109.')}${heading('experience', 'The experience contract.')}<div class="grid"><div class="card"><h3>Progressive depth</h3><p>Begin with intent, import or a role-specific task. Reveal source, infrastructure and policy when relevant. Keep simple and advanced views attached to the same project.</p></div><div class="card"><h3>Context travels</h3><p>Carry project, object, permissions, selection and drafts into linked products. Inspect in a drawer; open a workspace for sustained work. Return to the same place.</p></div><div class="card"><h3>Clear capability labels</h3><p>Distinguish working functionality, interactive prototypes and future integrations. Never present a simulated test, purchase, deployment or external action as executed.</p></div></div>${heading('design-system', 'A quiet system with character.')}<div class="split"><div class="card"><h3>Atelier / Current / Prism</h3><p>Warm editorial, calm technical, and expressive professional palettes. Each has light and dark modes. Appearance is a personal preference, independent of permissions or job title.</p><div class="actions"><button data-theme-choice="atelier">Atelier</button><button data-theme-choice="current">Current</button><button data-theme-choice="prism">Prism</button></div></div><div class="card"><h3>Craft in the transitions</h3><p>Visible prompts before the first build. Helpful empty states. Reviewable changes. Saved checkpoints. A persistent project switcher. Profile, logout, limits and settings where people expect them.</p></div></div><div class="actions"><a class="button primary" href="#features">Explore all 109 feature journeys →</a></div>`;
}
function version(v) {
  const e = edition[v];
  if (!e) return notfound();
  const requested = location.hash.split('/')[2];
  const active = ['scope', 'journey', 'prototype'].includes(requested) ? requested : 'scope';
  const fs = D.features.filter((f) => +f.primary_introduction <= +v);
  const groups = D.products
    .map((p) => ({ ...p, rows: fs.filter((f) => f.product_key === p.product_key) }))
    .filter((p) => p.rows.length);
  const conf = C.versions[v];
  const tabs = [
    ['scope', 'Product Scope'],
    ['journey', 'User Journey'],
    ['prototype', 'Prototype Experience'],
  ];
  const scopedGroups = groups.map((g) => ({
    ...g,
    rows: g.rows.map((f) => ({
      ...f,
      journey: { ...f.journey, current_scope: f['scope_' + v.replace('.', '_')] },
    })),
  }));
  const content =
    active === 'scope'
      ? groups
          .map(
            (g) =>
              `<section class="scope-product-group" id="edition-product-${g.product_key}"><div class="feature-table-heading"><h2>${esc(g.product)}</h2></div><div class="table-wrap" role="region" aria-label="${esc(g.product)} scope in Architect ${v}" tabindex="0"><table class="edition-scope-table"><thead><tr><th scope="col">Feature</th><th scope="col">Classification</th><th scope="col">Scope in ${v}</th></tr></thead><tbody>${g.rows.map((f) => `<tr data-edition-feature="${f.feature_id}"><th scope="row"><span class="scope-id">${esc(f.feature_id)}</span>${esc(f.feature)}</th><td><span class="pill">${f.classification === 'Enhance' ? 'Enhanced' : 'New'}</span>${f.primary_introduction !== v ? `<small class="scope-parent">Carried forward from ${esc(f.primary_introduction)}</small>` : ''}</td><td>${esc(f['scope_' + v.replace('.', '_')])}</td></tr>`).join('')}</tbody></table></div></section>`,
          )
          .join('')
      : active === 'journey'
        ? scopeJourneys(scopedGroups, false, new Map(D.features.map((f) => [f.feature_id, f])))
        : editionPrototype(v, fs);
  return `${pageHead('02 / Build', 'Architect ' + v, e.intro)}
    <div class="actions edition-actions">${conf.liveUrl ? `<a class="button primary" target="_blank" rel="noopener noreferrer" href="${esc(safeUrl(conf.liveUrl))}">Explore Architect ${v} ↗</a>` : ''}${conf.repoUrl ? `<a class="button" target="_blank" rel="noopener noreferrer" href="${esc(safeUrl(conf.repoUrl))}">GitHub ↗</a>` : ''}</div>
    <div class="platform-tabs edition-tabs" role="tablist" aria-label="Architect ${v} sections">${tabs.map(([id, label]) => `<button role="tab" id="edition-tab-${id}" aria-selected="${active === id}" aria-controls="edition-panel" tabindex="${active === id ? 0 : -1}" data-version="${v}" data-version-tab="${id}">${label}</button>`).join('')}</div>
    <section role="tabpanel" id="edition-panel" aria-labelledby="edition-tab-${active}">${content}</section>`;
}
function editionPrototype(v, fs) {
  const capturedIds = new Set(C.versions[v].screenshots.flatMap((s) => s.featureIds || []));
  return `<div class="edition-evidence-heading"><h2>Prototype Experience</h2><label>View screens<select id="edition-evidence-select" aria-label="View screens" data-version="${v}"><option value="overview">Overview screens</option>${fs
    .filter((f) => capturedIds.has(f.feature_id))
    .map((f) => `<option value="${f.feature_id}">${esc(f.product)} · ${esc(f.feature)}</option>`)
    .join(
      '',
    )}</select></label></div><div id="edition-evidence-gallery">${editionEvidenceGallery(v)}</div>`;
}
function editionEvidenceGallery(v, feature = 'overview') {
  const screenshots = C.versions[v].screenshots
    .map((s, i) => ({ ...s, id: `version-${v}-${i}`, platform: 'Architect ' + v }))
    .filter((s) =>
      feature === 'overview' ? s.showInGallery !== false : (s.featureIds || []).includes(feature),
    );
  return `<div class="grid two">${screenshots.map(shot).join('')}</div>`;
}
function selectEditionTab(v, tab) {
  history.pushState(null, '', `#build/${v}/${tab}`);
  render();
  document.getElementById('edition-tab-' + tab)?.focus({ preventScroll: true });
}
function toolbar() {
  return `<div class="feature-toolbar"><input id="feature-search" type="search" placeholder="Search features, roles, flows…" aria-label="Search feature atlas" value="${esc(filter.query)}"><select id="product-filter" aria-label="Filter by product"><option value="all">All products</option>${D.products.map((p) => `<option value="${p.product_key}" ${filter.product === p.product_key ? 'selected' : ''}>${esc(p.product)}</option>`).join('')}</select><select id="kind-filter" aria-label="Filter by classification"><option value="all">All classifications</option><option value="Enhance" ${filter.kind === 'Enhance' ? 'selected' : ''}>Existing, enhanced</option><option value="New" ${filter.kind === 'New' ? 'selected' : ''}>New proposals</option></select></div>`;
}
function features() {
  return `${pageHead('02 / Build / Feature atlas', 'Every feature has a journey.', 'Browse 109 proposed packages across 16 product areas. Open any record to trace signup, entry, decisions, outcome, recovery and the next contextual handoff.')}<div class="tabs" aria-label="Feature version"><button data-scope="all" class="${filter.scope === 'all' ? 'active' : ''}" aria-label="All 109 packages"><span class="scope-category-name">All versions</span><span class="scope-category-caption">109 packages</span></button>${Object.keys(
    edition,
  )
    .map(
      (v) =>
        `<button data-scope="${v}" class="${filter.scope === v ? 'active' : ''}" aria-label="First in ${v}"><span class="scope-category-name">Architect ${v}</span><span class="scope-category-caption">First introduced</span></button>`,
    )
    .join('')}</div>${toolbar()}<div id="feature-results"></div>`;
}
function featureResults(v) {
  let fs = D.features.filter(
    (f) =>
      (!v || +f.primary_introduction <= +v) &&
      (v || filter.scope === 'all' || f.primary_introduction === filter.scope) &&
      (filter.product === 'all' || f.product_key === filter.product) &&
      (filter.kind === 'all' || f.classification === filter.kind) &&
      JSON.stringify(f).toLowerCase().includes(filter.query.toLowerCase()),
  );
  $('#feature-results').innerHTML =
    `<p class="tiny" role="status">${fs.length} matching packages · Counts describe the specification, not completed integrations.</p><div class="feature-list">${fs.map((f) => `<button class="feature-row" data-feature="${f.feature_id}"><span class="id">${f.feature_id}</span><span><strong>${esc(f.feature)}</strong><p>${esc(f.product)} · ${esc(f.journey.actors)}</p><p>${esc(v ? f['scope_' + v.replace('.', '_')] : f.journey.outcome)}</p></span><span class="arrow"><span class="pill ${f.classification === 'Enhance' ? 'green' : ''}">${esc(f.classification)} · ${f.primary_introduction}</span> ↗</span></button>`).join('') || '<div class="empty">No matching features. Try a broader search or another product.</div>'}</div>`;
}
function featureEvidence(id) {
  const screenshots = Object.entries(C.versions).flatMap(([v, c]) =>
    (c.screenshots || [])
      .filter((s) => (s.featureIds || []).includes(id))
      .map((s) => ({ ...s, version: v })),
  );
  return screenshots.length
    ? screenshots
        .map(
          (s) =>
            `<div class="handoff"><img src="${esc(s.image)}" alt="${esc(s.label)}" loading="lazy"><p>Architect ${esc(s.version)} · ${esc(s.label)}. Representative screen evidence; does not verify every backend behavior in this package.</p></div>`,
        )
        .join('')
    : '<p>No feature-specific screenshot has been linked yet. The flow above is a specification record, not a screenshot-backed implementation claim.</p>';
}
function featureDetail(id) {
  const f = D.features.find((x) => x.feature_id === id);
  if (!f) return;
  const j = f.journey;
  const hs = D.handoffs.filter((h) => h.from_feature === id);
  $('#dialog-label').textContent = f.feature_id + ' / ' + f.product;
  $('#dialog-body').innerHTML =
    `<span class="pill green">${esc(f.classification)} · First introduced in ${f.primary_introduction}</span><h2>${esc(f.feature)}</h2><p>${esc(j.actors)}</p><h3>Signup → exact destination</h3><p>${esc(j.signup_entry)}</p><h3>Entry point</h3><p>${esc(j.entry)}</p><h3>The primary journey</h3>${j.primary_flow
      .split('→')
      .map((s, i) => `<div class="flow-node"><b>${i + 1}.</b> ${esc(s.trim())}</div>`)
      .join(
        '',
      )}<h3>Scope, options & decisions</h3><p>${esc(j.current_scope)}</p><h3>Version boundaries</h3>${Object.keys(
      edition,
    )
      .map(
        (v) =>
          `<div class="handoff"><strong>Architect ${v}</strong><p>${esc(f['scope_' + v.replace('.', '_')])}</p></div>`,
      )
      .join(
        '',
      )}<h3>Related prototype evidence</h3>${featureEvidence(f.feature_id)}<h3>Final outcome</h3><p>${esc(j.outcome)}</p><h3>If something goes wrong</h3><p>${esc(j.recovery)}</p><h3>Continue without losing context</h3>${hs.map((h) => `<div class="handoff"><a href="#feature/${h.to_feature}">${esc(h.action)} → ${esc(D.features.find((x) => x.feature_id === h.to_feature)?.feature || h.to_feature)}</a><p><b>Carry:</b> ${esc(h.carried_context)}</p><p><b>Resolve:</b> ${esc(h.destination_resolution)}</p><p><b>Return:</b> ${esc(h.return_path)}</p><p><b>Recover:</b> ${esc(h.failure)}</p></div>`).join('') || '<p>Continue within the current product while preserving project and draft context.</p>'}<p class="tiny">${esc(j.status)} Flow references: ${esc(j.detailed_flow_ids)}.</p>`;
  if (!$('#detail').open) $('#detail').showModal();
}
function baseline() {
  return `${pageHead('02 / Build / Existing foundation', 'Preserve the small things.', 'The existing Architect inventory maps 422 interactions and microfeatures into the new product scope. These are baseline interaction records, not 422 independently shipped feature packages.')} ${callout('Traceability, not an implementation certificate.', 'The inventory combines hands-on observations and documented surfaces. Mapping an existing interaction to a proposed package does not prove the new UI or integration has been implemented or tested.')}<div class="feature-toolbar"><input id="baseline-search" type="search" placeholder="Search the existing foundation…" aria-label="Search existing interactions"></div><div id="baseline-results"></div>`;
}
function baselineResults(q = '') {
  const rows = D.baseline.filter((x) => JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));
  $('#baseline-results').innerHTML =
    `<p class="tiny" role="status">${rows.length} baseline interaction records</p><div class="feature-list">${rows.map((r) => `<details><summary>${esc(r.baseline_id)} · ${esc(r.feature)}</summary><p class="screenshot-note">${esc(r.original_interaction)}</p><p class="screenshot-note"><b>Evidence:</b> ${esc(r.evidence_status)}<br><b>Treatment:</b> ${esc(r.treatment)}<br><b>Mapping:</b> <a class="source" href="#feature/${r.parent_feature}">${esc(r.parent_feature)}</a><br><b>Microflow:</b> ${esc(r.original_microflow_preserved)}<br><b>Status:</b> ${esc(r.verification_status)}</p></details>`).join('')}</div>`;
}
function notfound() {
  return (
    pageHead(
      'Page not found',
      'A small detour.',
      'This destination is not in the case study. Return to Explore or the feature atlas.',
    ) + '<a class="button" href="#explore">Back to Explore →</a>'
  );
}
let pageJumpSections = [];
let sectionRailFrame;
function setupPageJump() {
  document.querySelector('.section-rail')?.remove();
  pageJumpSections = [];
  if (document.body.classList.contains('landing')) return;
  const headings = [...document.querySelectorAll('#content h2, #content h3')].filter(
    (el) => !el.closest('[hidden], details, .horizontal-journey, .screenshot, .scope-journey'),
  );
  if (!headings.length) return;
  pageJumpSections = headings.map((el, i) => {
    if (!el.id) el.id = `page-section-${i}`;
    el.classList.add('jump-destination');
    el.tabIndex = -1;
    return {
      el,
      title: el.textContent
        .trim()
        .replace(/^\d{2}(?=\D)/, '')
        .trim(),
    };
  });
  document.body.insertAdjacentHTML(
    'beforeend',
    `<nav class="section-rail" aria-label="Page sections"><span class="section-rail-heading">On this page</span><div class="section-rail-items">${pageJumpSections.map((section, i) => `<button data-jump-index="${i}" aria-label="Go to ${esc(section.title)}"><span class="section-rail-label">${esc(section.title)}</span><span class="section-rail-mark" aria-hidden="true"></span></button>`).join('')}</div></nav>`,
  );
  updateSectionRail();
}
function updateSectionRail() {
  sectionRailFrame = null;
  let current = 0;
  pageJumpSections.forEach((section, i) => {
    if (section.el.getBoundingClientRect().top <= innerHeight * 0.3) current = i;
  });
  document.querySelectorAll('.section-rail [data-jump-index]').forEach((item, i) => {
    if (i === current) item.setAttribute('aria-current', 'location');
    else item.removeAttribute('aria-current');
  });
}
function scheduleSectionRail() {
  if (!sectionRailFrame) sectionRailFrame = requestAnimationFrame(updateSectionRail);
}
window.addEventListener('scroll', scheduleSectionRail, { passive: true });
window.addEventListener('resize', scheduleSectionRail);
document.addEventListener('click', (event) => {
  const item = event.target.closest('.section-rail [data-jump-index]');
  if (!item) return;
  const target = pageJumpSections[Number(item.dataset.jumpIndex)]?.el;
  target?.focus({ preventScroll: true });
  target?.scrollIntoView({
    behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'start',
  });
});
document.addEventListener('keydown', (event) => {
  const rail = event.target.closest('.section-rail');
  if (!rail || !['ArrowDown', 'ArrowUp', 'Home', 'End', 'Escape'].includes(event.key)) return;
  event.preventDefault();
  if (event.key === 'Escape') {
    $('#content').focus({ preventScroll: true });
    return;
  }
  const buttons = [...rail.querySelectorAll('[data-jump-index]')];
  const current = buttons.indexOf(document.activeElement);
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? buttons.length - 1
        : (current + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
  buttons[next].focus();
});
function visiblePlatforms() {
  return D.platforms.filter((platform) => platform.key !== 'claude');
}
function render() {
  if (location.hash === '#baseline') history.replaceState(null, '', '#scope/features/inherited');
  if (/^#platform\/claude(?:\/|$)/.test(location.hash)) {
    history.replaceState(
      null,
      '',
      location.hash.replace('#platform/claude', '#platform/claude_chat'),
    );
  }

  if (location.hash === '#blockers') {
    history.replaceState(null, '', '#explore');
    render();
    document.getElementById('research-boundaries')?.scrollIntoView();
    return;
  }
  const route = location.hash.slice(1) || 'home';
  document.body.classList.toggle('landing', route === 'home');
  if (route.startsWith('feature/')) {
    nav();
    $('#breadcrumb').textContent = 'Build / Feature atlas';
    if (!$('#content').innerHTML || $('#content .loading')) {
      $('#content').innerHTML = features();
      featureResults();
    }
    featureDetail(route.split('/')[1]);
    return;
  }
  if ($('#detail').open) $('#detail').close();
  nav();
  document.body.classList.remove('menu-open');
  $('#menu').setAttribute('aria-expanded', 'false');
  const [part, key] = route.split('/');
  $('#breadcrumb').textContent =
    part === 'scope'
      ? 'Build / Product Scope'
      : part === 'deploy'
        ? 'Deploy / Live platforms'
        : part === 'platform'
          ? 'Explore / ' + (D.platforms.find((p) => p.key === key)?.name || key)
          : part === 'build'
            ? 'Build / ' + (key ? 'Architect ' + key : 'Overview')
            : part === 'comparison'
              ? 'Explore / Comparison'
              : part === 'features'
                ? 'Build / Feature atlas'
                : part === 'baseline'
                  ? 'Build / Existing foundation'
                  : 'The product study / Explore';
  $('#content').innerHTML =
    part === 'scope'
      ? scopePage()
      : part === 'home'
        ? introduction()
        : part === 'deploy'
          ? deployments()
          : part === 'platform'
            ? platform(key)
            : part === 'comparison'
              ? comparison()
              : part === 'build'
                ? key
                  ? version(key)
                  : build()
                : part === 'features'
                  ? features()
                  : part === 'baseline'
                    ? baseline()
                    : part === 'explore'
                      ? overview()
                      : notfound();
  if ($('#feature-results')) featureResults(part === 'build' ? key : undefined);
  if ($('#baseline-results')) baselineResults();
  setupPageJump();
  window.scrollTo(0, 0);
  if (part === 'home') {
    $('#breadcrumb').textContent = 'Assignment introduction';
    document.title = 'Darsh Dave · Architect product study';
    return;
  }
  if (part === 'scope') {
    document.title = 'Product Scope · Architect';
    return;
  }
  document.title =
    (key
      ? `Architect ${part === 'build' ? key : D.platforms.find((p) => p.key === key)?.name || key}`
      : 'Architect — ' + part) + ' · Product study';
}
function appearance(theme, mode) {
  const t = ['atelier', 'current', 'prism'].includes(theme) ? theme : 'atelier';
  const m = mode === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = t;
  document.documentElement.dataset.mode = m;
  $('#theme').value = t;
  $('#mode span').textContent = m === 'dark' ? 'Dark' : 'Light';
  $('#mode').setAttribute('aria-label', `Switch to ${m === 'dark' ? 'light' : 'dark'} appearance`);
  try {
    localStorage.setItem('architect-study-appearance', JSON.stringify({ theme: t, mode: m }));
  } catch {}
}
document.addEventListener('click', (e) => {
  const el = e.target.closest('button,a');
  if (!el) return;
  if (el.dataset.versionTab) {
    selectEditionTab(el.dataset.version, el.dataset.versionTab);
    return;
  }
  if (el.dataset.scopeRoute) {
    selectScope(el.dataset.scopeRoute, el.id);
    return;
  }
  if (el.dataset.scopeProduct) {
    selectScope('features/' + el.dataset.scopeCategory);
    const target = document.getElementById('scope-product-' + el.dataset.scopeProduct);
    target?.querySelector('h2')?.focus({ preventScroll: true });
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (el.dataset.platformTab) {
    selectPlatformTab(el.dataset.platformKey, el.dataset.platformTab);
    return;
  }
  if (el.dataset.navSection) {
    const section = el.dataset.navSection;
    if (location.hash !== '#' + section) {
      expandedNavSections.add(section);
      location.hash = section;
    } else {
      if (expandedNavSections.has(section)) expandedNavSections.delete(section);
      else expandedNavSections.add(section);
      nav();
      document.querySelector(`[data-nav-section="${section}"]`)?.focus();
    }
    return;
  }
  if (el.classList.contains('skip')) {
    e.preventDefault();
    $('#content').focus();
    return;
  }
  if (el.dataset.feature) {
    featureDetail(el.dataset.feature);
  }
  if (el.dataset.shot) {
    const s =
      D.screenshots.find((x) => x.id === el.dataset.shot) ||
      Object.entries(C.versions)
        .flatMap(([v, c]) =>
          (c.screenshots || []).map((s, i) => ({ ...s, id: `version-${v}-${i}` })),
        )
        .find((x) => x.id === el.dataset.shot);
    if (s) {
      $('#dialog-label').textContent = 'Visual evidence';
      $('#dialog-body').innerHTML =
        `<img src="${esc(s.image)}" alt="${esc(s.label)}"><p>${esc(s.label)} · Research evidence; screenshot content reflects the captured state.</p>`;
      $('#detail').showModal();
    }
  }
  if (el.dataset.anchor) {
    e.preventDefault();
    let destination = el.getAttribute('href');
    if (destination?.startsWith('#platform/')) {
      const panel = {
        inventory: 'features',
        journey: 'journey',
        evidence: 'journey',
        insights: 'insights',
      }[el.dataset.anchor];
      if (panel) destination = destination.split('/').slice(0, 2).join('/') + '/' + panel;
    }
    if (destination?.startsWith('#') && destination !== location.hash) {
      history.pushState(null, '', destination);
      render();
    }
    document.getElementById(el.dataset.anchor)?.scrollIntoView({ behavior: 'smooth' });
  }
  if (el.dataset.scope) {
    filter.scope = el.dataset.scope;
    render();
  }
  if (el.dataset.themeChoice)
    appearance(el.dataset.themeChoice, document.documentElement.dataset.mode);
});
document.addEventListener('keydown', (event) => {
  const editionTab = event.target.closest('[data-version-tab]');
  if (editionTab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const tabs = ['scope', 'journey', 'prototype'];
    const current = tabs.indexOf(editionTab.dataset.versionTab);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? 2
          : (current + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3;
    selectEditionTab(editionTab.dataset.version, tabs[next]);
    return;
  }
  const scopeTab = event.target.closest('[data-scope-route]');
  if (scopeTab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const tabs = [...scopeTab.parentElement.querySelectorAll('[role="tab"]')];
    const current = tabs.indexOf(scopeTab);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    selectScope(tabs[next].dataset.scopeRoute, tabs[next].id);
    return;
  }
  const tab = event.target.closest('[data-platform-tab]');
  if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const ids = ['features', 'journey', 'insights'];
  const current = ids.indexOf(tab.dataset.platformTab);
  const next =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? 2
        : (current + (event.key === 'ArrowRight' ? 1 : -1) + 3) % 3;
  selectPlatformTab(tab.dataset.platformKey, ids[next]);
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'feature-search') {
    filter.query = e.target.value;
    featureResults(location.hash.startsWith('#build/') ? location.hash.split('/')[1] : undefined);
  }
  if (e.target.id === 'baseline-search') baselineResults(e.target.value);
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'edition-evidence-select') {
    $('#edition-evidence-gallery').innerHTML = editionEvidenceGallery(
      e.target.dataset.version,
      e.target.value,
    );
    return;
  }
  if (e.target.id === 'product-filter' || e.target.id === 'kind-filter') {
    filter[e.target.id === 'product-filter' ? 'product' : 'kind'] = e.target.value;
    featureResults(location.hash.startsWith('#build/') ? location.hash.split('/')[1] : undefined);
  }
});
$('#close-dialog').onclick = () => {
  $('#detail').close();
  if (location.hash.startsWith('#feature/')) location.hash = 'features';
};
$('#detail').addEventListener('cancel', () => {
  if (location.hash.startsWith('#feature/')) location.hash = 'features';
});
$('#detail').addEventListener('click', (e) => {
  if (e.target === $('#detail')) $('#detail').close();
});
$('#menu').onclick = () => {
  const v = document.body.classList.toggle('menu-open');
  $('#menu').setAttribute('aria-expanded', String(v));
};
$('#theme').onchange = (e) => appearance(e.target.value, document.documentElement.dataset.mode);
$('#mode').onclick = () =>
  appearance(
    document.documentElement.dataset.theme,
    document.documentElement.dataset.mode === 'dark' ? 'light' : 'dark',
  );
window.addEventListener('hashchange', render);
try {
  const a = JSON.parse(localStorage.getItem('architect-study-appearance') || '{}');
  appearance(
    a.theme,
    a.mode || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  );
} catch {
  appearance('atelier', 'light');
}
try {
  [D, C] = await Promise.all(
    ['data.json', 'config.json'].map(async (p) => {
      const r = await fetch(p);
      if (!r.ok) throw Error(p);
      return r.json();
    }),
  );
  if (C.brand.mark) {
    const i = new Image();
    i.onload = () => {
      $('.brand-mark').replaceChildren(i);
    };
    i.alt = '';
    i.src = C.brand.mark;
  }
  render();
} catch (err) {
  $('#content').innerHTML = pageHead(
    'Unable to load',
    'Please refresh the study.',
    'The content file could not be loaded. Open this site through its hosted URL or a local web server, not as a file on disk.',
  );
  console.error(err);
}
