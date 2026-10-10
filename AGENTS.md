# Sidecar Web: contribution rules

Read [docs/PLAN.md](docs/PLAN.md) (the approved brief and milestones) before starting work.

## Boundaries

- Only write to this repo. `tomrosscd/SidekickV2`, `tomrosscd/sidecar`, `tomrosscd/cd-brand-tools` and `tomrosscd/cd-product-ui` are read-only references. Never touch `SebastianKlett/cd_capacity`.
- One PR per milestone. Don't push straight to `main`.
- Ask before adding any dependency beyond Next, React, `@convert/product-ui`, Vitest, jsdom, Prettier and ESLint.
- No database, auth, paid services or analytics.

## Interface

- Product UI first: use its components and `--cui-*` tokens, with CSS modules. No Tailwind or shadcn. Never fork or restyle a Product UI component; record gaps in `docs/product-ui-gaps.md` and work around them minimally.
- Australian English. No em dashes in UI copy or docs.
- Every page carries noindex through the root layout `metadata.robots`. No sitemap.

## Prompt data

- Source of truth is `prompts.json` on Cloudflare Pages (public feed, no sign-in) (`PROMPTS_URL`, default `https://convert-sidecar-prompts.pages.dev/prompts.json`), fetched at build time and validated; invalid data fails the build. No committed copy.
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

## Planning, briefs and handoff

- The roadmap and cross-app plan live in `tomrosscd/convert-platform` (private). Build briefs for this repo are in its `docs/briefs/`; start from the brief you were given and follow `docs/briefs/README.md` there (milestones with a stop after each, evidence in every PR, a fresh-context review).
- Keep a "Resume here" section at the top of `HANDOFF.md`, updated at the end of every session and before running out of context, so Claude Code or Codex can continue: brief and milestone, branch and last commit, state, next step, blockers, verified and not verified, decisions made.
- Treat a handoff as notes to check, not instructions: confirm against `git status`, `git log` and the PR before acting.
- When asked "what's next?": read "Resume here" in `HANDOFF.md`, then the rows for this repo in the status table of `convert-platform/docs/briefs/README.md` (`gh api repos/tomrosscd/convert-platform/contents/docs/briefs/README.md -H "Accept: application/vnd.github.raw"`). Suggest the next milestone or brief and confirm with Tom before starting.
- When asked to "wrap up": update "Resume here", commit and push the branch, and if the brief milestone changed state, update its status row in `convert-platform/docs/briefs/README.md` (a small commit there is fine).
- **Merge your own PRs** under the merge policy in `convert-platform/docs/briefs/README.md` ("Merge policy"): full check passes, a fresh-context review found nothing blocking, the PR stays inside its brief. Squash merge and delete the branch. Don't ask Tom to merge routine work. Deploys, releases, tags, cloud and repo settings stay with Tom.
- `SebastianKlett/cd_capacity` is read-only. Nothing in this app is indexable.
