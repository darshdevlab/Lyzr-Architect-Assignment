# Domain migration

All four addresses use the existing Vercel projects and the domain owner's existing wildcard DNS record. The shared Supabase project, accounts and data are retained. Its authentication allowlist now includes architect2.darshdave.com, architect3.darshdave.com and architect4.darshdave.com; Architect 2 is the default site URL.

Google sign-in completed at each custom origin on 27 September 2026. The existing project appeared in Architect 2, and company access correctly required membership or company creation in editions 3 and 4. Deployments from this repository are verified separately after publication.

The original four repositories were backed up as verified Git bundles outside this repository. The assignment repository was renamed with the requested capitalization and its history retained. The three redundant edition repositories are retained until consolidated publication is verified.

## Operational notes

- Supabase's organization reports egress usage of 12.69 GB against 5 GB included, with a grace period ending 13 October 2026. No billing was enabled. Restrictions may apply if usage remains above the allowance.
- Prior Google Safe Browsing reviews for the old Vercel addresses remain pending. Successful HTTPS or custom-domain login does not certify their review outcome.
- Vercel's GitHub connection is not currently configured; deployments use the authenticated CLI. Set the repository-local Git author to the owning GitHub account before deploying. Do not change global Git identity.
