# Product UI gaps

Checked against Product UI 1.7.0 (8 October 2026). Each gap below was found on 1.5.0. Product UI 1.6.0 shipped a fix for each of the first five; this app has not adopted them yet.

## Fixed in Product UI, not yet adopted here

- **Breadcrumbs**: `onNavigate(item, event)` (1.6.0) lets the host route with the Next router. Adopted in sidecar-web#23; until that merges, breadcrumb links cause a full page load.
- **WorkspaceShell `headerActions`**: now renders without `heading` (1.6.0). "Get the extension" can move out of the sidebar `footer`.
- **Side panel as its own canvas**: `WorkspaceShell.aside` (1.6.0) renders the panel as a sibling canvas. This app still docks `CollectionPanel` inside the page canvas.
- **Workflow canvas**: `WorkflowCanvas` (1.6.0) covers straight-line steps. It has no branching layout or node movement, so `src/components/workflow/` stays until that is no longer needed. See its README.
- **FilterToolbar search clear**: the themed clear button is automatic from 1.6.0 and already live. Not checked in Safari or Firefox.

## Still open

- **Icons**: `bookmark` exists in the icon set, but it may have no filled state. `src/components/icons.tsx` still has an inline outline and solid bookmark for Save. Check for a filled variant before replacing it.
