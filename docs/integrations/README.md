# Integrations & External Services

This document details the external services and internal integration mechanisms used in the AutoMatch project.

## 1. Google Sheets Integration (The "Database")

The project uses Google Sheets as a primary data source for the car dataset (used in the Quiz and Compare pages).

### Architecture
1.  **Source:** A private Google Sheet (ID and Range defined in env vars: `GOOGLE_SHEETS_SPREADSHEET_ID`, `SHEET_NAME`).
2.  **Access Layer:** `src/lib/googleSheets.ts` uses `googleapis` with a Service Account (credentials in `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`) to securely fetch data server-side.
3.  **API Proxy:** `src/app/api/sheet-data/route.ts` exposes a secure endpoint for the client to request data without exposing Google credentials.
4.  **Client-Side Caching:** `src/lib/dataset.ts` fetches from the API proxy and caches the result in the browser's `localStorage` with a **3-hour TTL** (`dataset:${id}:${range}:v4`). This minimizes API calls and improves performance.

### Key Files
-   `src/lib/googleSheets.ts`: Server-side Google Sheets API wrapper.
-   `src/lib/dataset.ts`: Client-side data fetching and caching logic.
-   `src/app/api/sheet-data/route.ts`: API route for reading data.
-   `src/app/api/sheet-append/route.ts`: API route for appending rows (used for leads).

---

## 2. Dealer Inventory Sync (Cron Jobs)

Dealer inventories are synchronized automatically from CSV feeds provided by dealers.

### Workflow
1.  **Configuration:** Dealers are managed in the Admin UI. Each dealer can have a `feedUrl` (link to a CSV file).
2.  **Trigger:** A cron job hits `/api/cron/sync-dealers` (configured in Vercel Cron or GitHub Actions).
3.  **Security:** The endpoint is protected by a `CRON_SECRET` (checked against `Authorization` header or `key` query param).
4.  **Processing:**
    -   Fetches the CSV from `feedUrl`.
    -   Parses using `papaparse`.
    -   Maps columns (VIN, Make, Model, Year, Price, ImageURL, Features).
    -   **Upsert:** Updates existing cars or creates new ones in the PostgreSQL database via Prisma.
    -   **Cleanup:** Deletes cars associated with the dealer that are no longer present in the feed.

### Key Files
-   `src/app/api/cron/sync-dealers/route.ts`: Main entry point for the cron job.
-   `src/lib/dealers-sync.ts`: Core logic for fetching, parsing, and syncing.

---

## 3. AutoDev API

The project integrates with the **AutoDev API** to fetch vehicle listings for specific year ranges.

### Usage
-   **Endpoint:** `https://api.auto.dev/listings`
-   **Function:** `fetchListingsByYearRange` (in `src/lib/autoDev.ts`).
-   **Parameters:**
    -   `vehicle.year`: Range (e.g., "2018-2025").
    -   `limit`: Number of results per page.
    -   `page`: Pagination.
-   **Authentication:** Uses `AUTO_DEV_API_KEY` environment variable.

### Key Files
-   `src/lib/autoDev.ts`: TypeScript wrapper for the AutoDev API.

---

## 4. Open Graph (Dynamic Social Images)

The project generates dynamic Open Graph images for social sharing (e.g., when sharing a quiz result or a car listing).

### Implementation
-   **Technology:** `next/og` (uses Vercel's Edge Runtime).
-   **Route:** `/api/og`
-   **Usage:** Accepting query parameters (e.g., `?title=...`) to render a custom image on the fly.
-   **Design:** Renders a React component to an image (PNG).

### Key Files
-   `src/app/api/og/route.tsx`: Image generation logic.

---

## 5. UI Components (Kendo UI)

The project utilizes **KendoReact** for complex UI components.

-   **Library:** `@progress/kendo-react-*`
-   **Components Used:** Buttons, Inputs, Layouts, DatePickers (if applicable).
-   **Styling:**
    -   `src/lib/theme.ts`: Defines custom theme variables (colors, fonts).
    -   `src/lib/styled-registry.tsx`: Registry for Styled Components integration.

---

## 6. Analytics & Tracking

-   **Meta Pixel:** `src/lib/pixel.ts` handles standard pageviews and custom events (e.g., `StartQuiz`, `CompletedQuiz`, `LeadSubmitted`).
-   **Google Analytics:** `src/lib/gtag.ts` handles GA4 integration.
