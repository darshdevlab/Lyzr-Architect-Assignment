# Architect 3.0 company workflow coverage

Architect 3.0 adds **42 company packages** to the **65 inherited Architect 2.0 packages**: **107 cumulative packages**. The 42 new packages are represented by purposeful domain views and feature-specific configure → review → save → outcome journeys. This is a working prototype, not a claim of production implementation of every integration.

## Working behavior

- Owned company records, edits, history, stage changes, search/filter, archive and restore.
- Company records are saved through the shared Store and restored across reloads. Signed-in saving uses the parent workspace service; demo saving stays in the browser.
- Eleven role homes, configurable department launchpads, project portfolio and blueprint workflows.
- Delivery boards, idea voting, roadmap horizons, linked customer feedback → delivery tasks, commercial review → onboarding handoffs.
- CRM account references, finance currency-separated totals, capacity/leave calculations, metric dashboards from entered data, content and campaign boards.
- Bot hierarchy, conversation history and prompt flow. Signed-in conversation calls the existing AI endpoint; demonstration responses clearly disclose their authored nature.
- Viewer controls disable mutations; the shared backend enforces membership permissions separately.

## Explicit prototype boundaries

Jira/Notion/ChatGPT connection setup, MCP scopes, publishing, messages, procurement/payment, enterprise costs, HR lifecycle changes, scheduled reporting, autonomous bot execution and cloud remediation produce reviewed records/configurations. They do **not** execute these external actions. Provider IDs and evidence must be supplied before recording external confirmation. Department view customization is separate from authorization. No automated employment decisions are made.

## Verification

- 42/42 package configure/review/save/outcome journeys passed in Chrome.
- 126 package-state screenshots, plus area overviews, 11 persona homes and handoff/persistence/bot/dark-mode evidence.
- 10 company unit tests passed and TypeScript passed.
- Zero captured console errors during the completed company pass.
- Regression fixed: company data had been omitted by Store deserialization. Browser reload and a dedicated unit test now verify preservation.

The screenshot manifest is [verification/v3/manifest.json](verification/v3/manifest.json). Browser evidence is [tests/companyflows-browser-report.json](tests/companyflows-browser-report.json). Exact feature mapping is [COVERAGE-3.0.json](COVERAGE-3.0.json). Inherited 2.0 coverage remains in its existing coverage files; the historical 422 baseline entries are traceability references, not 422 new company features.

## Product mapping

| Area | New packages |
|---|---|
| company | ORG-N2, ORG-N4 |
| delivery | PLAN-N1, PLAN-N4, PLAN-N5 |
| botteams | AGENT-N1, AGENT-N3, AGENT-N4, OPS-N2 |
| mcp | DATA-N1, DATA-N2 |
| finance | OPS-N4, FIN-N1, FIN-N2, FIN-N3, FIN-N4, FIN-N5 |
| revenue | CRM-N1, CRM-N2, CRM-N3, CRM-N4, CRM-N5 |
| success | CX-N1, CX-N2, CX-N3, CX-N4, CX-N5 |
| people | PEOPLE-N1, PEOPLE-N2, PEOPLE-N3, PEOPLE-N4 |
| metrics | BI-N1, BI-N2, BI-N3, BI-N4, BI-N5, BI-N6 |
| growth | MKT-N1, MKT-N2, MKT-N3, MKT-N4, MKT-N5 |
