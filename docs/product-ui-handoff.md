# Product UI handoff: findings from building Sidecar Web

Paste this into a session opened in `tomrosscd/cd-product-ui`. It has two tasks: record Sidecar Web as a consumer (Task A), then triage the gaps found while building it (Task B). Everything was found against 1.5.0. Details and workarounds are in [product-ui-gaps.md](product-ui-gaps.md). Sidecar Web did not fork or restyle any Product UI component for these.

## Task A: record a new consumer

Paste this as the first message of the session.

```
Record a new consumer of @convert/product-ui: tomrosscd/sidecar-web ("Sidecar Web"), contact Tom Ross.

Read CONSUMERS.md and follow its existing format and evidence rules. Verify read-only from sidecar-web: package.json, the scripts/fetch-product-ui.mjs version and SHA-256, the lockfile, and the latest Pages deploy run via `gh run list -R tomrosscd/sidecar-web`. Record only what you verified and mark the rest unverified.

Also check sidecar-web's docs/product-ui-gaps.md. For each gap, say whether an existing Product UI component already covers it or whether it should become a roadmap item. Report that in the PR description; don't build anything.

Change only CONSUMERS.md (and HANDOFF.md if its rules require it). Branch, open a PR, and don't merge.
```

Facts as seen from Sidecar Web on 5 October 2026, to check rather than copy. They are a head start, not evidence:

- Package: `@convert/product-ui` 1.5.0, installed as `file:vendor/convert-product-ui-1.5.0.tgz` (package.json and pnpm-lock.yaml).
- Fetched by `scripts/fetch-product-ui.mjs` (copied from Brand Tools): VERSION `1.5.0`, SHA-256 `1f7109bcae35b9fe96d80d8f7709e95a0b58cbfb169c70d07d472258991ecb63`. The `PRODUCT_UI_TOKEN` Actions secret is used as `GH_TOKEN` in CI and Pages.
- App: a static Next.js 16 export on GitHub Pages at https://tomrosscd.github.io/sidecar-web/ (the repo is public, so the archive is never committed). Uses `ThemeProvider` (light, workspace appearance), `WorkspaceShell` with the app switcher, `CommandPalette`, `PageLayout`, `FilterToolbar`, `CollectionPanel`, `Card`, `ContentList`, `Grid`, `Stack`, `DatePicker`, `Select`, `Input`, `Textarea`, `Button`, `Icon`, `Badge`, `Progress`, `Alert`, `EmptyState`, `ToastRegion`, `Breadcrumbs`, `KeyValueList` and `SegmentedControl` (list taken from the source imports; re-check).
- Uses no fork or local restyle of a Product UI component. It has local components for things Product UI lacks (see the gaps file).
- Contact: Tom Ross.
- Latest Pages deploy seen: a successful run for commit `dd18478`. Re-check with `gh run list -R tomrosscd/sidecar-web`.

## Task B: triage the gaps

Read AGENTS.md and docs/ai-guidance.md first. For each item below, check the claim against the source, then decide whether it is a defect, an addition or a no. Open one branch and PR per item, or per small group (items 3 to 6 are small). Task A comes first and is report-only. Do not change anything in `tomrosscd/sidecar-web`. Sidecar Web upgrades to the new Product UI release in its own PR afterwards, and removes its workaround then.

## Items

### 1. Workflow canvas (new component), largest

Connected steps on a dotted canvas. A working version, written to move into Product UI, is in `sidecar-web/src/components/workflow/` (`workflow-canvas.tsx`, its CSS module and a README listing what is left to decide). It uses only `Badge`, `Button` and `--cui-*` tokens. Open questions are in that README: public props, tones, layout and branching, stories, a visual and interaction review, 320px, reduced motion, touch dragging and a screen reader pass. The layout idea comes from the Flowchart on beautifului.dev; no code was copied.

### 2. Side panel as its own canvas (`WorkspaceShell` + `CollectionPanel`)

`WorkspaceShell` draws one white page canvas, and `CollectionPanel` docks inside it with a border. The Sidekick/Polaris pattern is two canvases with a gap. Proposal: an `aside` slot on `WorkspaceShell` that renders a second canvas beside `.cui-workspace-canvas` (same radius, border and gap, page canvas narrowing to suit), with `CollectionPanel` rendering into it. Keep the modal fallback below the minimum content width.

### 3. FilterToolbar search: native clear button

The search field is a native `type="search"` input, so Chrome draws its own clear (x), which looks blue and unthemed. Either suppress the native one and provide a themed clear control, or style it with a token. Check it against the compact toolbar's own Escape-to-clear behaviour.

### 4. Breadcrumbs: no `onNavigate`

Breadcrumbs renders plain anchors, so a Next.js app gets a full page load. `WorkspaceShell` and `DashboardSidebar` already have `onNavigate`; Breadcrumbs should match.

### 5. WorkspaceShell `headerActions` only renders with `heading`

`headerActions` shows only when `heading` is passed, and `heading` adds an `h1`. A page using `PageLayout headingOwner="page"` therefore cannot place a persistent action in the shell header without a second `h1`. Consider rendering `headerActions` without a heading, or a separate slot.

### 6. Icons: bookmark

There is no bookmark icon. Sidecar Web has an inline outline and solid SVG in `src/components/icons.tsx`. Add `bookmark` to the icon set, with a filled state if the set supports one.

## Also noted (not gaps)

- `Dialog` focuses its Close button on open rather than the first field.
- The compact `FilterToolbar` has no labelled slot for settings that change content rather than filter it, so Sidecar Web uses `PageLayout`'s `summary` slot for its date range and comparison controls. Worth a recipe in the docs rather than a component.
