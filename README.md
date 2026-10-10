# Sidecar Web

A static prompt library for Convert staff. It replaces SidekickV2, shares its prompt data with the Sidecar Extension, and is built on `@convert/product-ui`.

Status: M1 to M7 built and in review (stacked PRs). See [docs/PLAN.md](docs/PLAN.md) for the milestones and their status.

## What it does

- Prompt library with search, category and featured/recommended filters, and a timeframe and comparison builder. A view is shareable through the query string.
- Prompt pages, collections, saved prompts (stored in this browser only), a Cmd/Ctrl+K palette, and an extension page.
- Prompt data comes from `PROMPTS_URL` at build time (default `https://convert-sidecar-prompts.pages.dev/prompts.json`). Invalid data fails the build. Collections come from the `collections` array in `prompts.json`; the build fails if there are none.
- A hidden skills library, built only when `NEXT_PUBLIC_SHOW_SKILLS=true`.
- `SUBMIT_URL` and the extension link are in `src/config/site.ts`.

Because the data is fetched at build, a new prompt appears on the site after the next build. Nothing rebuilds it on a push or on a schedule. After changing `prompts.json` in the sidecar repo, or the shared app list in `convert-apps`, rebuild by following [RELEASE.md](RELEASE.md), which also says what to record each time.

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

The site is a static export served from Cloud Run at the domain root (leave `NEXT_PUBLIC_BASE_PATH` unset), behind Google's Identity-Aware Proxy (IAP), the same sign-in as Growth Vault and Great Cart. `server/static-server.mjs` serves `out/` and adds the noindex and security headers. It has no sign-in code: IAP decides who gets in.

Tom releases from his machine with `pnpm release`, which rebuilds from the latest prompts and app list, runs the checks, builds the image in Cloud Build and points the service at it. Settings live in `.env.release` (gitignored; copy `.env.release.example`). The Google Cloud setup and the release steps are in [RELEASE.md](RELEASE.md) and [HANDOFF.md](HANDOFF.md).

`prompts.json` stays on Cloudflare Pages at `convert-sidecar-prompts.pages.dev`, with no sign-in, because the browser extension can't sign in. It holds public-safe prompts only. This site is not hosted there.

There is no GitHub Pages or Cloudflare deployment of the site. `.github/workflows/ci.yml` is manual only and fetches Product UI with the `PRODUCT_UI_TOKEN` Actions secret, a read-only token for `tomrosscd/cd-product-ui`. Locally, `pnpm product-ui` and `pnpm apps` use your `gh` login, or `GH_TOKEN` if set.

Base path support (`NEXT_PUBLIC_BASE_PATH`) remains for hosting under a sub-path, but nothing uses it now.

## Not indexed

Every page is `noindex, nofollow` through `metadata.robots` in the root layout, and there is no sitemap. `server/static-server.mjs` sends `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet` on every response and `public/robots.txt` disallows everything.

## Apps

The shell's app switcher is configured in `src/config/apps.ts`.

## Fonts

Like Brand Tools, no font files are committed while the repo is public. Without a self-hosted Roobert the interface uses the Geist then Arial fallback.
