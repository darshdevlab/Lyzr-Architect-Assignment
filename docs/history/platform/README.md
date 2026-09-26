# Lyzr Architect 2.0

Developer and non-technical builder workspace: 65 feature packages from plan through build, review and release.

- Live: https://lyzr-architect-2.vercel.app
- Repository: https://github.com/darshdevlab/lyzr-architect-2.0 (private)
- Assignment: https://lyzr-architect-assignment.vercel.app

## Shared foundation

All three applications use the same Supabase project, accounts, personal projects and company workspaces. Each hostname has its own browser session; use the same account on each. Edition changes preserve project/company context and flush pending saves. Demo mode is local to each hostname and does not synchronize anonymous data.

Google sign-in and email/password sessions, cloud storage, organization creation, verified-email invitation acceptance, contributor/viewer permissions, editable plans and free-model prompting are implemented. Company admins create invitations; knowing the email domain alone never grants membership. Invitations are copied as links; this prototype does not send invitation email or provision temporary passwords.

External GitHub changes, Notion/Lyzr execution, MCP tools, bot scheduling, enterprise SSO, purchases, cloud provisioning, monitoring ingestion and production app deployment are explicitly identified workflow prototypes. Generated apps are self-contained HTML previews, not arbitrary production backends. Role-based views are personalization; server authorization distinguishes owner/admin/contributor/viewer, not field-level department access.

## Run

Use Node.js 24 and pnpm. Run `pnpm install --frozen-lockfile`, copy `.env.example` to `.env`, and set public Supabase configuration plus server-only `OPENROUTER_API_KEY`. Set `VITE_EDITION` to this repository's edition. Never commit `.env` or prefix a secret with `VITE_`.

Run `node scripts/dev-api.mjs` and `pnpm dev` in separate terminals. For the standalone package, run `pnpm build`, then `node --env-file=.env scripts/serve.mjs`. See `PRIVATE-INSTALL.md` for Docker packaging and its boundaries.

Run `pnpm test` and `pnpm build`. See `VERIFICATION.md`, `COMPANY-ACCESS.md` and the assignment showcase for evidence, screenshot maps and known limitations.
