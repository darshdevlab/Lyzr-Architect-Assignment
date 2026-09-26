# Architect 2.0: live services and boundaries

The frontend uses the shared Supabase project for authenticated personal workspaces. Future interfaces can use the same records. Team permissions shown in prototype screens do not yet implement collaborative row access; each signed-in user currently owns one isolated workspace.

## Environment

- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`: public Supabase URL and publishable/anonymous key.
- `OPENROUTER_API_KEY`: server only. Never name it with the `VITE_` prefix.
- Server accepts `SUPABASE_URL`/`SUPABASE_ANON_KEY`, falling back to the public variables.

No service-role key is needed. Only the owner can read/update/delete their workspace. The browser authenticates directly with Supabase; generation endpoints validate bearer tokens using Supabase's user endpoint.

## Browser interface

`src/lib/cloud.ts` exports:

- `configured`: authentication configuration present.
- `auth.getUser()`: resolves a user `{ id, email?, name? }` or null; completes PKCE Google or email callbacks and refreshes expired sessions.
- `auth.signIn(email,password)`, `auth.signUp(email,password,name)` (null means email confirmation needed), `auth.signInWithGoogle()`, `auth.signOut()`.
- `auth.resetPassword(email)` / `auth.updatePassword(password)`.
- `auth.onChange(callback)`: subscription; returns unsubscribe function.
- `getAccessToken()`: cached access token. Prefer wrappers, which refresh when needed.
- `loadWorkspace<T>()`: `{data:T,revision:number}` or null.
- `saveWorkspace(data, expectedRevision)`: new revision; use zero for first create. Stale revision raises a clear conflict instead of overwriting another tab. Cloud writes capped at 1 MB in client (1.2 MB JSON representation DB).
- `listModels()`: available free model array with id, name, family, contextLength, supportsImages, free.
- `generate({prompt,context?,mode?,model?,images?},signal?)`: mode `app`, `plan`, or `chat`; model `auto` or catalog free ID. Context is a string. Images are up to two PNG/JPEG/WebP data URLs, max 1 MB each. Response: `{text,model,usage:{promptTokens,completionTokens,cost},requestId,remaining}`.

Google provider configuration and allowed redirect origins must be enabled in Supabase separately. Password signup and recovery depend on the project's email delivery settings. Default Supabase mail service is limited; do not promise production mail delivery without a configured SMTP service.

## Server endpoints

- `GET /api/health`: configuration booleans, no secrets.
- `GET /api/models`: zero-price catalog, cached for five minutes. No key disclosed.
- `POST /api/generate`: authenticated account required. No anonymous/demo generations. Prompt up to 12,000 chars, context 40,000. No tools or shell execution. HTML generation is returned as untrusted text; render in a sandboxed frame and validate before export.

Only catalog models whose IDs end in `:free` AND prompt/completion prices are zero are accepted. Provider request sets max prompt/completion prices to zero and disables provider fallback. Automatic selection is a transparent capability heuristic, not an evaluated model-quality promise. Screenshot requests require a free vision model. Provider constraints may still reject a model; errors preserve prompts and ask the user to retry or choose a different free model.

Durable quota: 10 attempts per user per UTC day; 40 attempts shared across the prototype per day; minimum 15 seconds between attempts. Failed/timed-out provider attempts count because the provider may have consumed quota. Quota guard fails closed. Authenticated users can call the public quota reservation RPC and consume their own allowance; they cannot increase/reset counts or read underlying quota data. The privileged function lives in a private schema, has no parameters controlling identity, checks auth.uid(), uses a fixed empty search_path, and serializes reservations with an advisory lock. Database daily records are small and never store prompts.

## Verification completed

- Nine backend unit tests: input boundaries, paid model rejection, server token verification, anonymous denial, no-key safety, quota fail-closed, zero-price provider configuration.
- Live Supabase transaction with two synthetic users (fully rolled back): owner row isolation, blocked cross-user update, successful own writes, stale/duplicate revision conflicts, quota reservation and interval throttle.
- Supabase security advisors: zero findings after private quota wrapper.
- OpenRouter key verified with authenticated read-only endpoint. Current free catalog retrieved; no key values were printed.

These checks do not substitute for the parent task's browser Google login, full application flows, deployment, or live-generation end-to-end test. Google/browser/deployment checks need to be verified after configuration and integration.

A subsequent live integration run authenticated a synthetic verified email account without sending email, saved and read a workspace, denied unauthenticated generation, and generated working counter HTML through `cohere/north-mini-code:free` (114 prompt / 2,097 completion tokens; zero cost). An earlier automatic Qwen attempt returned provider 429 and was correctly surfaced. The synthetic user, sessions, workspace and quota rows were removed after testing and verified absent. See `tests/backend-live-results.json`. This validates the live backend flow, not Google OAuth or browser UI.

Hosted deployment verification at `https://architect-platform-indol.vercel.app`: 12/12 checks passed, including real free-model generation (108 prompt / 1,579 completion tokens; zero cost), missing/forged-token denial, paid-model rejection, security headers, auth, cloud persistence, stale-write conflict, and logout. Synthetic test resources were removed. Evidence: `tests/backend-hosted-results.json`.
