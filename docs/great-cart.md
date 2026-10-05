# Great Cart: plan

Owner: Tom Ross. Drafted 5 October 2026. Status: idea agreed in principle. Blocked on a conversation with GoodCart's owner.

## What it is

Convert's own ecommerce inspiration library, built on `@convert/product-ui`. It's a fourth app in the suite switcher, alongside Sidecar Web and Brand Tools.

It's a targeted Convert tool, not a GoodCart reskin. Its job is to answer team questions like these:

- Which Convert clients use Klaviyo?
- Show me PDPs we've built with variant swatches.
- Beauty sites with sticky add to cart, our builds first.
- Everything saved for the Henne pitch.

## Sources

| Source | Badge | Where it comes from | Phase |
| --- | --- | --- | --- |
| GoodCart | "GoodCart", plus a "View on GoodCart" link | Coworker's feed (format to be agreed) | 1 |
| Convert builds | "Convert" | Convert website Payload CMS (`convert-digital-2025`), published case studies | 1 |
| Team submissions | "Submitted by <name>" | Great Cart's own database | 2 |

Source is a filter: All, GoodCart, Convert, Team.

## Taxonomy

GoodCart's taxonomy is the canonical one. Great Cart uses its tags as-is:

- **Page type:** Homepage, Collection, Product.
- **Industry (13):** Automotive & Tools, Beauty & Wellness, Electronics & Tech, Fashion & Apparel, Food & Beverages, Health & Supplements, Home & Furniture, Kids & Baby, Large Retail, Outdoor & Travel, Pets, Sports & Activewear, Stationery & Office.
- **Style (10):** Bold, Colourful, Dark, Editorial, Luxury, Maximal, Minimal, Organic, Playful, Retro.
- **UX patterns:** sticky add to cart, quick add, variant swatches, filtering and sorting, and whatever else his feed provides.

Convert additions:

- **Partners:** which partner apps a site uses, for example Klaviyo or Yotpo.
- **Client and project:** Convert client name, a `clientKey` in the same format as Capacity's `clients.client_key`, and project codes.
- **Notes:** why the site is good.

Mapping files in the Great Cart repo convert Payload's `case-study-industries` and `case-study-features` to GoodCart's industries and UX patterns.

## Payload: what already exists

Checked read-only in `convert-digital-2025` (Payload 3.87, hosted on Cloudflare):

- `case-studies` has relationships to `industry` (case-study-industries), `features` (case-study-features), `services` and `partners`. It has drafts. Read access is `authenticatedOrPublished`, so published case studies can be read without logging in through the REST API (`/api/case-studies?depth=1`).
- `partners` has `title`, `slug`, `category`, `tags`, `logo`, `description` and a `caseStudies` join. So "Convert clients using partner X" is already a query: the partner, then its joined case studies.
- `case-study-features` and `case-study-industries` can be read by anyone.

Gaps:

- Only clients with a **published case study** appear. To include other clients, add a separate Payload collection (for example `client-sites`) or an "inspiration only" flag. Tom maintains it.
- There is **no client key or project code** on case studies. A later option is an optional `clientKey` field (Capacity format) in Payload. That's a change in the Payload repo; Tom's call.
- Case studies have hero and feature images, **not full-page screenshots**. See the open questions.

## Partner IDs: two lists exist

- Brand Tools has `src/brand/partners.json`: 99 partners built from a logo zip, with ids like `accessibe`.
- Payload has a `partners` collection with slugs.

Great Cart uses **Payload partner slugs**, because case studies link to them. A mapping file connects them to Brand Tools ids where they differ.

Longer term, consider making Payload the single partner source for Brand Tools too. That's not in scope now.

## Brand Tools integration

- **Brand Tools to Great Cart:** each partner in Brand Tools gets a "Convert sites using this partner" link to `great-cart/?partner=<slug>`.
- **Great Cart to Brand Tools:** partner badges link to `cd-brand-tools/partners?q=<name>`. That's Brand Tools' existing search deep link.

## Phases

**0. Conversation with GoodCart's owner (no code)**

Questions to ask him:

- **Feed:** what format can he expose (JSON endpoint, API or periodic export)? How often does it change? Does each site and screenshot have a stable ID and URL on goodcart.design, for the "View on GoodCart" link?
- **Images:** can Great Cart load screenshots from his ImageKit account? It costs him bandwidth. Or would he prefer you copy or proxy them?
- **Credit:** how does he want GoodCart credited?
- **Team features:** does he want to build team features in GoodCart itself? If so, agree the line: GoodCart is the public curated bank, and anything Convert-specific (clients, partners, saves, project boards) lives in Great Cart.
- **Screenshots:** how does he capture them? Can Great Cart use the same tool for Convert sites?

**1. Read-only on Product UI, no database**

- Next.js static export on GitHub Pages, `noindex`, same setup as Sidecar Web.
- Data comes in at build time: the GoodCart feed, plus published Payload case studies, partners, features and industries. Normalise everything into one `Site` record:

  ```
  { id, source: 'goodcart'|'convert', name, url, sourceUrl?, industry, styles[], pageTypes[], uxPatterns[], partners[], client?, clientKey?, projectCodes[], screenshots[{ pageType, device, src }], notes? }
  ```

- UI: browse grid with screenshots, a desktop/mobile toggle, filters (source, page type, industry, style, UX pattern, partner, client), search, a site detail page with screenshots per page type, source badges and "View on GoodCart", and Brand Tools partner links.
- Anything pulled at build time is public on a static site. Only pull public or published data in this phase.

**2. Login, saves, boards and submissions**

- Supabase free tier, used from the browser on a static site. Google sign-in limited to the Convert Workspace, with access rules in the database (SidekickV2's `is_internal_user()` pattern).
- Free projects pause after about a week of no use.
- Saved sites, boards per client, project or pitch, and team submissions with notes. Submissions stay Convert-only unless GoodCart's owner wants them.
- Same database technology as Capacity, so it can move into Capacity later.

**3. Capacity integration (needs Seb)**

- Client list and `client_key` from Capacity. Capacity's `client_third_parties` can enrich partner data.
- No code changes in cd_capacity unless Seb agrees.

## Open questions

- [ ] Feed format and image hosting (from the GoodCart conversation).
- [ ] Screenshots of Convert sites: reuse GoodCart's capture tool, run an automated screenshot job (for example Playwright in GitHub Actions saving to the repo or cheap storage), or use case-study images to begin with.
- [ ] Clients without a published case study: a new Payload collection, or a JSON file in the Great Cart repo to begin with?
- [ ] Repo name: `tomrosscd/great-cart`?
- [ ] Does Payload's REST API on the live site allow requests from GitHub Actions? Check whether Cloudflare blocks build-time fetches.

## Kickoff prompt (use once phase 0 is done)

Fill in the FEED section with what the GoodCart owner agrees, then paste this into a new Sonnet session in the new repo.

```
You're building **Great Cart**, Convert's internal ecommerce inspiration library, in this repo. It's a static Next.js app on Convert's design system @convert/product-ui, and it joins Sidecar Web and Brand Tools in the Product UI app switcher. It must be a targeted Convert tool: the point is to let the team search inspiration by UX pattern AND by Convert clients and partners (for example "Convert clients using Klaviyo with variant swatches"). It is not a reskin of GoodCart.

Read first: docs/great-cart.md in tomrosscd/sidecar-web (the plan), and copy it into docs/PLAN.md.

## Reference (read-only, never push to these)
- tomrosscd/sidecar-web: copy its setup. That means Next 16 static export, the scripts/fetch-product-ui.mjs pattern (Product UI 1.5.0), the WorkspaceShell plus app switcher, noindex metadata, and the CI and Pages workflows. Also copy AGENTS.md conventions: Australian English, no em dashes, Product UI first, gaps logged in docs/product-ui-gaps.md.
- tomrosscd/cd-brand-tools: partner ids and its /partners?q= deep link.
- Convert website Payload CMS: <SITE_URL>/api. Use only published, publicly readable data: case-studies (depth=1, with industry, features, partners), partners, case-study-features, case-study-industries.

## FEED
<GoodCart feed URL, format, stable ids, screenshot URLs, attribution rule, refresh rate>

## Phase 1 milestones (one PR each; stop after each)
M1 Scaffold: shell, app switcher (Great Cart, Sidecar Web https://tomrosscd.github.io/sidecar-web/, Brand Tools https://tomrosscd.github.io/cd-brand-tools/), noindex, CI and Pages. Also add Great Cart to the shared app list wherever Sidecar Web keeps it, and note that Brand Tools needs the same entry.
M2 Data layer: build-time fetch of the GoodCart feed and Payload. Normalise into one Site type (see the plan). Mapping files: data/map-industries.json and data/map-features.json (Payload to GoodCart taxonomy) and data/map-partners.json (Payload slug to Brand Tools id). Validate and fail the build on bad data. Unit tests.
M3 Library: grid with screenshots, a desktop/mobile toggle, filters (source, page type, industry, style, UX pattern, partner, client), search, and state in the query string. Source badges: "GoodCart" and "Convert".
M4 Site detail: screenshots per page type, tags, partners linking to Brand Tools, client and case study link for Convert builds, and "View on GoodCart" for GoodCart sites.
M5 QA: viewports 1440/1024/390/320, keyboard pass, pnpm check, deploy.

Out of scope: login, saves, boards, submissions, any database, and any change to other repos (never touch SebastianKlett/cd_capacity).
```
