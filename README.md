# CarCupid

Next.js application that scores and filters vehicles from a Google Sheets dataset.

## Local Development
- `cd web`
- `npm run dev`

## Environment Variables
- `GOOGLE_SERVICE_ACCOUNT_B64` — base64 of Google service account JSON
- `GOOGLE_SHEETS_SPREADSHEET_ID` — spreadsheet ID
- `SHEET_NAME` — sheet tab name (e.g. `DATABASE`)
- `AUTO_DEV_API_KEY` — optional, for Auto.dev endpoints

## Routes
- `/` — scoring with adjustable weights and compatibility
- `/sheets` — vertical table view of 2024 target models
- `/api/sheet-data` — server route reading Google Sheets

## Deployment (Vercel)
- Project Settings → Root Directory: `web`
- Add environment variables for all environments
- Push to `master` triggers redeploy

## Caching
- Client uses `sessionStorage` to cache sheet data and avoid duplicate fetches across pages.

## Documentation
Detailed documentation lives in `docs/`:
- `docs/site` — public pages
- `docs/admin` — admin area
- `docs/quiz` — quiz flow
- `docs/studio` — Sanity studio
- `docs/analytics` — GA4, GTM, Meta Pixel
- `docs/email` — transactional email
- `docs/integrations` — external services
- `docs/payments` — dealer subscriptions (built, not published)

## Branches
`master` is the only branch. It carries the full application, including the dealer subscription system, which is present but unlinked. See `docs/payments` before publishing it.

Branches removed after being merged or superseded: `dev`, `development`, `feat/mobile-swipe-deck-dev`, `feature/dream-garage-email`, `feature/admin-analytics`, `feature/wip-next`, `feature/quiz-intake-fields`, `feature/blog-poll-webhook`, `feature/blog-studio-quiz`, `feature/dealer-payments`.

## Data Source
Vehicle data is read from either Neon or Google Sheets, selected by the `CARS_SOURCE` environment variable. Setting it to `neon` routes reads through `/api/cars-dataset`; any other value falls back to the Google Sheets path. Both code paths are live, so the Google Sheets integration and its `googleapis` dependency remain in the codebase.

## Recent Updates
- Improved light theme support for car listings and dealer search modal.
- Wishlist: 24h TTL storage, mobile wishlist access, and visibility tweaks.
- Deployment ping: 2026-03-24
