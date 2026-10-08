You're building **Sidecar Web**, a new static prompt library for Convert staff, in this repo (`tomrosscd/sidecar-web`, currently empty). It replaces an old app called SidekickV2. It shares its prompt data with a Chrome extension called **Sidecar Extension**. It's built on Convert's design system, `@convert/product-ui`.

Work in milestones. Open one PR per milestone and don't merge. I review and merge. Keep token use lean: read the specific reference files named below rather than exploring whole repos.

## Rules

- Only write to this repo. These repos are **read-only references**: `tomrosscd/SidekickV2`, `tomrosscd/sidecar`, `tomrosscd/cd-brand-tools`, `tomrosscd/cd-product-ui`. Never push, branch or open PRs on them. Never touch `SebastianKlett/cd_capacity` in any way.
- Australian English. No em dashes in UI copy or docs.
- Product UI first. Use its components and `--cui-*` tokens. Don't fork or restyle its components locally. Record any gap in `docs/product-ui-gaps.md` and work around it minimally.
- No database, no auth, no paid services, no analytics.
- Ask me before adding any dependency beyond those listed under Stack.

## Setup: reference checkouts

Clone the references into a sibling folder outside this repo, for example:

```
mkdir -p ../_ref && cd ../_ref
gh repo clone tomrosscd/SidekickV2
gh repo clone tomrosscd/sidecar
gh repo clone tomrosscd/cd-brand-tools
gh repo clone tomrosscd/cd-product-ui
```

Read first:

- `cd-product-ui/AGENTS.md`
- `cd-product-ui/docs/adopting-in-an-app.md`
- `cd-product-ui/docs/component-catalogue.md` (skim it for components you need)
- `cd-brand-tools/AGENTS.md`
- `cd-brand-tools/package.json`
- `cd-brand-tools/next.config.ts`
- `cd-brand-tools/scripts/fetch-product-ui.mjs`
- `cd-brand-tools/src/app/layout.tsx`
- `cd-brand-tools/src/components/app-shell.tsx`
- `cd-brand-tools/src/lib/base-path.ts`
- `cd-brand-tools/.github/workflows/ci.yml`
- `cd-brand-tools/.github/workflows/pages.yml`
- `sidecar/prompts.json`, `sidecar/prompts.js` (`buildPrompt`, `getCmpText`) and the prompt UI parts of `sidecar/panel.js`: timeframe presets, custom range, comparison, placeholders, follow-ups, and `isValidPayload()`.
- SidekickV2, for features only (its code is old; don't copy its patterns):
  - `components/PromptLibrary.tsx`
  - `app/prompts/[slug]/`
  - `app/collections/`
  - `app/saved/`
  - `app/skills/`
  - `types/index.ts`
  - `lib/utils.ts`
  - `supabase/seed.sql` (collections only)

## Stack

- Next.js 16 App Router with `output: 'export'`. React 19.2, TypeScript strict, pnpm 10, Node 22 or later. Match Brand Tools' versions.
- `@convert/product-ui` **1.6.0**. Install it with a copy of Brand Tools' `scripts/fetch-product-ui.mjs`: same pinned version and SHA-256, run via `pnpm product-ui`, with `vendor/` git-ignored.
- CSS modules on `--cui-*` tokens. No Tailwind, shadcn, Supabase or Resend.
- Vitest and jsdom. Prettier and ESLint as in Brand Tools.
- `NEXT_PUBLIC_BASE_PATH=/sidecar-web` on Pages. Use a `withBase()` helper like Brand Tools'.
- Secret `PRODUCT_UI_TOKEN` already exists on this repo. Use it as `GH_TOKEN` for the Product UI fetch step in CI and Pages workflows.

## Prompt data

- Source of truth: `prompts.json` on Cloudflare Pages (`PROMPTS_URL`; the original brief named a GitHub Pages address). Shape: `{ schema, updated, count, prompts: [{ slug, title, category, description, body, placeholders[], featured, recommended, followUp }] }`. Currently 74 prompts in 10 categories.
- Fetch it **at build time** (`lib/prompts.ts`). Validate it with the same rules as the extension's `isValidPayload()`, plus valid `followUp` slugs. Fail the build on invalid data. There is no committed copy.
- Treat any extra fields as optional. Later the file gains `whenToUse`, `caveats`, `useCases[]`, `dataSources[]`, `level`, `visibility` and a top-level `collections: [{ slug, title, description, promptSlugs[] }]`. Type them as optional now and render them when present.
- Until `collections` exists in `prompts.json`, read collections from `data/collections.json` in this repo, keyed by prompt slug. Pick sensible ones from SidekickV2's seed (Post-Launch Review, BFCM Preparation, and so on) and map them to current slugs. Drop any prompt that no longer exists.
- `{{TF}}` and `{{CMP}}` are filled by the timeframe/comparison builder. `[Bracketed]` text is a user-filled placeholder. **Copied text must match the extension exactly** for the same inputs. Port `buildPrompt`/`getCmpText` and add tests against fixtures generated from the extension's logic.

## Milestones (one PR each)

**M1: Scaffold and deploy an empty shell**

- Next 16 static export, the Product UI fetch script and `styles.css`, `ThemeProvider` (light, `appearance="workspace"`), `WorkspaceShell` with sidebar and `CommandPalette` wiring. Self-host Roobert if Brand Tools does.
- App switcher via `WorkspaceShell` `apps`:
  - `sidecar-web`: "Sidecar Web", `https://tomrosscd.github.io/sidecar-web/`. Mark from `sidecar/icons/`.
  - `brand-tools`: "Brand Tools", `https://cd-brand-tools.pages.dev/`. Copy the Convert mark Brand Tools uses.
  - Keep the list in `src/config/apps.ts`.
- `metadata.robots = { index: false, follow: false }` in the root layout, so every page gets noindex. No sitemap. Note in README that project-level `robots.txt` is ignored on GitHub Pages project sites.
- CI workflow (format check plus `pnpm check`) and Pages workflow (build with base path, upload `out/`), modelled on Brand Tools.
- Add `AGENTS.md` (rules above, condensed), `CLAUDE.md` pointing to it, `README.md`, and `docs/PLAN.md` containing this brief.

**M2: Prompt data layer**

- `lib/prompts.ts` (fetch and validate), types, `lib/build-prompt.ts` (parity port), timeframe and comparison model, and unit tests.

**M3: Library page (`/`)**

- Prompt cards or rows: title, category badge, description, featured and recommended markers.
- Search, category filter, featured and recommended filters.
- Toolbar: timeframe presets, custom range, comparison (previous period, year on year, none). State lives in the query string so a view can be shared.
- Copy button: builds the prompt, asks for any `[placeholder]` values first, copies, shows a toast.
- Use Product UI collection, toolbar and filter patterns (see its `collection-refinements.md` and `list-pages.md`).

**M4: Detail and collections**

- `/prompts/[slug]`, pre-rendered with `generateStaticParams`: full body preview with `{{TF}}`/`{{CMP}}` highlighted, the builder, copy, a copy-link button, follow-up prompt link, and optional metadata when present.
- `/collections` and `/collections/[slug]`.

**M5: Saved, submit, extension, search**

- `/saved`: bookmarks in `localStorage`, every read and write wrapped in try/catch. The page renders correctly when storage is unavailable.
- "Submit a prompt": a link from `src/config/site.ts` `SUBMIT_URL`. Default to `mailto:tom@convertdigital.com.au?subject=Sidecar%20prompt%20submission`. I may swap it for a Google Form.
- `/extension`: what the Sidecar Extension does (Prompts mode, Sidekick Markdown/CSV export), an install button to `https://chromewebstore.google.com/detail/sidecar/nmomnjfjindmlfgilkakhgmciheejbni`, and that it uses the same prompt library. Add a persistent "Get the extension" action in the shell header or sidebar.
- Cmd/Ctrl+K palette searches prompts, collections and pages.

**M6: Skills library, hidden**

- Port the Skills library's types, list and detail pages and components from SidekickV2. Read from markdown files in `content/skills/`, with one example skill.
- Gate them behind `NEXT_PUBLIC_SHOW_SKILLS` (default off). When off, generate no routes and add no nav, palette or links. No uploads or submissions.

**M7: QA and release**

- Check every route at 1440, 1024, 390 and 320px (no horizontal scroll).
- Keyboard pass: palette, filters, copy, dialogs.
- Spot-check parity: the same prompt, timeframe and comparison copied from the extension and from the web app must match.
- `pnpm check` green. Deploy, and confirm the live site loads under `/sidecar-web/` with noindex on every page.
- Update the README and `docs/PLAN.md` with status.

## Out of scope

Login, gating, admin, submissions workflow, version history, analytics, editing `prompts.json` (it lives in the sidecar repo), and any change to other repos.

## When you finish each milestone

Summarise in the PR:

- what changed
- how you verified it, with commands and viewports
- what you didn't verify
- any Product UI gaps found

Then stop and wait for me.

## Status

All seven milestones are merged and the site is live on Product UI 1.7.0. Build and upgrade records are in HANDOFF.md and the pull requests.

Next: the site and the prompt file move from GitHub Pages to Cloudflare, behind sign-in, and this repository becomes private. The extension keeps working throughout: it falls back to its cached prompts.
