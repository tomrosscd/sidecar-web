# Product UI gaps

- **Breadcrumbs** (1.5.0): renders plain anchors with no `onNavigate`, so links reload the page instead of using the Next router. Worked around by using it as is; the cost is a full page load.
- **WorkspaceShell** (1.5.0): `headerActions` only renders when `heading` is passed, and that adds its own `h1`. Pages here use `PageLayout` headings, so the persistent "Get the extension" action lives in the sidebar `footer` instead.
- **Workflow / flow canvas**: Product UI 1.5.0 has no connected-steps or dotted-canvas component. `src/components/workflow/` builds one from `Badge`, `Button` and `--cui-*` tokens, written to move into Product UI later. See its README.
- **FilterToolbar search** (1.5.0): the search field is a native `type="search"` input, so Chrome shows its own clear (x) button, which renders blue-ish and unthemed once text is entered. It has no Product UI styling or token. Not overridden locally; a themed clear control (or suppressing the native one) belongs in Product UI.
- **Icons** (1.5.0): no bookmark icon. `src/components/icons.tsx` has an inline outline/solid bookmark for Save.
