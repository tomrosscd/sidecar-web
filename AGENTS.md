# Sidecar Web: contribution rules

Read [docs/PLAN.md](docs/PLAN.md) (the approved brief and milestones) before starting work.

## Boundaries

- Only write to this repo. `tomrosscd/SidekickV2`, `tomrosscd/sidecar`, `tomrosscd/cd-brand-tools` and `tomrosscd/cd-product-ui` are read-only references. Never touch `SebastianKlett/cd_capacity`.
- One PR per milestone. Do not merge; the owner reviews and merges. Do not push to `main` after the initial commit.
- Ask before adding any dependency beyond Next, React, `@convert/product-ui`, Vitest, jsdom, Prettier and ESLint.
- No database, auth, paid services or analytics.

## Interface

- Product UI first: use its components and `--cui-*` tokens, with CSS modules. No Tailwind or shadcn. Never fork or restyle a Product UI component; record gaps in `docs/product-ui-gaps.md` and work around them minimally.
- Australian English. No em dashes in UI copy or docs.
- Every page carries noindex through the root layout `metadata.robots`. No sitemap.

## Prompt data

- Source of truth is `https://tomrosscd.github.io/sidecar/prompts.json`, fetched at build time and validated; invalid data fails the build. No committed copy.
- Copied prompt text must match the Sidecar Extension exactly for the same inputs.

## Code

- Strict TypeScript, named exports, kebab-case filenames, single quotes, no semicolons. Run `pnpm format`.
- Framework-free logic lives in `src/lib` with Vitest coverage in `tests/`.
- Run `pnpm check` before opening a PR. State in the PR what was and was not verified.
- Product UI is pinned and fetched by `pnpm product-ui` into the git-ignored `vendor/`. Never commit the archive.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
