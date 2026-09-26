# Architect — the product study

A standalone static assignment showcase, designed as a browsable research and product case study. No install, build step, API key, analytics or backend is needed.

## Run and deploy

Serve this directory with any static HTTP server. For example: `python3 -m http.server 4185 --directory outputs/architect-assignment` from the workspace root. Deploy the directory on Vercel with framework preset **Other**, no build command and output directory `.`. `vercel.json` supplies security headers.

## Content

- Explore: 11 platform records (Claude Chat/Artifacts is separate from Claude Code), full recorded feature groups and journey stages, attributed market evidence, visual evidence, comparison and research boundaries.
- Build: cumulative 2.0 / 3.0 / 4.0 scope, edition rationale and persona journey, all 109 package journeys across 16 product areas, 228 contextual handoffs, and 422 baseline interaction mappings.
- Appearance: Atelier, Current and Prism; light and dark modes; initial system preference; local appearance persistence.
- Search: feature, role and flow text; product and classification filters; first-introduction version filters; baseline search.

## Evidence and privacy

`data.json` contains the consolidated, dated source records from the existing research and specification. It is documentation, not a certificate that every backend integration is working. The counts use different units: 422 existing interactions, 109 enhancement/new packages, and 432 captures must not be added together or represented as unique verified features.

The full 432-entry capture ledger is published as metadata. Eleven screenshots were visually inspected and copied into `assets/`. They show research surfaces or fictional benchmark data, not secret keys/private emails. Unreviewed/private settings screenshots are excluded. Architect platform candidates exposed an account balance/app identifier and were withheld; a safe generated-app knowledge-base image is included and explicitly labeled output evidence. Missing public images are labeled as privacy/curation gaps. No screenshot was fabricated or edited.

Adoption figures are historical claims recorded on 26 September 2026 with source dates and caveats. They are not audited current active-user totals and should not be ranked or summed. Research used available accounts and had credit, plan and environment limits.

## Updating deployment links and screenshots

Edit `config.json`. Each edition has `liveUrl`, `repoUrl`, `verified`, and `screenshots`. Set `verified:true` only after checking the deployed URL. Each screenshot record needs `image` (relative public path), `label`, and optional `kind` and `featureIds` (an array of package IDs). Feature detail dialogs show screenshots whose `featureIds` include that feature; every unlinked feature has an explicit evidence gap. Copy the real, reviewed image into `assets/` first. Root deployment work owns the final live links and screenshots. Repository links use the agreed `darshdevlab/lyzr-architect-*` names.

The shared brand mark is copied from the Architect app's `public/favicon.svg`. External source links open separately with `noopener`. Content rendering escapes source text; no research text is executed as HTML.

## Verification

Run `python3 validate.py` from this directory for ID uniqueness, counts, handoff targets, baseline targets, source attribution and asset integrity. Browser checks are recorded in `browser-checks.json`. These are focused checks, not an exhaustive accessibility certification.

## Prototype workflow evidence

The v2 workflow evidence set contains Configure, Review and Outcome screenshots captured from the live demo UI with fictional inputs. These show successful **prototype record creation**, not external integration execution. Feature-specific images are mapped through `config.json`; the original full capture ledger remains separate.

All 109 proposed packages now have representative screenshots linked: 65 builder packages, 42 company packages and two private-infrastructure packages. V2 has three stage captures per package; V3 supplied its 42×3 capture manifest plus persona/overview screens; V4 supplied guided infrastructure screens. Some long forms require scrolling beyond the pictured viewport. Browser verification found Chrome warnings/blockage for 3.0 and one 2.0 session; endpoint reachability does not clear them. The public showcase displays that caveat prominently.
