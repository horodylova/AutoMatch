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