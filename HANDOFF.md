# Handoff: Product UI 1.6.0 upgrade

## Resume here (updated 9 October 2026, Claude Code, Sonnet 5.5)

- Brief: `convert-platform/docs/briefs/02-sidecar-web-cloudflare.md`, M1 and M2 merged, M3 in progress
- Branch: `docs/refresh-gaps-and-handoff` (docs only). Open PRs: this one; [sidecar-web#22](https://github.com/tomrosscd/sidecar-web/pull/22) removes `pages.yml`; [sidecar-web#23](https://github.com/tomrosscd/sidecar-web/pull/23) breadcrumbs via the router; [convert-apps#1](https://github.com/tomrosscd/convert-apps/pull/1) points the switcher at the new address; [sidecar#5](https://github.com/tomrosscd/sidecar/pull/5) extension 2.1.0
- State: brief 01 M1 is live (`https://convert-sidecar-prompts.pages.dev/prompts.json` with CORS, `no-store`, `noindex`). Sidecar Web builds on Cloudflare Pages at `https://convert-sidecar-web.pages.dev/` and is **not yet behind sign-in**. Parity against the new prompts address: 1480 combinations, 0 mismatches
- Cloudflare build settings (Pages, project `convert-sidecar-web`): command `node scripts/fetch-product-ui.mjs && node scripts/fetch-apps.mjs && pnpm install --frozen-lockfile && pnpm build`, output `out`, variables `SKIP_DEPENDENCY_INSTALL=1`, `NODE_VERSION=22`, `GH_TOKEN` (encrypted, read-only). Cloudflare's own install runs before the build command and fails without the Product UI archive, hence the skip
- Next step, in this order (Tom): set up Cloudflare Access with Google sign-in (OAuth client in the Sidekick project, hostnames `convert-sidecar-web.pages.dev` and `*.convert-sidecar-web.pages.dev`, allow emails ending `@convertdigital.com.au`) and confirm sign-in and the preview gate; then merge convert-apps#1 and sidecar-web#22. Then publish extension 2.1.0 (check the Chrome Web Store listing and privacy policy wording, see sidecar#5), wait for it to reach people, and only then make `sidecar` and `sidecar-web` private (brief 02, M4)
- Blockers or questions for Tom: Access setup; whether to adopt `WorkspaceShell headerActions` and `aside` (they change the look; see `docs/product-ui-gaps.md`); delete the merged remote branches (`m1-scaffold` to `m9-workflow-datepicker`, `collections-from-file`, `fix-custom-range-fallback`, `handoff-consumer-record`, the two `upgrade-product-ui` branches)
- Verified this session: both Cloudflare builds succeed; the prompts address returns the right headers; `pnpm check` on each PR; breadcrumb click does not reload (local browser)
- Not verified: Access sign-in; the extension in Chrome (sidecar#5 lists the steps); Safari and Firefox search clear; `/skills/`
- Decisions made: Cloudflare Access (not Cloud Run with IAP) gates Sidecar Web, for the proof of concept; Google as the login method, using the Sidekick project's Internal audience
- Note: the account's free GitHub Actions minutes ran out, so `ci.yml` is manual only. Run `pnpm format:check` and `pnpm check` locally before merging and record the result in the PR

Status: PR open, not merged, not deployed. The live site is not upgraded until the owner merges and the Pages deployment succeeds.

- Branch: `upgrade-product-ui-1.6.0` (from `main` at `ba82e53`)
- Upgrade commit: `2268889`
- PR: [tomrosscd/sidecar-web#16](https://github.com/tomrosscd/sidecar-web/pull/16)

## What changed

- `scripts/fetch-product-ui.mjs`: `VERSION` 1.6.0, SHA-256 `3309fe5389595a1d8a1dc0e653d12038fc59909b05ff3f98c5fd356ff4d89020`. The existing and downloaded bytes are still checked, and a mismatched download is still deleted.
- `package.json`: `file:vendor/convert-product-ui-1.6.0.tgz`.
- `pnpm-lock.yaml`: only the Product UI entries (specifier, version, integrity, tarball). No other package moved.
- `README.md`, `docs/PLAN.md`: version references.
- `src/config/apps.ts`: the Brand Tools switcher link.
- Nothing from 1.6.0 is adopted.

## App switcher URLs

| App         | Before                                        | After                               |
| ----------- | --------------------------------------------- | ----------------------------------- |
| Brand Tools | `https://tomrosscd.github.io/cd-brand-tools/` | `https://cd-brand-tools.pages.dev/` |
| Sidecar Web | `https://tomrosscd.github.io/sidecar-web/`    | unchanged                           |

The switcher lists only these two apps. Sidecar Web stays marked current, and links open in the same tab with no `target` or `rel`, as before.

Requested on 6 October 2026: `https://cd-brand-tools.pages.dev/` returned HTTP 200, `https://tomrosscd.github.io/sidecar-web/` returned HTTP 200, and the old `https://tomrosscd.github.io/cd-brand-tools/` returned HTTP 404.

Other hits for the old Brand Tools address:

- `docs/PLAN.md` line 74 (the brief's description of the switcher entry) also had the old address. Changed to the Cloudflare address on the owner's instruction.
- `AGENTS.md` and `docs/PLAN.md` name the `tomrosscd/cd-brand-tools` repository (a repo name, not a link). Correct as is.
- None in code, workflows, tests, metadata, canonical links or a sitemap (there is no sitemap).

## Checks that ran

| Check                                           | Result                                                                                                                                              |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `shasum -a 256` of an independent download      | Matched the pin and the release `SHA256SUMS`                                                                                                        |
| `pnpm product-ui` (the repo's own fetch script) | "downloaded and verified"                                                                                                                           |
| `pnpm install --frozen-lockfile`                | Passed; installed package reports 1.6.0                                                                                                             |
| `pnpm format:check`                             | Passed                                                                                                                                              |
| `pnpm check` (type-check, lint, test, build)    | Passed; 9 test files, 461 tests                                                                                                                     |
| `NEXT_PUBLIC_BASE_PATH=/sidecar-web pnpm build` | Passed; 85 static pages; output has the Cloudflare address and no old address                                                                       |
| Markup diff, 1.5.0 build vs 1.6.0 build         | 6 routes: identical apart from asset hashes and inline script payloads                                                                              |
| Compiled CSS diff                               | No rule removed or changed; 20 new rules, all for components this app does not use (dropzone, workflow canvas, workspace panels)                    |
| Browser, 1440, 1024, 390 and 320px              | 6 routes at each width (24 pages): switcher opens, Brand Tools points at the Cloudflare address, Sidecar Web marked current, no horizontal overflow |

Routes: `/`, `/collections/`, `/collections/post-launch-review/`, `/prompts/executive-performance-summary/`, `/extension/`, `/saved/`. `/skills/` is hidden behind `NEXT_PUBLIC_SHOW_SKILLS` and was not built or reviewed.

## Behaviour changes in 1.6.0 that affect this app

1. **Search clear button (visible change).** The library search now shows Product UI's themed "Clear search" button once text is entered. In 1.5.0 the field had only Chrome's native clear. This is automatic, not opt-in, so it is in this upgrade. Checked on desktop: one themed button, clearing empties the field, keeps focus in it and removes `?q=` from the URL. It was not checked in Safari or Firefox.
2. **`WorkspaceShell` title bar.** Not affected. This app passes neither `headerActions` nor `heading` to `WorkspaceShell` (`src/components/app-shell.tsx`), so no page gains a title bar.

## 1.6.0 features not adopted, and what they could replace

Left in place on purpose. This app's locally owned node offsets and hidden edge labels are not to be promoted into the library.

- `Breadcrumbs onNavigate`: would remove the full page load on breadcrumb links.
- `WorkspaceShell aside`: could replace the docked `CollectionPanel` and give the panel its own canvas.
- `WorkflowCanvas`: could replace `src/components/workflow/` for straight-line steps. It has no branching layout or node movement.
- `WorkspaceShell headerActions` without `heading`: would allow moving "Get the extension" out of the sidebar footer.
- `FileUpload variant="dropzone"`: not used here.

`docs/product-ui-gaps.md` still describes 1.5.0 and was not edited. One correction for it: the icon set has a `bookmark` icon in both 1.5.0 and 1.6.0 (`icon.d.ts`), so the "no bookmark icon" gap may be wrong. Not checked whether it has a filled state, so `src/components/icons.tsx` was left alone.

## Part 0 inventory (work not on `main`)

Taken before the upgrade, 6 October 2026. Working tree clean, no stashes, one worktree.

| Item                                                             | State before                                             | What I did                   | State after                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------- | ---------------------------- | ------------------------------------------- |
| Working tree on `collections-from-file`                          | Clean                                                    | Nothing                      | Clean                                       |
| Stashes                                                          | None                                                     | Nothing                      | None                                        |
| `collections-from-file` (local and remote)                       | Pushed; PR #15 merged; 1 behind main (the merge)         | Nothing                      | Pushed, fully in `main`                     |
| `main` (local)                                                   | Behind `origin/main` by 2                                | Fast-forwarded the local ref | Matches `origin/main` at `ba82e53`          |
| `fix-custom-range-fallback`                                      | Pushed; 0 ahead of main                                  | Nothing                      | Pushed, fully in `main`                     |
| `handoff-consumer-record`                                        | Pushed; 0 ahead of main                                  | Nothing                      | Pushed, fully in `main`                     |
| `m1-scaffold` to `m9-workflow-datepicker` (9 branches)           | Pushed; each 0 ahead of main                             | Nothing                      | Pushed, fully in `main`                     |
| Open PRs #2 to #7 (M2 to M7, stacked)                            | Open, mergeable; their branches are already in `main`    | Left open, did not merge     | Open, left for the owner to close           |
| `docs/platform-planning`, `docs/remove-suite-plan` (remote only) | Deleted on the remote by the time of `git fetch --prune` | Nothing                      | Gone from the remote; never existed locally |

No unpushed commits and no uncommitted changes were found, so nothing needed pushing. Nothing touched the Product UI dependency, the fetch script, the switcher, the shell or the local workarounds beyond what is already merged.

## Not verified

- The deployed site. Nothing was deployed; Pages and the `PRODUCT_UI_TOKEN` secret were not exercised.
- Browser review used a local static server on a Chromium-based pane, with emulated widths. Not checked: physical devices, Safari, Firefox, screen readers, keyboard-only use of the new search clear.
- The switcher link was requested with `curl` (HTTP 200) but not clicked through to a rendered Brand Tools page.
- The 1.5.0 comparison is a markup and compiled-CSS diff plus the search check, not a pixel-by-pixel screenshot diff.
- `/skills/` (hidden route) was not reviewed.
