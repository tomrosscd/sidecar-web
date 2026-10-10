# Handoff

## Resume here (updated 10 October 2026, Claude Code, Sonnet 5.5)

- Decision (Tom, 10 October 2026): no Cloudflare Access or Zero Trust (it needs a billing account). Sidecar Web moves to Cloud Run behind Google IAP, like Growth Vault. `prompts.json` stays on Cloudflare Pages, public, for the extension.
- Branch: `move-to-cloud-run`. It adds `server/static-server.mjs` (serves `out/`, noindex headers, tested in `tests/static-server.test.ts`), `Dockerfile`, `cloudbuild.yaml`, `.gcloudignore`, `.dockerignore`, `.env.release.example`, `scripts/release.sh` (`pnpm release`), and rewrites `RELEASE.md`. `public/_headers` is removed because the server sends those headers.
- State: nothing has been run against Google Cloud, and the Docker image has not been built (no Docker on the agent's machine). The static server is covered by tests.
- Next step (Tom): run the commands in "Google Cloud setup" below, run `pnpm release` once, deploy the first Cloud Run service, sign in, and check a prompt page. Then tell the agent the service address.
- After that (agent): change the `sidecar-web` address in `convert-apps` (`apps.json`) to the Cloud Run address, rebuild, and record the first release row. Then retire the Cloudflare Pages project `convert-sidecar-web`: it is public today, so delete it (or at least disable its production deployments) once the Cloud Run site works. Leave `convert-sidecar-prompts`.
- Later: both repos go private, as before.
- Verified 11 October 2026, without Docker: `pnpm check` on `main` passes (491 tests); `server/static-server.mjs` run on a free port against a fresh build. Pages (with and without a trailing slash), the 404 page, `robots.txt`, noindex, nosniff and referrer headers, long-cache `_next/static` files, POST refused (405), HEAD, and six path-traversal attempts (all 404, none read a file outside `out/`). In a browser through that server, sidebar and collection navigation work without a page reload and with no console errors. Not verified: the Docker build, Cloud Run and IAP.

## Google Cloud setup (Tom)

Agents never change IAM or live services, and none of this has been run. Replace the placeholders. Every command names the project. The values are Google Cloud details, so they stay out of git: use them in your terminal and in `.env.release`, not in a commit. Use the same project, region, build service account and staging bucket as Growth Vault and Great Cart.

| Placeholder                    | Meaning                                              |
| ------------------------------ | ---------------------------------------------------- |
| `PROJECT_ID`, `PROJECT_NUMBER` | The Google Cloud project that already hosts the apps |
| `REGION`                       | The same region as the other apps                    |
| `BUILDER_ACCOUNT`              | The build service account the other apps already use |
| `STAGING_BUCKET`               | The build staging bucket the other apps already use  |

Sidecar Web needs no storage bucket and no environment variables: it serves files and holds no data. Its runtime account needs no roles.

```bash
gcloud iam service-accounts create sidecar-web-runtime --project=PROJECT_ID --display-name="Sidecar Web runtime"
```

```bash
gcloud artifacts repositories create sidecar-web --repository-format=docker --location=REGION --project=PROJECT_ID
```

```bash
gcloud artifacts repositories add-iam-policy-binding sidecar-web --location=REGION --project=PROJECT_ID --member=serviceAccount:BUILDER_ACCOUNT --role=roles/artifactregistry.writer
```

Fill in `.env.release` (copy `.env.release.example`), then run `pnpm release` once. It builds and uploads the image but the first `gcloud run services update` fails because the service does not exist yet. Create the service from the image instead:

```bash
gcloud run deploy sidecar-web --image=REGION-docker.pkg.dev/PROJECT_ID/sidecar-web/app:COMMIT_SHA --region=REGION --project=PROJECT_ID --service-account=sidecar-web-runtime@PROJECT_ID.iam.gserviceaccount.com --no-allow-unauthenticated --iap --min-instances=0 --max-instances=2
```

If `--iap` is not accepted on your gcloud version, deploy without it, then in the Cloud Run console open the service, Security, and choose **Require authentication, then Identity-Aware Proxy (IAP)**, as for Growth Vault. Never allow unauthenticated access and never add `allUsers`.

**IAP access: Tom only to start.** Grant yourself, and nobody else, until the checks below pass:

```bash
gcloud iap web add-iam-policy-binding --resource-type=cloud-run --service=sidecar-web --region=REGION --project=PROJECT_ID --member=user:tom@convertdigital.com.au --role=roles/iap.httpsResourceAccessor
```

Check who has access:

```bash
gcloud iap web get-iam-policy --resource-type=cloud-run --service=sidecar-web --region=REGION --project=PROJECT_ID
```

Google's "You don't have access" page means the person is not on that list. Opening it to staff is a launch step: grant `domain:YOUR_STAFF_DOMAIN` the **IAP-secured Web App User** role, as in the launch checklist in `convert-platform/docs/suite-standards.md`.

Check before telling anyone: open the service address in a private window (it should ask for Google sign-in), sign in as yourself and open a prompt page, then try a second Google account that is not on the list (it should be refused).

The Cloud Run spend cap covers every Cloud Run service in the project.

## Rollback

Never allow unauthenticated access as a recovery shortcut.

- **A release is bad:** point the service at the last good image. The tags are the short commit hashes in the release record below.

```bash
gcloud run services update sidecar-web --image=REGION-docker.pkg.dev/PROJECT_ID/sidecar-web/app:OLD_TAG --region=REGION --project=PROJECT_ID
```

- **Fix forward** if the cause is in the code or data: correct it on `main` (or in `prompts.json`) and release again as in [RELEASE.md](RELEASE.md).
- **App switcher points at a bad address:** change the one `href` for the `sidecar-web` entry in `convert-apps` back.
- **Sign-in breaks:** fix the IAP access list. Do not remove IAP.

## Release record

One row per release. See [RELEASE.md](RELEASE.md) for how to fill it in. No Cloud Run release has been recorded yet.

| Date | `prompts.json` `updated` | Prompts | `convert-apps` commit | Image tag | By  |
| ---- | ------------------------ | ------- | --------------------- | --------- | --- |
|      |                          |         |                       |           |     |

## Earlier: Product UI 1.6.0 upgrade, 8 October 2026

Status: historical (the 1.6.0 upgrade; the site is now on 1.7.0).

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
