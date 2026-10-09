# Sidecar Web

A static prompt library for Convert staff. It replaces SidekickV2, shares its prompt data with the Sidecar Extension, and is built on `@convert/product-ui`.

Status: M1 to M7 built and in review (stacked PRs). See [docs/PLAN.md](docs/PLAN.md) for the milestones and their status.

## What it does

- Prompt library with search, category and featured/recommended filters, and a timeframe and comparison builder. A view is shareable through the query string.
- Prompt pages, collections, saved prompts (stored in this browser only), a Cmd/Ctrl+K palette, and an extension page.
- Prompt data comes from `PROMPTS_URL` at build time (default `https://convert-sidecar-prompts.pages.dev/prompts.json`). Invalid data fails the build. Collections come from the `collections` array in `prompts.json`; the build fails if there are none.
- A hidden skills library, built only when `NEXT_PUBLIC_SHOW_SKILLS=true`.
- `SUBMIT_URL` and the extension link are in `src/config/site.ts`.

Because the data is fetched at build, a new prompt appears on the site after the next build. Cloudflare rebuilds on every push to `main`. After changing `prompts.json` in the sidecar repo, trigger a rebuild from the Cloudflare project's Deployments page (or a deploy hook), and the same for a change to the shared app list, which is also read at build time.

## Run locally

Requires Node 22.22.2 or later, pnpm, and the GitHub CLI signed in with an account that can read `tomrosscd/cd-product-ui`.

```sh
pnpm product-ui
pnpm install
pnpm dev
```

`pnpm product-ui` downloads the pinned Product UI 1.7.0 archive into the git-ignored `vendor/` and verifies its SHA-256. Run it first on a fresh checkout.

## Checks

```sh
pnpm format:check
pnpm check
```

`pnpm check` runs type-check, lint, tests and a static build.

Parity with the extension: `tests/fixtures/extension-parity.json` is generated from the extension's own `prompts.js` by `node scripts/generate-parity-fixtures.mjs`. To spot-check every live prompt against the extension, run `node --experimental-strip-types scripts/parity-live.mjs`.

## Hosting

The site is a static export, built on Cloudflare Pages at the domain root (leave `NEXT_PUBLIC_BASE_PATH` unset) and gated by Cloudflare Access. Cloudflare build settings:

- Build command `node scripts/fetch-product-ui.mjs && node scripts/fetch-apps.mjs && pnpm install --frozen-lockfile && pnpm build`, output directory `out`. Cloudflare's automatic install runs before the build command and fails because the Product UI archive is not in `vendor/` yet, so set `SKIP_DEPENDENCY_INSTALL=1` and install in the build command after the fetch.
- Variables: `SKIP_DEPENDENCY_INSTALL` (1), `NODE_VERSION` (22), `GH_TOKEN` (a read-only token for the private Product UI and app list repositories; `pnpm product-ui` and `pnpm apps` use the GitHub API when it is set, so the build needs no `gh` CLI) and, optionally, `PROMPTS_URL`.

There is no GitHub Pages deployment. `.github/workflows/ci.yml` is manual only and fetches Product UI with the `PRODUCT_UI_TOKEN` Actions secret, a read-only token for `tomrosscd/cd-product-ui`.

Base path support (`NEXT_PUBLIC_BASE_PATH`) remains for hosting under a sub-path, but nothing uses it now.

## Not indexed

Every page is `noindex, nofollow` through `metadata.robots` in the root layout, and there is no sitemap. `public/_headers` sends `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` and `public/robots.txt` disallows everything, for hosts that honour them.

## Apps

The shell's app switcher is configured in `src/config/apps.ts`.

## Fonts

Like Brand Tools, no font files are committed while the repo is public. Without a self-hosted Roobert the interface uses the Geist then Arial fallback.
