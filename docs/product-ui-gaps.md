# Product UI gaps

- **Breadcrumbs** (1.5.0): renders plain anchors with no `onNavigate`, so links reload the page instead of using the Next router. Worked around by using it as is; the cost is a full page load.
- **WorkspaceShell** (1.5.0): `headerActions` only renders when `heading` is passed, and that adds its own `h1`. Pages here use `PageLayout` headings, so the persistent "Get the extension" action lives in the sidebar `footer` instead.
- **Workflow / flow canvas**: Product UI 1.5.0 has no connected-steps or dotted-canvas component. The collection workflow uses `Card`, `Progress` and `Badge` with a local CSS module (`workflow-flow.module.css`) for the dotted background and connectors, using `--cui-*` tokens only.
