# Evidence and source provenance

`source-manifest.json` records every tracked entry in the two original repositories, its source commit, destination, or exclusion reason. This is a source-copy inventory, not an assertion that every feature works.

- `showcase-assets/` contains the previously published, curated assignment images. The assignment build copies this directory to `apps/assignment/dist/assets`; there is no second source copy.
- `assignment/` contains the feature-to-image table and historical browser checks.
- `platform/` contains historical coverage data. Scope counts measure feature packages and documented journeys, not full production implementations.
- `../history/` preserves original documentation. Old repositories, URLs, dates and verification claims in this directory are historical context, not current deployment instructions.

Raw platform verification images, DOM snapshots, generated app test outputs and provider/database result dumps are intentionally excluded. They are not needed to run the project and may contain account or session details. Their original paths remain in the source manifest without copying their contents. Curated public images can still show the earlier interface and are historical evidence, not screenshots of this consolidated release.

Do not place credentials, private accounts, customer content or unreviewed browser captures here. Review new screenshots before publication. Current deployment URLs belong in `apps/platform/src/lib/edition.ts` and `apps/assignment/config.json`.

## Architect mascot

The user-requested hard-hat mascot is the original vector asset from https://www.architect.new/architect-mascot.svg, retrieved on 27 September 2026. Unmodified copies are used for the platform brand, support launcher and assignment identity. This remains an independent hiring prototype, not the official Lyzr service.
