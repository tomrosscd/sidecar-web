# Convert internal apps: plan

Owner: Tom Ross. Drafted 5 October 2026. Status: agreed direction, phase 1 not started.

## Goal

Make Convert's internal tools look and behave as one suite by putting them all on `@convert/product-ui` and linking them with its `AppSwitcher`. Apps stay separate repos and deployments. Shared login and shared data come later.

## The apps

| App               | Repo                          | Role                                           | Product UI          | Hosting                    |
| ----------------- | ----------------------------- | ---------------------------------------------- | ------------------- | -------------------------- |
| Sidecar Web       | `tomrosscd/sidecar-web` (new) | Website prompt library, replaces SidekickV2    | 1.5.0 (to build)    | GitHub Pages               |
| Sidecar Extension | `tomrosscd/sidecar`           | Chrome side panel: prompts and Sidekick export | Tokens only (later) | Chrome Web Store, unlisted |
| Brand Tools       | `tomrosscd/cd-brand-tools`    | Brand guide, assets, stack and gradient tools  | 1.5.0               | GitHub Pages               |
| CD Capacity       | `SebastianKlett/cd_capacity`  | Resourcing, CRM, client hub                    | 1.3.3               | Vercel (Seb)               |
| SidekickV2        | `tomrosscd/SidekickV2`        | Old site. Feature reference only, then archive | none                | none                       |

Extension listing: https://chromewebstore.google.com/detail/sidecar/nmomnjfjindmlfgilkakhgmciheejbni

## Ground rules

- **No code changes in cd_capacity.** No branches, PRs or edits. Read-only reference. Seb owns it.
- No paid hosting or database for now.
- No Google sign-in yet, in any app.
- Seb has not agreed to Capacity being the shared login or client source. Treat that as a later conversation.
- Ignore the standalone `convert-client-hub` repo. The client hub is rolling into Capacity (Seb's PR #31).

## Sequence

### Phase 1: Sidecar Web on Product UI 1.5

Rebuild SidekickV2's functionality as a new app on Product UI. Borrow setup patterns from Brand Tools where they are better; do not share code with it.

**Setup**

- Next.js 16 App Router with `output: 'export'`, React 19.2, TypeScript strict, pnpm, Node 22 or later.
- `@convert/product-ui` 1.5.0, installed through a copy of Brand Tools' `scripts/fetch-product-ui.mjs` (pinned version and SHA-256, `gh release download`).
- CI secret `PRODUCT_UI_TOKEN`: read-only access to `tomrosscd/cd-product-ui`.
- Styling: CSS modules on `--cui-*` tokens. No Tailwind, shadcn, Supabase or Resend.
- Shell: `ThemeProvider` and `WorkspaceShell`, with `CommandPalette` on Cmd/Ctrl+K.
- `NEXT_PUBLIC_BASE_PATH=/sidecar-web` for Pages. GitHub Actions for CI (`pnpm check`) and the Pages deploy.
- Tests: Vitest and jsdom.

**In scope**

| Feature                                                                         | Source of behaviour                                  | Notes                                       |
| ------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------- |
| Prompt library: grid, search, category, featured, recommended                   | SidekickV2 `PromptLibrary.tsx`, Extension panel      | Data from shared `prompts.json`             |
| Timeframe and comparison builder: presets, custom range, previous period or YoY | Extension `prompts.js` (`buildPrompt`, `getCmpText`) | Must produce the same text as the extension |
| Placeholder inputs for `[Bracketed]` values                                     | Extension v2                                         |                                             |
| Prompt detail page `/prompts/[slug]`: copy, share link, follow-up               | SidekickV2 `app/prompts/[slug]`                      | Pre-rendered per slug at build              |
| Collections list and detail                                                     | SidekickV2 `/collections`                            | Read from `prompts.json` (see phase 3)      |
| Saved prompts                                                                   | SidekickV2 `/saved`                                  | `localStorage`, wrapped in try/catch        |
| Submit a prompt                                                                 | SidekickV2 `/submit`                                 | Link to a Google Form or `mailto:`          |
| Get the extension page and header CTA                                           | New                                                  | Links to the Web Store listing above        |
| App switcher: Sidecar Web, Brand Tools                                          | Product UI `AppSwitcher` via `WorkspaceShell apps`   | Absolute GitHub Pages URLs                  |
| Hidden from search engines                                                      | New                                                  | See below                                   |

**Kept in code, not displayed**

- Claude Skills library: port the types, pages and components behind a build flag (for example `NEXT_PUBLIC_SHOW_SKILLS`), off by default. Not in nav, palette or sitemap. No skills data exists yet; keep markdown examples in the repo.

**Out of scope**

- Login, admin, submissions workflow, version history, database analytics, skill file uploads.

**Search engine hiding**

- Add `<meta name="robots" content="noindex, nofollow">` to every page (Next `metadata.robots`).
- A `robots.txt` in the project will not work. GitHub Pages project sites live under `tomrosscd.github.io/<repo>/`. Crawlers only read `tomrosscd.github.io/robots.txt`, which does not exist today. Optional: create a `tomrosscd.github.io` user-site repo containing a `robots.txt` that disallows all.
- Do not generate a sitemap.
- This hides the site from search engines. It does not make it private. Anyone with the link can see everything, as they can with `prompts.json` today.

**Prompt data flow**

- Source of truth: `tomrosscd/sidecar/prompts.json`, published at `https://tomrosscd.github.io/sidecar/prompts.json`.
- Sidecar Web fetches that URL at build time, validates it, and fails the build if it is invalid.
- Rebuild triggers: daily scheduled workflow plus manual `workflow_dispatch`. Later: `repository_dispatch` from the sidecar repo when `prompts.json` changes.

**Done when**

- Every in-scope feature works on the deployed Pages site at 1440, 1024, 390 and 320px.
- Copied prompt text matches the extension for the same prompt, timeframe and comparison.
- `pnpm check` passes in CI.
- Every page has the noindex tag.

### Phase 2: App switcher in Brand Tools

- Add the two-app list to Brand Tools' `WorkspaceShell` (`apps`, `currentAppId`). Small separate PR.
- For now, keep the app list as a constant in each repo. Product UI does not own app data.
- Each app needs a mark for the switcher. Sidecar can use its extension icon.

### Phase 3: One prompt file for both apps

Extend `prompts.json` in the sidecar repo so both apps read the same file.

- Additive only. Installed extensions fetch the live file. `panel.js` `isValidPayload()` rejects the whole payload if any prompt is missing `slug`, `title`, `category`, `body` or `placeholders` (array). Extra fields and extra top-level keys are ignored.
- Proposed new prompt fields, all optional: `whenToUse`, `caveats`, `useCases[]`, `dataSources[]`, `level`, `visibility` (`public` or `internal`, for when login exists).
- Proposed new top-level key: `collections: [{ slug, title, description, promptSlugs[] }]`.
- Bump `schema` to 2. The extension does not check it.
- Port the useful SidekickV2 metadata (when to use, caveats, collections) onto matching prompts. Only 5 of the 74 slugs match the old seed, so this is manual.
- Add a validation script and CI check in the sidecar repo so a bad edit cannot ship.
- Update the out-of-date sidecar README: it still describes `prompts.js` data and a Convert/Shopify source filter.

### Phase 4: Sidecar Extension on Product UI

- The extension is plain JavaScript in a side panel, not React. Use Product UI's stylesheet and `--cui-*` tokens, not its components.
- Match Sidecar Web's look: type, colours, buttons, pills, cards.
- Check the Web Store review impact of the bundle change before release.

### Later: login and shared data (not scheduled)

- Needs a server host. Free options: Cloudflare Pages or Workers (allows commercial use). Vercel Hobby is for non-commercial use only.
- GitHub Pages from a private repo needs a paid GitHub plan, and the published site is still public.
- Login pattern that avoids shared sessions: each app has its own Google sign-in, restricted to the Convert Workspace. Staff are already signed into Google, so each extra app is about one click.
- Unlocks: gated prompts (`visibility: internal`), Brand Tools editor roles (internal users who can add partners), saves and submissions on a server.
- Shared login and client codes from CD Capacity: only if and when Seb agrees. Brand Tools partners and Capacity's `client_third_parties` stay separate for now.

### Seb-owned (no work from Tom)

- Capacity upgrades to Product UI 1.5 or later and merges the client hub.
- Capacity can then join the app switcher.

## Open items

- [ ] Tom creates the `tomrosscd/sidecar-web` repo. It must be public for free GitHub Pages.
- [ ] Add the `PRODUCT_UI_TOKEN` secret to the new repo. Set Pages source to GitHub Actions.
- [ ] Choose Google Form or `mailto:` for prompt submissions.
- [ ] Archive `tomrosscd/SidekickV2` once Sidecar Web reaches parity.
- [ ] Decide on subdomains on the Convert domain (later).

## SidekickV2 feature inventory (reference)

- Routes: `/`, `/prompts/[slug]`, `/collections`, `/collections/[slug]`, `/saved`, `/submit`, `/skills`, `/skills/[slug]`, `/skills/submit`, `/login`, `/admin/*`, `/design-system`.
- Data: Supabase tables `prompts`, `prompt_versions`, `prompt_collections`, `prompt_collection_items`, `prompt_submissions`, `prompt_events`, `skills`, `skill_versions`, `skill_submissions`, `skill_files`, `user_saves`.
- Seed: 54 prompts, all `internal`, now stale. The 74-prompt `prompts.json` in the sidecar repo replaces it.
- Auth: Supabase Google OAuth. Internal means an `@convertdigital.com.au` address. Admin is a single email.
