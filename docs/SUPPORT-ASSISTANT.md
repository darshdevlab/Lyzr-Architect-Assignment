# Home support assistant

The support launcher is shown on the Your workspace home view in all three editions. It is hidden on other sections and while account/configuration dialogs are open. The conversation lasts for the current app session and is cleared on an account change; support text is not added to project documents.

Signed-in questions call the existing authenticated `/api/generate` endpoint with `mode: support`. The server adds the trusted product guide from `src/lib/support-knowledge.json`; it does not trust client text for capability claims. The existing free-model catalog, server credential, account verification and database quota apply. Support requests consume the same AI allowance as generation. Provider errors retain the question for retry. No project data is automatically attached.

Demo users receive explicitly labeled saved-guide answers, not AI responses. The assistant cannot execute actions, access customer records, create support tickets or contact a human. The UI identifies AI and warns against sharing passwords or keys.

Checks: TypeScript and production build; backend tests covering the support guide, untrusted history separation, quota use and zero-price routing; browser checks for Home-only visibility, open/close, topic responses, mascot loading and mobile fit. These do not certify the correctness of every model answer or guarantee provider availability.
