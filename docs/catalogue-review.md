# Catalogue review and import

The current workbook was read through the authorized Google Sheets connector on
2026-10-11. All four tabs were inspected. Launch Range row 4 holds headers and
rows 5–70 hold 66 unique SKUs: 45 Core, 21 Phase 2; 19 athlete, 17 supporter,
30 everyday across 11 categories. All supplier costs, MOQs, launch quantities and
retail prices were blank. FX 157 and 35% uplift are unverified planning assumptions.
No quote, margin, price or stock status has been inferred from them.

## Boundaries

- `scripts/catalogue-preview.json` is a deliberately minimal review manifest:
  SKU, neutral product-type name, category, collection and phase only. It is not
  imported by the app or served in a browser bundle. Phase 2 stays hidden in the DB.
- Full source files and generated import SQL **must remain outside the repository**.
  The importer stores source snapshots and row provenance only in `catalogue_private`.
  No public API or admin client reads that schema. Authorized sourcing review uses
  a trusted database workflow; do not expose the private schema through the Data API.
- Supplier requirements, creative suggestions, proposed variants, manufacturing
  methods and compliance notes have separate private fields. None becomes product
  copy automatically. Commercial cells stay private even in a future priced export.
- Public previews use product-type labels and a planning disclaimer. Removed title
  claims include UV/UPF, IPX8/waterproof performance, reef-safe, sand-free and
  flotation/safety protection. Material/performance specifications need evidence.
- No supported crosswalk exists. Similar products (drawstring bags, polos, towels,
  caps and tees) are candidates for a human review, not proven equivalents. All 66
  retain separate identities. The private crosswalk fields require explicit evidence.
  Do not delete legacy IDs, slugs, galleries or order lines when resolving candidates.

## Offline preparation

Apply the schema migration only to an isolated local DB or explicitly approved
staging environment during review. No production application is authorized here.
The migration creates no supplier products on its own. The import is a separate,
reviewable SQL transaction; the generator never connects to a database.

1. Obtain the authorized current workbook export privately. For XLSX:
   `python scripts/read-catalogue-workbook.py /private/source.xlsx /private/source.json`.
   Verify the file belongs to the requested workbook; XLSX does not carry its Drive ID.
   Alternatively use connector reads in the JSON structure below.
2. Run `node scripts/import-catalogue.mjs /private/source.json /private/import.sql`.
3. Inspect the SQL in restricted storage. Apply schema migrations chronologically,
   then the generated import to the isolated/approved DB using your normal DB tooling.
4. Run `node scripts/test-catalogue-db.mjs /private/source.json` for a disposable
   PostgreSQL test (requires Docker). It never uses credentials or sends messages.

Connector JSON format: `{ "spreadsheetId": "<verified ID>", "retrievedAt":
"<ISO timestamp>", "sheets": { "Summary": [[...]], "Launch Range": [[...]],
"Comparable Brand": [[...]], "Notes & Sources": [[...]] } }`. Preserve original
row positions and header cells; do not compact blank rows. All four tabs are required.
Import stops for changed SKU/phase/collection/category mapping; update the review
manifest deliberately before accepting changed workbook scope.

Reimport is non-destructive: unique source SKU retains its UUID, public copy, slug,
gallery, prices, visibility and approval decisions. It refreshes private source
metadata only and keeps prior source snapshots by digest. A slug collision with
another product aborts the transaction instead of guessing a crosswalk.

## Staff decisions before sales

Review Core first using the admin phase filter. Confirm supplier selection/quote,
actual retail price, fulfilment and availability, enumerated sizes (or explicit
no-size applicability), fit/material facts, imagery and any regulated claims.
Then set a positive price, clear provisional pricing, approve public content and
variants, select Available and choose visibility independently. Phase 2 promotion
requires an explicit visibility decision, not just changing its phase.

Existing products retain their prior eligibility and provisional flag, without
rewriting their records. New rows fail closed by default. The atomic server RPC
checks all gates under product locks; browser prices are ignored. Retrying an
already-created order returns its original snapshot, even if availability changed.
This is intentional idempotency, not permission for a new purchase.

## Validation limits

Local PostgreSQL tests use minimal Supabase auth/storage stubs and real Postgres
roles, RLS and the real order function. They are not a full hosted Supabase test.
Production migrations, live orders, charges, outbound email and Stripe integration
are excluded. Review deployment sequencing before release: migration first, then
application and approved private import. Older schemas fail closed at the API.

## Verification commands and observed results

- `npm run test`: 24 unit/API tests passed.
- `npm run typecheck` and `npm run lint`: passed.
- `node scripts/test-catalogue-db.mjs /private/source.json`: passed using the
  current authorized workbook, including exact counts, SKU immutability, repeated
  imports, preservation of all 28 products and legacy order snapshots, anonymous
  privacy, each purchase gate, size validation, server pricing and idempotency.
- `npm run build`: Google Fonts network fetch failed in the coding environment.
  Build passed with the committed test-only font fixture:
  `NEXT_FONT_GOOGLE_MOCKED_RESPONSES="$PWD/scripts/test-font-responses.cjs" npm run build`.
  This verifies compilation/routes, not downloading or rendering the actual fonts.
- Start that local build on `127.0.0.1:3000`, then run
  `node scripts/test-catalogue-browser.mjs`. Uses system Chromium by default;
  `PLAYWRIGHT_EXECUTABLE_PATH` can point to an installed Chromium. Products/config
  are mocked and order requests are blocked. Both 390px and 1280px passed for
  categories, detail pages, inquiry links, price-pending display, stale-cart
  rejection, disabled checkout and approved size selection. WCAG A/AA automated
  scans passed on the tested store/category/detail/checkout screens after fixing
  category-label contrast and mobile cart overflow. This is not a manual
  assistive-technology audit or a live Supabase browser test.
- Restricted source terms and Phase 2 SKUs were absent from built static bundles.

The Supabase CLI could not create its home directory in this environment; the
migration was prepared directly and executed successfully in disposable Postgres.
No production migration, deployment, live order, payment or customer message was
performed. No merge is authorized by this review.
