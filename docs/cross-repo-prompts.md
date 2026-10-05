# Cross-repo prompts

Prompts for the other repos involved in bringing the Convert apps together. Drafted 5 October 2026.

Each prompt is self-contained. Open a Code session in that repo's folder, pick Sonnet, and paste it.

**cd_capacity and convert-client-hub need no changes. Never change code in cd_capacity.**

## Order

| #   | Repo             | Change                                                                                                | When                                                     |
| --- | ---------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 1   | `cd-brand-tools` | Add the app switcher                                                                                  | Once Sidecar Web's first milestone (M1) is live on Pages |
| 2   | `sidecar`        | Add Sidecar Web's extra fields and collections to `prompts.json` (version 2), with an automatic check | Any time, in parallel                                    |
| 3   | `sidecar-web`    | Switch collections to the shared `prompts.json`                                                       | After #2 is merged                                       |
| 4   | `SidekickV2`     | Point to Sidecar Web, then archive                                                                    | Once Sidecar Web has everything SidekickV2 does          |
| 5   | `cd-product-ui`  | List Sidecar Web as a consumer                                                                        | After Sidecar Web deploys                                |
| 6   | `sidecar`        | Restyle the extension with Product UI                                                                 | Later phase, after #2                                    |

Prompt 2 is the one to be careful with. Installed copies of the extension fetch the live `prompts.json`, so one malformed prompt makes every installed extension fall back to its cached copy. The new automatic check is what stops that.

---

## 1. cd-brand-tools: app switcher

```
Add the Product UI app switcher to Brand Tools so it links to Sidecar Web, a sibling Convert app.

Context: Convert's internal apps stay as separate GitHub Pages deployments that share @convert/product-ui (1.5.0, already installed here). WorkspaceShell takes an `apps` prop (AppEntry: id, label, href, mark, markTreatment, description) and `currentAppId`. With two or more apps it renders a switcher popover of real links. See node_modules/@convert/product-ui docs or the AppSwitcher types.

Do:
- Create src/config/apps.ts exporting the app list:
  - { id: 'brand-tools', label: 'Brand Tools', href: 'https://tomrosscd.github.io/cd-brand-tools/', description: 'Brand guide, assets and creative tools', mark: the existing Convert productMark, markTreatment: 'inset' }
  - { id: 'sidecar-web', label: 'Sidecar Web', href: 'https://tomrosscd.github.io/sidecar-web/', description: 'Shopify Sidekick prompt library' }
  - For the Sidecar mark, copy icon128.png from github.com/tomrosscd/sidecar/icons into public/apps/sidecar.png and render it with withBase().
- Pass apps and currentAppId="brand-tools" to WorkspaceShell in src/components/app-shell.tsx. Check it works collapsed and expanded, and in the mobile drawer.
- Add a test that the switcher renders both apps with the right hrefs.

Rules: follow AGENTS.md (Australian English, no em dashes, no local restyling of Product UI components). No other changes. Run `pnpm check`. Branch, open a PR with screenshots at 1440 and 390px, and don't merge.
```

## 2. sidecar: shared prompt file, version 2

```
Extend prompts.json so the Sidecar Chrome extension and the new Sidecar Web site (tomrosscd/sidecar-web) read the same file. Add validation so a bad edit can't ship.

Critical constraint: installed extensions fetch the live file from https://tomrosscd.github.io/sidecar/prompts.json. panel.js isValidPayload() rejects the WHOLE payload if any prompt lacks a non-empty string slug, title, category or body, or a placeholders array. Changes must be additive only. Never rename or remove existing fields or slugs.

Do:
1. Bump the top-level `schema` to 2. Add optional per-prompt fields: whenToUse (string), caveats (string), useCases (string[]), dataSources (string[]), level ('beginner'|'intermediate'|'advanced'), visibility ('public'|'internal', default 'internal').
2. Add top-level `collections: [{ slug, title, description, promptSlugs: [] }]`.
3. Fill these from the old SidekickV2 data: github.com/tomrosscd/SidekickV2, supabase/seed.sql. Clone it read-only into a sibling folder and don't change it. Only about 5 slugs match exactly, so match by title or intent. Leave fields out rather than guess. For collections, include those seeded in SidekickV2 (Post-Launch Review, BFCM Preparation, plus any others it names) mapped to current slugs. List every mapping decision in the PR.
4. Add scripts/validate-prompts.mjs (Node, no dependencies). It enforces the extension's isValidPayload rules, unique slugs, valid followUp slugs, valid collection promptSlugs, allowed enum values, and that `count` equals prompts.length.
5. Add .github/workflows/validate.yml that runs it on every push and PR.
6. Update README.md: it still describes prompts.js holding PROMPTS and a Convert/Shopify source filter. Document the schema v2 fields and that Sidecar Web reads this file too.

Don't change panel.js behaviour or the extension UI in this PR. Load the extension unpacked and confirm prompts still load. Branch, open a PR, and don't merge.
```

## 3. sidecar-web: collections from the shared file

Use this in your existing Sidecar Web session, after #2 is merged.

```
prompts.json schema 2 is live, with top-level `collections` and optional prompt metadata. Switch /collections to read collections from prompts.json and delete data/collections.json. Validate collection promptSlugs at build. Make sure whenToUse, caveats, useCases, dataSources and level render on the prompt detail page when present. Add filters for useCases and level on the library page if Product UI's filter pattern supports them cleanly. Branch, open a PR, and stop.
```

## 4. SidekickV2: point to Sidecar Web and archive

```
This repo (SidekickV2) is retired and replaced by Sidecar Web: https://tomrosscd.github.io/sidecar-web/ (repo tomrosscd/sidecar-web). Prompts now live in tomrosscd/sidecar/prompts.json.

Change only README.md. Add a clear notice at the top: retired, links to the replacement and the prompt source, and kept as a feature reference only. Don't change code or delete anything. Commit on a branch and open a PR.

After I merge, tell me the command to archive the repo (gh repo archive tomrosscd/SidekickV2), but don't run it.
```

## 5. cd-product-ui: list Sidecar Web as a consumer

```
Record a new consumer of @convert/product-ui: tomrosscd/sidecar-web ("Sidecar Web"), contact Tom Ross.

Read CONSUMERS.md and follow its existing format and evidence rules. Verify read-only from sidecar-web: package.json, the scripts/fetch-product-ui.mjs version and SHA-256, the lockfile, and the latest Pages deploy run via `gh run list -R tomrosscd/sidecar-web`. Record only what you verified and mark the rest unverified.

Also check sidecar-web's docs/product-ui-gaps.md. For each gap, say whether an existing Product UI component already covers it or whether it should become a roadmap item. Report that in the PR description; don't build anything.

Change only CONSUMERS.md (and HANDOFF.md if its rules require it). Branch, open a PR, and don't merge.
```

## 6. sidecar: restyle with Product UI (later phase)

```
Restyle the Sidecar Chrome extension's side panel to match Convert's Product UI, so it looks consistent with Sidecar Web (tomrosscd/sidecar-web).

The extension is plain JavaScript (panel.html, panel.css, panel.js) with no React and no bundler. Keep it that way. Use Product UI's compiled stylesheet and --cui-* tokens only, not React components.

Do:
- Get the Product UI 1.5.0 release archive with `gh release download v1.5.0 -R tomrosscd/cd-product-ui` and verify its SHA-256. Use the same pin as sidecar-web's scripts/fetch-product-ui.mjs.
- Copy only the CSS you need (the tokens, plus class patterns if they work without React) into the extension. Add a small script to refresh it. Note the size impact.
- Rework panel.css onto --cui-* tokens: type, colours, spacing, radius, buttons, pills, cards, inputs, toasts. Match Sidecar Web's visual patterns. Read sidecar-web's src for reference.
- Fonts: bundle locally (no remote font loading). Check the licence in fonts/README.md.
- Don't change behaviour, permissions, host_permissions, the prompts fetch, or scraper/parser logic.
- Bump the manifest version. List anything that affects Chrome Web Store review.

Verify by loading the extension unpacked on admin.shopify.com: Prompts mode, Export mode, placeholders, copy and insert. Attach before and after screenshots. Branch, open a PR, and don't merge.
```
