# Architect 4.0 local packaging

This package runs the Architect web prototype on a private machine. It still uses the configured Supabase and OpenRouter services. It is not a fully air-gapped distribution and does not move hosted data into a private database automatically.

1. Install Docker from the official vendor and start Docker Engine.
2. Copy `.env.example` to `.env`. Set the same public Supabase URL/key at build time and server-side key settings at runtime. Keep the OpenRouter secret server-side.
3. Run `docker compose config --quiet`, `docker compose build`, then `docker compose up -d`.
4. Open http://localhost:8080. Add this exact origin to your Supabase authentication redirect allowlist before trying Google sign-in.
5. Before network access: add a TLS reverse proxy, review data residency, configure provider permissions, backups, monitoring, secret rotation and update ownership.

The Compose example binds localhost only and uses a non-root, read-only container. Cloud resource provisioning, Kubernetes/Helm deployment, enterprise SSO and database migration are reviewable workflow prototypes. Exported plans do not execute against AWS, Azure or GCP.

Verification status is recorded in VERIFICATION.md; do not assume Docker execution was tested if the local Docker engine was unavailable.
