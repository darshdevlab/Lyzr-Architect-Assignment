# Lyzr Architect Assignment

Three working prototype editions and their research showcase, maintained in one repository. Editions share one React application, API and data model; `VITE_EDITION` selects the experience at build time.

| Experience    | Scope                                                        | Intended address                     |
| ------------- | ------------------------------------------------------------ | ------------------------------------ |
| Architect 2.0 | Developer build, agent, review, test and release workflows   | https://architect2.darshdave.com     |
| Architect 3.0 | Company roles, planning, business workflows and bot teams    | https://architect3.darshdave.com     |
| Architect 4.0 | Private infrastructure, installation and governance journeys | https://architect4.darshdave.com     |
| Assignment    | Research, feature journeys, rationale and evidence           | https://lyzrassignment.darshdave.com |

These addresses are deployment targets. Consolidating source does not itself publish or verify them.

## Structure

- `apps/platform/` — shared React/Vite UI, server API, operational SQL, tests and container configuration.
- `apps/assignment/` — searchable static case study and structured content.
- `docs/evidence/` — curated public screenshots, coverage tables and source provenance.
- `docs/history/` — original documentation, preserved with historical URLs and limitations.
- `scripts/` — builds all editions without maintaining duplicated applications.

## Local setup

Use Node.js 24 or newer and pnpm 10.28.0. From the repository root:

```sh
corepack enable
corepack prepare pnpm@10.28.0 --activate
pnpm install --frozen-lockfile
cp apps/platform/.env.example apps/platform/.env
pnpm dev
```

The UI runs at `http://127.0.0.1:4183`. Demo mode works without credentials. To enable authenticated storage and real AI generation, configure the platform environment, apply the reviewed SQL in `apps/platform/supabase/`, and run `pnpm dev:api` in another terminal. The API runs on port 4184 and Vite proxies `/api` to it. Use the same Supabase project for all editions. Never put the OpenRouter key in a `VITE_` variable.

Set `VITE_EDITION=3` or `4` when starting the UI to preview another edition. `pnpm dev:assignment` builds and serves the case study on port 4180.

## Verify and build

```sh
pnpm test
pnpm format:check
pnpm build
```

`pnpm build:2`, `build:3` and `build:4` produce `apps/platform/dist/edition-2`, `edition-3`, and `edition-4`. `pnpm build:assignment` produces `apps/assignment/dist`, including curated images staged from `docs/evidence/showcase-assets`. Python 3 is required for the assignment integrity checks.

## Deployment

Create four deployments from this repository. The three application projects use `apps/platform` as their root directory, run `pnpm build`, output `dist`, and set `VITE_EDITION` to 2, 3 or 4 respectively. This app-local build is separate from the root all-edition build. Keep Vercel access to files outside the project root enabled for workspace dependency installation. The shared `api/` and app-local `vercel.json` provide the API and SPA routes.

The assignment uses the repository root as its build context, runs `pnpm build:assignment`, and outputs `apps/assignment/dist`. Apply the security headers from `apps/assignment/vercel.json`. Configure the custom domains independently. Update the two active URL configuration files mentioned in `docs/evidence/README.md` when addresses change.

Set Supabase public URL and publishable/anon key for the frontend build. Set server-side Supabase settings and `OPENROUTER_API_KEY` for the API. Configure Google OAuth and Supabase redirect allowlists for each deployment; sharing code does not configure those providers automatically. The Docker build uses the repository root context: `docker build -f apps/platform/Dockerfile .`.

## Security and prototype boundaries

No credentials are included. `.env.example` contains placeholders only. Supabase row-level security is part of the operational schema. Review database changes before applying them. Public Supabase credentials are not substitutes for RLS. Server-side AI generation restricts available models and request budgets; provider availability is external.

Authentication, project persistence, bounded AI requests and local editing have working implementations when services are configured. Many integrations, deployment gates, team operations, agent scheduling and private-infrastructure journeys are interactive simulations. Their UI labels and historical coverage explain the boundaries. This is not a production execution engine, unrestricted IDE or an installed private-cloud service. Static tests and build success do not prove external integrations or all browser journeys work.

Historical evidence is retained for review, with unreviewed raw account/provider captures excluded. See `docs/evidence/README.md` and the source manifest for provenance.
