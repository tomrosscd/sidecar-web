# Product UI gaps

Checked against Product UI 1.7.0 on 11 October 2026. Every gap found on 1.5.0 has been closed by Product UI or adopted here, apart from the workflow canvas.

## Closed

- **Breadcrumbs**: links go through the Next router with `onNavigate` (`src/components/router-breadcrumbs.tsx`, `src/lib/client-navigation.ts`).
- **WorkspaceShell header actions**: "Get the extension" is in the title bar through `headerActions`, and `PageLayout` still owns the single `h1`.
- **Side panel as its own canvas**: the prompt panel is the shell's `aside` (`src/components/app-shell.tsx`), so it docks beside the page as a second canvas, and falls back to a full-height panel on narrow screens.
- **FilterToolbar search clear**: the themed "Clear search" button came with 1.6.0 and needed no code. Not checked in Safari or Firefox.
- **Icons**: Save uses Product UI's `bookmark` icon, with `cui-icon-filled` for the saved state.

## Open

- **Workflow canvas**: Product UI 1.6.0 has `WorkflowCanvas` for straight-line steps, with no branching layout or node movement. `src/components/workflow/` still has node offsets (`x`), movable nodes with a keyboard route, and hidden edge labels, which the library version does not offer, so it stays local. Revisit if Product UI adds them. See `src/components/workflow/README.md`.
