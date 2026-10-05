# Sidecar Web

A static prompt library for Convert staff. It replaces SidekickV2, shares its prompt data with the Sidecar Extension, and is built on `@convert/product-ui`.

Status: milestone M1 (empty shell). See [docs/PLAN.md](docs/PLAN.md) for the milestones.

## Run locally

Requires Node 22.22.2 or later, pnpm, and the GitHub CLI signed in with an account that can read `tomrosscd/cd-product-ui`.

```sh
pnpm product-ui
pnpm install
pnpm dev
```

`pnpm product-ui` downloads the pinned Product UI 1.5.0 archive into the git-ignored `vendor/` and verifies its SHA-256. Run it first on a fresh checkout.

## Checks

```sh
pnpm format:check
pnpm check
```

`pnpm check` runs type-check, lint, tests and a static build.

## Hosting

`main` deploys to GitHub Pages at https://tomrosscd.github.io/sidecar-web/ through `.github/workflows/pages.yml` (Pages source: GitHub Actions). The site is a static export. To preview the Pages build locally:

```sh
NEXT_PUBLIC_BASE_PATH=/sidecar-web pnpm build
```

Both workflows fetch Product UI using the `PRODUCT_UI_TOKEN` Actions secret, a read-only token for `tomrosscd/cd-product-ui`.

## Not indexed

Every page is `noindex, nofollow` through `metadata.robots` in the root layout, and there is no sitemap. A project-level `robots.txt` is ignored on GitHub Pages project sites (only the root of the user site is honoured), so the meta tag is the control.

## Apps

The shell's app switcher is configured in `src/config/apps.ts`.

## Fonts

Like Brand Tools, no font files are committed while the repo is public. Without a self-hosted Roobert the interface uses the Geist then Arial fallback.
