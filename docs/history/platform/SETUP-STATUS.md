# Architect prototype setup

Latest user decision: one deployment, one database, shared users and shared projects across Architect 2.0, 3.0 and 4.0. The versions have different frontend experiences and feature scopes. This supersedes the earlier three-independent-sites decision. Switching versions should preserve the selected project.

## Resources
- Supabase: architect-prototypes, project ref phnfewsrwciyyaeoewlg, Darsh Org, Mumbai (ap-south-1), creation quote $0/month, creation status ACTIVE_HEALTHY.
- Previous Supabase kova (rdcjmsiehmbsymsuzobq) deleted and absence verified.
- Google Cloud: Architect Prototypes, project ID architect-prototypes-darsh, project number 279509759816. Created without enabling paid billing. Google OAuth is not configured yet.
- Previous Google Cloud Kova (fast-way-509617-k7) shut down; console confirms scheduled deletion after 26 October 2026.
- Vercel: Darsh’s Team, Hobby. Previous kova project (prj_OHJFVpGYNK2nVrEo6zvfrTMFoTpC) deleted; absence verified through MCP. Replacement deployment will be created when building is authorized. The GitHub repository was not deleted.
- OpenRouter key placeholder: .env, OPENROUTER_API_KEY. This file has owner-only permissions and is excluded by .gitignore. Never print or commit its contents. Key validation has not been performed.

## Remaining setup caveats
- Supabase displayed a previous-cycle organization usage warning, with restrictions possible from 13 October 2026 if usage remains over quota. Project deletion does not guarantee that historical usage is reset.
- Notion and Lyzr runtime credentials still need secure configuration during the build.
- Application construction remains paused pending the user’s explicit instruction to start.
