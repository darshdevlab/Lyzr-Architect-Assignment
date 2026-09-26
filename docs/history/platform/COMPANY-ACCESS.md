# Company access and shared workspaces

## Live behavior

- A verified account can create up to five companies and becomes their owner.
- Owners and administrators create invitations for a specific email and role. The application produces a copyable invitation link; it does not send email.
- Invitation tokens use 32 random bytes. Only their SHA-256 hashes are stored. A token is returned once, placed in the URL fragment, expires after seven days, and is single-use. Replacing an invitation revokes earlier pending invitations for that email/company.
- Claiming a link requires a signed-in account whose verified email exactly matches the invitation, case-insensitively. Company-domain matching never grants membership.
- Owners/admins manage membership. Only owners can grant or change owner/admin authority. The final owner cannot be removed or demoted.
- Every member can read the company's shared workspace. Owners, admins and all contributor roles can edit it. Viewers cannot write through either the RPC or direct table access.
- Role views for PM, developer, QA, designer, sales, CX, finance, HR, DevOps and executive personalize the interface. These are contributor roles, not department-level field restrictions. Department-isolated data security remains a prototype and must not be implied.
- Company project/workflow/business-record data is one shared JSON workspace with revision-based conflict protection. Switching between editions uses the same records. A stale writer must reload instead of overwriting a teammate.
- Account personal workspaces remain separate. The frontend uses actual membership role/capabilities rather than a role string inside the saved workspace. Member name and avatar come from the signed-in account; company profile fields cannot overwrite a teammate’s identity. Edition navigation flushes pending writes before leaving, and company history navigation revalidates membership.

## Browser contract

`src/lib/company.ts` exports:

- `listCompanies`, `getCompany`, `createCompany` returning `CompanySummary` with `id`, `name`, `role`, `canWrite`, `canManage`.
- `listMembers`, `listInvites`, `createInvite`, `acceptInvite`, `revokeInvite`, `updateMemberRole`, `removeMember`.
- `loadCompanyWorkspace<T>(companyId, expectedUserId?)` and `saveCompanyWorkspace(companyId,data,expectedRevision,expectedUserId?)`.
- `pendingInvite()`: call at boot before Google OAuth to preserve the invitation in session storage while removing the URL fragment.
- `CompanyAccess` props: `userEmail?`, `initialCompanyId?`, `onSelect(company)`, `onClose?`.

Cloud auth now exposes Google avatar metadata for display only; it is never used for authorization. The generic authenticated RPC helper refreshes the session and supports an expected-account guard.

## Database

Apply `supabase/company-schema.sql` once after the existing base schema for a new environment. The deployed project already has both company migrations applied.

Public company, membership and workspace tables have RLS. Identity/role checks and invitation mutations live in privileged routines in a private schema with fixed empty search paths and explicit authenticated-user checks. Public RPC wrappers are security-invoker routines. Direct membership changes are not granted to clients.

The company workspace supports approximately 2 MB of serialized data. This prototype does not implement multi-record merge or realtime collaboration; concurrent changes return a revision conflict. Enterprise SSO, domain policies, directory provisioning, invitation email delivery and department-specific authorization are separate future integrations.

## Verification

`tests/company-access.sql` ran against live Supabase in a rolled-back transaction. It verified company ownership, verified-recipient matching, single-use invitations, cross-company isolation, shared contributor edits, stale revision denial, viewer write denial, role escalation denial, admin restrictions, last-owner retention and immediate access removal. No test users or organizations were retained, and no email was sent.

`tests/company.test.ts` verifies the UI capability matrix and invitation parsing/fragment transport. Current Supabase advisors report no company-table/function security findings. The separate account-level leaked-password protection setting remains disabled; Google sign-in does not use an app password.


Hosted browser verification (`tests/company-browser-results.json`) passed 18 checks on Architect 3.0: Google sign-in/logout; password sign-in; company creation; owner project save/reload; copyable invitation; employee acceptance; distinct member identity/role; shared document edit/reload; final logout and cleanup. The employee document was independently confirmed in Supabase at revision 2. Two temporary preverified `.invalid` accounts and their company were removed afterwards; zero remain.

Email sign-up confirmation delivery and password-reset email delivery were not exercised. No email was sent. Google basic profile/email sign-in was exercised with the already-authorized account. Latest edition-navigation flush/history guards passed typecheck and source review; those guards were added after this hosted smoke deployment and require the final redeploy.


A later cross-edition run encountered a new Chrome “Dangerous site” warning for the signed-out 3.0 base URL and a blocked-client navigation for 2.0. The earlier successful company smoke remains valid evidence of that run, but does not override this later access blocker. No warning was bypassed. Google’s public transparency lookup returned “No available data,” not a clearance. See `tests/cross-edition-results.json` for passed versus blocked checks and warning evidence. Edition 4 Google sign-in and a real free-model generation succeeded during the later run; reading the same newly created project through every edition remains unverified.
