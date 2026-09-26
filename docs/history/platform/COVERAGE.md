# Architect 2.0 workflow coverage

65 uniquely allocated v2 feature packages have feature-specific configuration, review, outcome and direct handoff definitions. The nine Workbench products implement 58 packages; Build Studio implements the seven BUILD packages separately.

## Browser verification

All 58 Workbench workflows completed configure → review → save → outcome through the real browser UI, with zero captured console errors. All 22 detailed configuration sections opened and saved. The agent canvas passed template loading, node addition, undo/redo, structured settings, demo rehearsal and persistence after reload. Eight workflow unit tests pass, including field validation, parameter bounds, listing limits, unique IDs and malformed/cyclic graph rejection. See tests/workflow-browser-report.json.

## Functional boundaries

Working project interactions include editable PRD/TRD with history; application source edits and checkpoints; context/source/transcript exports; project configuration persistence; lists of service/agent/source/member drafts; a drag-and-drop app-agent canvas with 33 node types and 9 templates; structured node configuration and JSON import/export; live AI document drafting, source review and prompt-only agent playground when signed in with an available model. Demo mode uses labeled authored examples.

Independent browser tests, production security scanning, remote repository pushes/merges, OAuth grants, external agent runtime execution, schedules, provisioning, generated-app deployments, purchases and invitation delivery are interactive prototypes unless a separate live adapter explicitly supplies those capabilities. AI source review is not browser execution or a security certification.

The project stores workflow configuration in Project.workflow, so it participates in the shared workspace save path. Authenticated workspaces do not read old browser-only workflow data. Demo workspaces alone may migrate their project-scoped legacy data. With no project selected, account/profile controls remain available in the shell and project workflow controls ask the user to select a project.

## Baseline traceability

COVERAGE.json preserves all 422 explored/documented baseline controls and their evidence status. Twenty-two detailed configuration sections preserve many small baseline settings: agent instructions, examples and output schemas; memory, grounding, safety and voice; A2A cards and masked API references; model sampling parameters; knowledge/context and data identity; repository/environment choices; release listing limits and cost disclosure; usage/audit and account budget preferences.

This mapping is not a claim that each of the 422 historical microcontrols has been individually reimplemented or browser-certified. Provider-dependent or previously unavailable capabilities remain explicitly marked configuration/prototype/soon. Historical screenshots, exact58 theme presets, external documentation/community destinations and every original marketplace listing are not copied into the new design. Broader company operations remain scoped to 3.0 and installing Architect itself remains scoped to 4.0.
