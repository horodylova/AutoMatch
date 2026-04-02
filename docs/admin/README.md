# Admin Area

This document reflects the current implementation of the Admin Panel (`/admin`) based on the repository code.

## Overview
- Route: `/admin` protected by layout [layout.tsx](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/admin/(main)/layout.tsx)
- Auth: Custom JWT session in [auth.ts](file:///Users/svetlanagorodilova/w/AutoMatch/src/lib/auth.ts) using HS256; cookie name `admin_session`; 24h expiry
- Database: Prisma (PostgreSQL)
- Inventory Sync: CSV feed parsing and upsert logic in [dealers-sync.ts](file:///Users/svetlanagorodilova/w/AutoMatch/src/lib/dealers-sync.ts)

## Authentication
- Login: [login route](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/api/admin/login/route.ts) POST `{ email, password }` → sets `admin_session`
- Me: [me route](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/api/admin/me/route.ts) GET → returns `id, email, role` if session valid
- Logout: [logout route](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/api/admin/logout/route.ts) POST → clears cookie
- Secret: `JWT_SECRET` required for token signing

## Dealers Management (UI)
- Page: [admin dealers](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/admin/(main)/dealers/page.tsx)
- Lists dealers via `/api/admin/dealers` with:
  - `_count.cars` (inventory size)
  - last payment info (method/status)
  - derived contact data from `DealerContactRequest` by email
  - `cancelAtPeriodEnd` computed via Stripe subscriptions, when available
- Actions:
  - Add Dealer: opens [AddDealerModal](file:///Users/svetlanagorodilova/w/AutoMatch/src/components/admin/AddDealerModal.tsx) → POST `/api/admin/dealers`
  - Unsubscribe: POST `/api/admin/dealers/[id]/unsubscribe` (schedules cancel at period end in Stripe; sends Brevo email)
  - Delete: DELETE `/api/admin/dealers/[id]` (removes cars, then dealer)

## Dealers API
- List/Create: [route.ts](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/api/admin/dealers/route.ts)
  - GET: requires valid admin session; returns enriched array with `cancelAtPeriodEnd`
  - POST: body `{ name, feedUrl, contactName, contactEmail, contactPhone, website }`
    - Generates slug from `name`
    - Dedup slug; returns 400 if exists
    - Creates `Dealer`
    - Stores `DealerContactRequest` (for admin visibility) if contact provided
    - Immediate inventory sync triggered if `feedUrl` present via `syncDealerInventory(dealer.id)`
- Update/Delete: [id/route.ts](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/api/admin/dealers/[id]/route.ts)
  - PATCH: `{ name?, feedUrl? }` (re-slugs when name changes)
  - DELETE: deletes all `Car` by dealerId, then the `Dealer`
- Unsubscribe: [unsubscribe route](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/api/admin/dealers/[id]/unsubscribe/route.ts)
  - Sets Stripe subscriptions `cancel_at_period_end: true` for active subs
  - Updates dealer `billingStatus: "active"` (access remains until term end)
  - Sends Brevo email if `BREVO_API_KEY` and contact email are available

## Inventory Sync Engine
- Source: [dealers-sync.ts](file:///Users/svetlanagorodilova/w/AutoMatch/src/lib/dealers-sync.ts)
- Steps:
  - Fetch dealer `feedUrl` (CSV)
  - Parse with `papaparse` (headers trimmed)
  - Validate required fields: VIN, Make, Model, Year, Price
  - Upsert `Car` via composite key `(dealerId, vin)`; update price/mileage/image/features
  - Delete cars not present in current feed VINs
- Features parsing: supports `Features` header with `|` or `,` separator

## Cron Sync
- Endpoint: [sync-dealers](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/api/cron/sync-dealers/route.ts)
- Auth:
  - Header `Authorization: Bearer <CRON_SECRET>`
  - Or query `?key=<CRON_SECRET>`
  - Or dev mode (no secret)
- Finds dealers with non-null `feedUrl` and iterates sequentially calling `syncDealerInventory`
- Exports `maxDuration = 60` and `dynamic = "force-dynamic"`
- Required env: `CRON_SECRET`; optional `NEXT_PUBLIC_APP_URL`

## Environment Variables
- `JWT_SECRET` — Admin auth token signing
- `STRIPE_SECRET_KEY` — Stripe API key (admin enrichment/unsubscribe and payments)
- `BREVO_API_KEY` — Transactional emails for admin unsubscribe/payment notifications
- `CRON_SECRET` — Protects cron sync endpoint

## Admin UI Files
- Layout and pages: [admin/(main)](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/admin/(main))
- Login page: [admin/login/page.tsx](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/admin/login/page.tsx)
- Styles: [admin.module.css](file:///Users/svetlanagorodilova/w/AutoMatch/src/components/admin/admin.module.css)
