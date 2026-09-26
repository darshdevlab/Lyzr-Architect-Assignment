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
function nav() {
  const route = location.hash.slice(1) || 'explore';
  $('#nav').innerHTML =
    `<a class="nav-head ${route === 'explore' ? 'active' : ''}" href="#explore"><i>01</i> Explore</a>${D.platforms.map((p) => `<a class="nav-child ${route === 'platform/' + p.key ? 'active' : ''}" href="#platform/${p.key}">${esc(p.key === 'architect' ? 'Architect + Lyzr' : p.name)}<b>↗</b></a>`).join('')}<a class="nav-child ${route === 'comparison' ? 'active' : ''}" href="#comparison">Comparison</a><a class="nav-child ${route === 'blockers' ? 'active' : ''}" href="#blockers">Blockers & boundaries</a><a class="nav-head ${route === 'build' ? 'active' : ''}" href="#build"><i>02</i> Build</a>${Object.keys(
      edition,
    )
      .map(
        (v) =>
          `<a class="nav-child ${route === 'build/' + v ? 'active' : ''}" href="#build/${v}">Architect ${v}<b>${v === '2.0' ? 'BUILD' : v === '3.0' ? 'COMPANY' : 'PRIVATE'}</b></a>`,
      )
      .join(
        '',
      )}<a class="nav-child ${route === 'features' || route.startsWith('feature/') ? 'active' : ''}" href="#features">Feature atlas <b>109</b></a><a class="nav-child ${route === 'baseline' ? 'active' : ''}" href="#baseline">Existing foundation <b>422</b></a>`;
}
function overview() {
  return `<section class="hero"><div><div class="eyebrow">Architect / The product study</div><h1>From a prompt.<br>To a <em>possibility.</em></h1><p class="lead">An exploration of how people build with AI — and a considered direction for what comes next. Eleven platform records. One shared benchmark. Three connected product experiences.</p><div class="actions"><a class="button primary" href="#comparison">Explore the findings <span>↗</span></a><a class="button" href="#build">Meet Architect 2 / 3 / 4 <span>→</span></a></div></div><div class="hero-art" aria-hidden="true"><div class="orbit"></div><div class="orbit two"></div><div class="orbit three"></div><div class="art-center">A.</div><div class="art-caption">IDEA · INTENT · IMPACT</div></div></section><div class="stats"><div class="stat"><strong>11</strong><span>Platform research records<br>Claude Chat counted separately</span></div><div class="stat"><strong>432</strong><span>Research captures in the archive<br>${D.counts.published} curated images published here</span></div><div class="stat"><strong>109</strong><span>Proposed feature packages<br>Across 16 product areas</span></div><div class="stat"><strong>3</strong><span>Connected editions<br>One shared project foundation</span></div></div>${heading('platforms', 'Observe the experience.', 'Choose a platform to follow its journey.')}<div class="grid">${D.platforms.map((p, i) => `<a class="card link" href="#platform/${p.key}"><div class="card-top"><span class="platform-icon">${esc(p.name[0])}</span><span class="tiny">${String(i + 1).padStart(2, '0')} / RESEARCH</span></div><h3>${esc(p.name)}</h3><p>${esc(p.position)}</p><div class="card-footer"><span>${p.features.length} feature groups · ${p.journey.length} journey stages</span><span>↗</span></div></a>`).join('')}</div>${heading('method', 'One brief. Different experiences.')}<div class="split"><div class="card"><h3>The SupportDesk benchmark</h3><p>Build a responsive support app with a demo entry, dashboard, searchable ticket inbox, create/update actions, editable knowledge base, agent settings and persistent activity. AI suggestions must cite the knowledge base and require human approval before a reply is sent.</p><br><p>The shared follow-up added a Needs approval filter, dashboard count and a timestamped approval event. Fictional data only; no paid connections or automatic publishing.</p></div><div class="card"><h3>What this comparison can tell us</h3><p>We observed how platforms explain progress, expose controls, support correction and handle limits. Account tiers, available credits, model defaults and recovery interventions differed. Cursor also had a small trailing text-entry artifact.</p><br><p>This is product research, not a controlled model benchmark or a universal performance ranking. Claude Code was gated; free Claude Chat / Artifacts is a separate comparison.</p></div></div>${callout('Evidence before certainty.', 'Feature discovery is not proof that every integration works. Each platform page separates the action, the observed response and the implication. The original archive includes repeated states and generated-app screens, not 432 unique features.')}<a class="button" href="#blockers">Read the research boundaries →</a>`;
}
function platform(key) {
  const p = D.platforms.find((x) => x.key === key);
  if (!p) return notfound();
  const m = D.market.platforms.find((x) => x.key === key);
  return `${pageHead('01 / Explore', esc(p.name), esc(p.position))}<div class="subnav"><a href="#platform/${key}" data-anchor="journey">User journey ↓</a><a href="#platform/${key}" data-anchor="inventory">Feature inventory ↓</a><a href="#platform/${key}" data-anchor="evidence">Visual evidence ↓</a><a href="#platform/${key}" data-anchor="market">Positioning ↓</a></div>${callout('Observed scope', esc(p.access))}${heading('journey', 'From entry to outcome.', `${p.journey.length} recorded journey stages`)}<div class="journey">${p.journey.map((s, i) => `<article class="journey-step"><span class="step-no">${String(i + 1).padStart(2, '0')}</span><h3>${esc(s[0])}</h3><div><p class="response">${esc(s[1])}</p><p>${esc(s[2])}</p><p><em>Design implication:</em> ${esc(s[3])}</p></div></article>`).join('')}</div>${heading('inventory', 'What the platform exposes.', `${p.features.length} grouped records — not an exhaustive feature count`)}<div class="table-wrap"><table><thead><tr><th>Feature group</th><th>Recorded features</th><th>Coverage & limitation</th></tr></thead><tbody>${p.features.map((f) => `<tr><td>${esc(f[0])}</td><td>${esc(f[1])}</td><td>${esc(f[2])}</td></tr>`).join('')}</tbody></table></div>${heading('evidence', 'The experience, captured.', `${p.capture_count} source captures · ${p.screenshots.length} public selection`)}${p.screenshots.length ? `<div class="grid two">${p.screenshots.map(shot).join('')}</div>` : `<div class="empty">The source archive contains ${p.capture_count} captures. No screenshot is published on this page: account details in the reviewed candidates need redaction before public release.</div>`}<details><summary>Full capture ledger · ${p.capture_count} records</summary><p class="screenshot-note">Only reviewed, publishable images are bundled. Unpublished records remain in the private research archive; labels preserve the evidence map without exposing those files.</p><div class="table-wrap"><table><thead><tr><th>Capture</th><th>Type / state</th><th>Public availability</th></tr></thead><tbody>${D.captureIndex
    .filter((s) => s.platform === key)
    .map(
      (s) =>
        `<tr><td>${esc(s.id)}</td><td>${esc(s.kind)}<p>${esc(s.label)}</p></td><td>${s.published ? 'Published above' : 'Not published — privacy / curation review'}</td></tr>`,
    )
    .join(
      '',
    )}</tbody></table></div></details><p class="screenshot-note">Screenshots are historical research evidence from the signed-in benchmark session. A screenshot of a generated app is labeled as output evidence, not proof of a platform feature. Private account/settings captures are excluded from this public selection.</p>${heading('design', 'What we would learn from it.')}<div class="split"><div class="card"><h3>Keep the useful patterns</h3><ul class="bullet-list">${p.good.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div class="card"><h3>Reduce the friction</h3><ul class="bullet-list">${p.friction.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>${callout('Implication for Architect', esc(p.lesson))}${m ? `${heading('market', 'Why people might choose it.')}<div class="split"><div class="card"><span class="pill">Vendor positioning + research synthesis</span><h3 style="margin-top:18px">${esc(m.positioning)}</h3><p>${esc(m.audience)}</p><br><p>${esc(m.why_people_use_it)}</p><br><p class="tiny">${esc(m.motivation_evidence)}</p>${sourceLinks(m.positioning_sources)}</div><div class="card"><span class="pill">Historical public adoption claim</span><h3 style="margin-top:18px">${esc(m.reported_user_metric)}</h3><p>${esc(m.metric_type)} · ${esc(m.metric_date || 'Publication date not specified')}</p><br><p>${esc(m.metric_caveat)}</p>${sourceLinks(m.metric_sources)}</div></div>` : ''}<div class="actions"><a class="button" href="#comparison">Compare with other platforms →</a><a class="button primary" href="#build/2.0">See the product response →</a></div>`;
}
function comparison() {
  return `${pageHead('01 / Explore / Comparison', 'Different strengths.<br>One shared opportunity.', 'The question is not which platform wins every task. It is which interaction helps a particular user move from intent to a trustworthy result.')}${callout('How to read the adoption figures', esc(D.market.methodology))}${heading('market-map', 'Positioning & adoption.', 'Historical sources recorded 26 September 2026')}<div class="table-wrap"><table><thead><tr><th>Platform</th><th>Audience / promise</th><th>What makes it different</th><th>Public user claim & caveat</th></tr></thead><tbody>${D.market.platforms.map((m) => `<tr><td><a class="source" href="#platform/${m.key}">${esc(m.platform)}</a>${sourceLinks(m.positioning_sources)}</td><td>${esc(m.audience)}<p>${esc(m.positioning)}</p></td><td>${esc(m.differentiation_synthesis)}<p>${esc(m.why_people_use_it)}</p></td><td>${esc(m.reported_user_metric)}<p>${esc(m.metric_type)} · ${esc(m.metric_date || 'Undated')}</p><p>${esc(m.metric_caveat)}</p>${sourceLinks(m.metric_sources)}</td></tr>`).join('')}</tbody></table></div>${heading('patterns', 'The shared pattern — and the differences.')}<div class="grid"><div class="card"><h3>Shared foundation</h3><p>Natural-language intent, a project workspace, an iterative conversation and an artifact to inspect. Most expose some combination of history, source, integrations or publishing. Visibility does not mean every action was tested.</p></div><div class="card"><h3>Different center of gravity</h3><p>Visual builders optimize the first visible result. IDE agents emphasize code and change review. Architect connects the application to explicit agents. Enterprise controls add a different layer of responsibility.</p></div><div class="card"><h3>The opportunity</h3><p>Make intent, plan, code, agent behavior, test evidence and release decisions feel like one project. Keep context as the user moves between them, with increasing detail instead of a forced tool switch.</p></div></div>${heading('references', 'Reference by design problem.')}<div class="table-wrap"><table><thead><tr><th>User problem</th><th>Useful reference</th><th>What we take forward</th></tr></thead><tbody>${[
    ['Express visual intent', 'Lovable', 'Offer meaningful visual directions before a long build.'],
    [
      'Continue existing work',
      'Replit',
      'Make import a first-class entry beside starting from a prompt.',
    ],
    [
      'Own the implementation',
      'Replit / Bolt / Cursor',
      'Bring source, runtime context and targeted edits close to preview.',
    ],
    [
      'Review an AI change',
      'Codex Cloud',
      'Show the diff, logs and recoverable outcome before a consequential action.',
    ],
    [
      'Understand agents',
      'Architect / Lyzr',
      'Expose models, tools, knowledge and orchestration as understandable parts.',
    ],
    ['Understand release state', 'Rocket.new', 'Distinguish versions, staging and production.'],
    [
      'Stay in the iteration loop',
      'v0',
      'Keep chat, build feedback and preview in one clear workspace.',
    ],
    [
      'Discover integrations',
      'Emergent',
      'Organize the connector catalog around the task, not an undifferentiated list.',
    ],
  ]
    .map((r) => `<tr>${r.map((x) => `<td>${esc(x)}</td>`).join('')}</tr>`)
    .join(
      '',
    )}</tbody></table></div>${heading('gap', 'The response: three deliberate boundaries.')}<div class="grid">${versionCards()}</div>${callout('A product hypothesis, not a competitor absence claim.', 'The opportunity is our synthesis from this study. It does not mean no competitor has a similar capability. We have not performed representative user interviews, retention analysis or a complete audit of every paid tier.')}<a class="button" href="#blockers">What the evidence does not establish →</a>`;
}
function blockers() {
  return `${pageHead('01 / Explore / Blockers', 'Limits belong in the story.', 'A plan gate is an observed platform experience, not a reason to discard useful research. Here is what we could inspect, what stopped execution and what remains unverified.')}${callout('Research completion ≠ universal coverage', 'The free and available surfaces were explored to the extent recorded. We do not claim every feature, every role or every journey was exercised. Ten initial application outputs were obtained across the comparisons; Claude Code itself was not run, and Codex required local recovery.')}<div class="grid"><div class="card"><span class="pill">Access limit</span><h3 style="margin-top:18px">Claude Code</h3><p>The free account reached an upgrade gate. Free Claude Chat / Artifacts was explored separately and must not be presented as a successful Claude Code run.</p></div><div class="card"><span class="pill">Capacity limit</span><h3 style="margin-top:18px">Credits & follow-ups</h3><p>Lovable, Emergent and v0 had usage limits during the study. Their available surfaces and earlier output remain useful evidence; completion of every revision is not claimed.</p></div><div class="card"><span class="pill">Environment limit</span><h3 style="margin-top:18px">Cursor & Codex</h3><p>Cursor desktop ran after the cloud route was gated. Codex generated repository changes, but its app preview needed local recovery. These interventions affect any output comparison.</p></div></div>${callout('Historical deployment caveat', 'Chrome previously displayed warnings on the old Vercel addresses. Google review receipts are retained and clearance is not claimed. The new darshdave.com addresses loaded and Google sign-in completed on 27 September 2026 without bypassing a warning.')}${heading('coverage', 'Coverage ledger.', 'Read both columns together')}<div class="table-wrap"><table><thead><tr><th>Area</th><th>Covered</th><th>Not completed</th></tr></thead><tbody>${D.gaps.map((x) => `<tr><td>${esc(x.Area)}</td><td>${esc(x.Covered)}</td><td>${esc(x['Not completed'])}</td></tr>`).join('')}</tbody></table></div>${heading('definitions', 'Evidence vocabulary.')}<div class="grid">${[
    ['Exercised', 'The recorded action was carried through and its result inspected.'],
    ['Observed', 'The control or screen was inspected; this is not an executed integration.'],
    ['Documented', 'Official or attributed source material supplements hands-on work.'],
    ['Blocked', 'An access, credit, environment or permission boundary stopped an action.'],
    ['Unverified', 'The result has not been demonstrated in this study.'],
    ['Proposed', 'A design or workflow specification, not evidence of implementation.'],
  ]
    .map((x) => `<div class="card"><h3>${x[0]}</h3><p>${x[1]}</p></div>`)
    .join('')}</div>`;
}
function versionCards() {
  return Object.entries(edition)
    .map(
      ([v, e]) =>
        `<a class="card link version-card" href="#build/${v}"><span class="tiny">${e.label.toUpperCase()}</span><div class="edition">${v}</div><h3>${e.title}</h3><p>${e.why}</p><div class="card-footer"><span>${D.features.filter((f) => f.primary_introduction === v).length} packages first introduced</span><span>↗</span></div></a>`,
    )
    .join('');
}
function build() {
  return `${pageHead('02 / Build', 'One foundation.<br>Three ways forward.', 'A deliberate progression from building an application, to connecting a company’s work, to operating the platform within its own infrastructure. Three different frontends share the project, identity and data foundation.')}<div class="grid">${versionCards()}</div>${callout('Custom domains verified.', 'The custom-domain editions loaded and Google sign-in completed on 27 September 2026. Historical warnings and pending Google reviews for the old Vercel URLs remain documented; these checks are not a clearance of those reviews.')}${callout('Scope is cumulative. Counts are not additive to the baseline.', 'Architect 2.0 introduces 65 packages; 3.0 adds 42, reaching 107; 4.0 adds 2, reaching 109, while extending existing packages for private operation. These packages include 40 enhancements and 69 new proposals. The 422 existing interactions are a different unit and are not added to 109.')}${heading('experience', 'The experience contract.')}<div class="grid"><div class="card"><h3>Progressive depth</h3><p>Begin with intent, import or a role-specific task. Reveal source, infrastructure and policy when relevant. Keep simple and advanced views attached to the same project.</p></div><div class="card"><h3>Context travels</h3><p>Carry project, object, permissions, selection and drafts into linked products. Inspect in a drawer; open a workspace for sustained work. Return to the same place.</p></div><div class="card"><h3>Clear capability labels</h3><p>Distinguish working functionality, interactive prototypes and future integrations. Never present a simulated test, purchase, deployment or external action as executed.</p></div></div>${heading('design-system', 'A quiet system with character.')}<div class="split"><div class="card"><h3>Atelier / Current / Prism</h3><p>Warm editorial, calm technical, and expressive professional palettes. Each has light and dark modes. Appearance is a personal preference, independent of permissions or job title.</p><div class="actions"><button data-theme-choice="atelier">Atelier</button><button data-theme-choice="current">Current</button><button data-theme-choice="prism">Prism</button></div></div><div class="card"><h3>Craft in the transitions</h3><p>Visible prompts before the first build. Helpful empty states. Reviewable changes. Saved checkpoints. A persistent project switcher. Profile, logout, limits and settings where people expect them.</p></div></div><div class="actions"><a class="button primary" href="#features">Explore all 109 feature journeys →</a><a class="button" href="#baseline">Inspect the existing foundation →</a></div>`;
}
function version(v) {
  const e = edition[v];
  if (!e) return notfound();
  const fs = D.features.filter((f) => +f.primary_introduction <= +v);
  const conf = C.versions[v];
  return `${pageHead('02 / Build / Architect ' + v, e.title, e.intro)}<div class="actions">${conf.liveUrl && conf.verified ? `<a class="button primary" target="_blank" rel="noopener noreferrer" href="${esc(safeUrl(conf.liveUrl))}">Open Architect ${v} ↗</a>` : '<span class="pill">Live link will be added after deployment verification</span>'}${conf.repoUrl ? `<a class="button" target="_blank" rel="noopener noreferrer" href="${esc(safeUrl(conf.repoUrl))}">GitHub repository ↗</a>` : ''}</div>${conf.browserNote ? callout('Deployment verification note', esc(conf.browserNote)) : ''}${callout('Why this edition exists', e.why)}<div class="stats"><div class="stat"><strong>${fs.length}</strong><span>Cumulative feature packages</span></div><div class="stat"><strong>${fs.filter((f) => f.primary_introduction === v).length}</strong><span>First introduced in ${v}</span></div><div class="stat"><strong>${new Set(fs.map((f) => f.product_key)).size}</strong><span>Product areas represented</span></div><div class="stat"><strong>1</strong><span>Shared project foundation</span></div></div>${heading('persona', 'Start with the person.')}<p class="lead">${e.roles}</p><div class="flow-strip">${e.path.map((p, i) => `<span><b>0${i + 1}</b>${p}</span>`).join('')}</div><p class="screenshot-note">${e.boundary}</p>${heading('screens', 'The prototype experience.')}<p class="screenshot-note">${conf.screenshots.length} linked prototype captures. Workflow stage images live inside their feature journey; overview screens appear below. These document UI behavior, not live external integrations.</p><div id="version-shots">${
    conf.screenshots?.length
      ? `<div class="grid two">${conf.screenshots
          .map((s, i) => ({ ...s, originalIndex: i }))
          .filter((s) => s.showInGallery !== false)
          .map((s) =>
            shot({ ...s, id: `version-${v}-${s.originalIndex}`, platform: 'Architect ' + v }),
          )
          .join('')}</div>`
      : '<div class="empty">Screenshots of this edition will appear here after visual verification. The feature journeys below are the complete specification; they are not a claim that every backend integration is live.</div>'
  }</div>${heading('edition-features', 'Product & feature journeys.', `Select a feature for entry, options, outcome, recovery and handoffs`)}${toolbar()}<div id="feature-results"></div>${callout('Smooth handoffs are part of the feature.', 'Each record includes a return path and a recovery state. A linked feature carries the current project and object context; users should not need to return to the homepage to continue their work.')}`;
}
function toolbar() {
  return `<div class="feature-toolbar"><input id="feature-search" type="search" placeholder="Search features, roles, flows…" aria-label="Search feature atlas" value="${esc(filter.query)}"><select id="product-filter" aria-label="Filter by product"><option value="all">All products</option>${D.products.map((p) => `<option value="${p.product_key}" ${filter.product === p.product_key ? 'selected' : ''}>${esc(p.product)}</option>`).join('')}</select><select id="kind-filter" aria-label="Filter by classification"><option value="all">All classifications</option><option value="Enhance" ${filter.kind === 'Enhance' ? 'selected' : ''}>Existing, enhanced</option><option value="New" ${filter.kind === 'New' ? 'selected' : ''}>New proposals</option></select></div>`;
}
function features() {
  return `${pageHead('02 / Build / Feature atlas', 'Every feature has a journey.', 'Browse 109 proposed packages across 16 product areas. Open any record to trace signup, entry, decisions, outcome, recovery and the next contextual handoff.')}<div class="tabs" aria-label="Feature version"><button data-scope="all" class="${filter.scope === 'all' ? 'active' : ''}">All 109 packages</button>${Object.keys(
    edition,
  )
    .map(
      (v) =>
        `<button data-scope="${v}" class="${filter.scope === v ? 'active' : ''}">First in ${v}</button>`,
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
function render() {
  const route = location.hash.slice(1) || 'explore';
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
    part === 'platform'
      ? 'Explore / ' + (D.platforms.find((p) => p.key === key)?.name || key)
      : part === 'build'
        ? 'Build / ' + (key ? 'Architect ' + key : 'Overview')
        : part === 'comparison'
          ? 'Explore / Comparison'
          : part === 'blockers'
            ? 'Explore / Blockers'
            : part === 'features'
              ? 'Build / Feature atlas'
              : part === 'baseline'
                ? 'Build / Existing foundation'
                : 'The product study / Explore';
  $('#content').innerHTML =
    part === 'platform'
      ? platform(key)
      : part === 'comparison'
        ? comparison()
        : part === 'blockers'
          ? blockers()
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
  window.scrollTo(0, 0);
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
    document.getElementById(el.dataset.anchor)?.scrollIntoView({ behavior: 'smooth' });
  }
  if (el.dataset.scope) {
    filter.scope = el.dataset.scope;
    render();
  }
  if (el.dataset.themeChoice)
    appearance(el.dataset.themeChoice, document.documentElement.dataset.mode);
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'feature-search') {
    filter.query = e.target.value;
    featureResults(location.hash.startsWith('#build/') ? location.hash.split('/')[1] : undefined);
  }
  if (e.target.id === 'baseline-search') baselineResults(e.target.value);
});
document.addEventListener('change', (e) => {
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
