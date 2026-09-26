# Consolidation validation

Validated 27 September 2026. This report concerns repository structure and build integrity, not a new live-service acceptance test.

| Check                                         | Result                              |
| --------------------------------------------- | ----------------------------------- |
| pnpm 10.28.0 frozen-lockfile clean install    | Passed                              |
| Platform tests                                | 91 passed, 0 failed                 |
| Prettier 3.6.2 formatting check               | Passed                              |
| Edition 2, 3 and 4 TypeScript/Vite builds     | Passed                              |
| Assignment source content and asset integrity | Passed                              |
| Assignment built content and asset integrity  | Passed                              |
| Tracked-source provenance inventory           | 748 entries classified              |
| Published curated assets retained             | 384 files                           |
| Credential-shaped token scan of copied text   | No matches for tested token formats |

The test harness for authentication now substitutes Vite environment values through a TypeScript syntax-tree transform. The previous exact source-text replacement stopped working after formatting. Test behavior and assertions are retained, with an additional assertion that the isolated test environment was actually injected.

Builds report an approximately 701 kB application JavaScript chunk before gzip. This remains a performance optimization opportunity. Static checks cannot establish the absence of every secret or prove external service behavior.

The provenance manifest records 488 copied files, 2 replaced workspace configuration files and 258 excluded raw verification/provider-output files. Only existing curated public images were carried forward; raw browser/account/provider outputs were omitted. Generated dependency folders and build output are ignored by Git. No credentials, repository metadata or old deployment state was copied.

The two original source repositories were read only. This consolidation did not create Git history, publish deployments, change DNS, alter databases, or retest Google OAuth/live providers. Deployment configuration and custom-domain acceptance are separate tasks.
