# Architecture submission

Two files are ready for the assignment form:

| Upload field | File | Size |
| --- | --- | --- |
| Architecture diagram | [ARCHITECTURE.pdf](ARCHITECTURE.pdf) | About 9.4 MB; 58 pages; below 25 MB |
| Describe your architecture (.md file) | [ARCHITECTURE.md](ARCHITECTURE.md) | About 263 KB; below 5 MB |

## What to read

The PDF starts with the current system and proposed roadmap, followed by labelled architecture diagrams for Architect 2.0, 3.0 and 4.0. A fourth diagram describes context and memory. The remaining technical sections specify the agent harness, sandboxing, state, data contracts, authorization, model routing, testing, deployment, company handoffs and private lifecycle. PDF bookmarks support navigation.

The PDF includes compact registers for every canonical feature package, inherited interaction and handoff. The Markdown expands each feature with its 2.0/3.0/4.0 scope, actors, entry, journey, outcome, recovery and architecture responsibility.

## Scope verification

Source: `apps/assignment/data.json`, inspected against implementation commit `72c923c`.

- 16 product areas.
- 109 unique feature packages: 40 enhancements and 69 new proposals.
- First introduction: 65 in 2.0, 42 in 3.0, 2 in 4.0.
- Cumulative packages: 65, 107 and 109. These counts are not three independent totals.
- 422 inherited interaction records, separately counted.
- 228 handoffs, with source and destination references resolved.
- Every package, interaction and handoff ID appears in both upload files.

See [coverage-check.json](coverage-check.json). Source inspection, document completeness and PDF rendering do not establish live integration or production readiness.

## Status and diagrams

Current code, interactive prototypes and proposed capabilities are distinguished. The target includes real repository integration, durable execution, scoped persistent memory, connector actions and private deployment; these are not claimed implemented. Known current limitations include the private runtime packaging issue documented in the submission.

[Diagram prompts](diagrams/PROMPTS.md) record the built-in GPT image-generation prompts. The four PNGs retain transparency, component labels and restrained visual styling. Titles and captions are part of the documents. Python was used only for document assembly, PDF layout and validation, not to draw or modify the architecture diagrams. No SVG or XML diagram source is used.

Website changes are not part of this update. The Architecture and HLD & LLD tabs will be added only after approval.
