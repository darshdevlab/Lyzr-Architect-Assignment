> Updated 27 September 2026: see [current update](UPDATE-2026-09-27.md). The checks below describe the earlier baseline, not a new full-scope signoff.

# Architect editions — verification and boundaries

Verified 26 September 2026. The applications are working prototypes, not production enterprise services.

## Delivered structure

- 2.0: 65 developer/builder feature packages.
- 3.0: 42 additional company packages (107 cumulative), 11 persona home perspectives.
- 4.0: 2 additional private-platform packages (109 cumulative), including seven setup stages and cloud, runner, install, governance and recovery surfaces.
- Assignment showcase: 11-platform research, comparison, blockers, all 109 feature journeys, 228 contextual handoffs and the 422 baseline traceability records.

Each edition has a separate repository and deployment. Supabase accounts and personal/company data are shared. The same account must sign in on each hostname; anonymous demos remain local. Features inherited by later editions share the foundation implementation and evidence rather than claiming that each inherited screen was separately tested three times.

## Passed checks

- TypeScript and production builds for all editions.
- 45 automated tests: malformed persisted state, project isolation, cloud revisions, input limits, identity checks, free-only model routing, quotas, preview isolation, message origin/token checks, feature definitions, company domains, role capabilities, invitations and infrastructure validation.
- 65 version-two workflow recipes exercised through configure, review and saved outcome. Seven Build recipes were captured on the local updated build; the other 58 were exercised on the hosted 2.0 demo.
- 42 company package flows exercised through configure, review and saved outcome, plus 11 persona views, cross-product handoffs, archive/restore and reload persistence.
- 18 hosted company/authentication UI checks: Google sign-in/logout, verified email/password login, company creation, owner project creation, saved reload, verified-email invitation, member acceptance, shared project editing and correct member identity.
- 11 live database authorization scenarios, including wrong email, token replay, cross-company isolation, viewer denial, role escalation denial, retained ownership and revoked access. Synthetic records were cleaned up.
- All three API health endpoints returned configured status; anonymous and forged-token generation requests were rejected.
- A real Google-authenticated 4.0 project, “Shared focus board,” was generated with cohere/north-mini-code:free and persisted to the shared database. No paid model was used.
- 2.0 demo prompt-to-project, generated preview add/complete actions, element selection, code view and games were exercised.
- 4.0 placement, identity, network, runtime, acknowledgement validation, installation rehearsal, operations and recovery-checklist save were exercised. Phone-width DOM checks found no horizontal overflow.
- The standalone Node package serves the built app and API health route. Secret scan found no private OpenRouter value in the browser build.

## Unresolved browser warning

Chrome subsequently showed a red “Dangerous site” interstitial on the base 3.0 URL and blocked navigation to 2.0 with ERR_BLOCKED_BY_CLIENT. The earlier hosted 3.0 auth/company checks had passed before this appeared. Nothing was bypassed. Google's public Transparency Report returned “No available data”; that is not a clearance. A focused source review did not establish the cause. Full final cross-edition Chrome UI verification is therefore blocked, and the sites should not be described as universally ready for recruiter review until this is resolved through the appropriate browser/site-review process.

4.0 Google authentication and real generation passed, but interaction with that generated iframe was limited by the browser extension's about:srcdoc permission. Its final logout/reload was not asserted as tested. See tests/cross-edition-results.json.

## Prototype and verification limits

Email confirmation/recovery delivery to a real inbox was not tested. Company invitations are real single-use links but are not emailed. Enterprise SSO and automatic employee credential provisioning remain prototype flows. Departments personalize views; authorization is owner/admin/contributor/viewer rather than per-field department restrictions.

GitHub synchronization, external Notion/Lyzr/MCP execution, autonomous bot scheduling, production QA execution, generated-app deployment, purchases and cloud resource provisioning remain labeled simulations or configuration drafts. Four hosted app URLs do not mean generated applications are independently deployed.

The Docker package was authored, but Docker Engine was not available for a container runtime test. The equivalent Node server was tested. The private prototype still depends on configured hosted Supabase and OpenRouter; it is not air-gapped, and choosing AWS/Azure/GCP does not migrate hosted data or create cloud resources.

Supabase's organization dashboard displayed a prior-cycle quota warning and possible restriction from 13 October 2026 if the organization remains over quota. No paid plan or billing was enabled.

## Evidence

The assignment showcase links product/feature/persona journeys and screenshots. Machine-readable reports live under tests/, screenshots and manifests under verification/. The 422 historical baseline entries remain traceability data, not 422 independently verified production controls.
