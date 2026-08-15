# Dealer Subscriptions (Stripe)

Status: **built and tested, not published**. The code lives on `master` and ships with every deployment, but nothing on the live site links to it.

## Why it is here

The payment system was developed on the `dev` branch while the rest of the site moved ahead on `master`. Rather than keep a second long-lived branch drifting further out of date, the payment code was brought onto `master` and parked behind an unlinked route. It stays current with the rest of the codebase and can be published without a merge.

## How it is switched off

There is no feature flag and no commented-out code. The system is unreachable because no navigation links to it:

- The public dealer page at `/dealers` is unchanged. It carries the contact form and is linked from the header and footer.
- The subscription flow sits at `/dealer-subscription`. Nothing links to it. It is reachable only by typing the URL.

Publishing means adding a link. Nothing else needs to change in the code.

## Routes

| Path | Purpose |
|---|---|
| `/dealer-subscription` | Subscription landing page with plans and pricing |
| `/dealer-subscription/order` | Order form and checkout entry point |
| `/dealer-subscription/order/success` | Post-payment confirmation, reads the Stripe session |
| `/dealer-subscription/order/cancel` | Shown when a dealer abandons Stripe Checkout |

## API endpoints

| Endpoint | Purpose |
|---|---|
| `POST /api/dealers/subscribe` | Creates a Stripe Checkout session in `subscription` mode (recurring monthly) |
| `POST /api/dealers/checkout` | Creates a Stripe Checkout session in `payment` mode (one-off) |
| `POST /api/dealers/invoice` | Issues an invoice through Stripe |
| `POST /api/payments/confirm` | Confirms payment and sends the confirmation email via Brevo |
| `POST /api/webhooks/stripe` | Receives Stripe events as they happen. Records renewals, extends the dealer term and sends renewal emails |
| `GET /api/cron/subscriptions-reconcile` | Scheduled safety net. Re-checks recent invoices and fills in anything the webhook missed |
| `POST /api/admin/dealers/[id]/unsubscribe` | Cancels a dealer subscription. Sits behind admin authentication |

These endpoints respond as soon as the environment variables below are set. They are not protected by the absence of a link. If the site is public and the variables are populated, the endpoints are callable directly.

## Database schema

The Prisma schema on `master` describes the payment tables, but the database itself has not been migrated. The schema and the live database are deliberately out of step until the system is published.

Added to `prisma/schema.prisma` alongside the payment code:

- `Payment` — one row per successful charge, holding the Stripe payment intent, invoice, session and customer IDs, the amount, the term length and the term dates. The three Stripe ID columns are unique, which is what makes payment processing idempotent: a webhook or reconciliation run that fires twice cannot create a duplicate row.
- `PaymentStatus`, `PaymentMethod` — enums for charge outcome and payment type.
- `FeedType`, `BillingStatus` — enums for dealer inventory feeds and subscription state.
- New optional fields on `Dealer` — contact details, `feedType`, `syncEnabled`, `billingStatus`, `termStartAt`, `termEndAt`, `stripeCustomerId`, and the relation to `Payment`.

All changes are additive. No column is dropped or renamed, and every new field on `Dealer` is either optional or carries a default, so migrating does not affect existing dealer records.

Existing code that predates the payment work reads and writes only the original `Dealer` fields, so the schema addition does not change current behaviour.

## Environment variables

Required before the flow will work:

- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_SUBSCRIPTION_MONTHLY` — the Stripe Price ID for the monthly plan
- `STRIPE_PMC_ID` — payment method configuration
- `NEXT_PUBLIC_APP_URL` — used to build Stripe return URLs
- `BREVO_API_KEY` — confirmation and reconciliation emails
- `CRON_SECRET` — guards the reconciliation endpoint

- `STRIPE_WEBHOOK_SECRET` — verifies that incoming webhook calls genuinely come from Stripe

The webhook and the reconciliation cron overlap deliberately. The webhook reacts immediately but can be missed if the endpoint is unreachable; the cron sweeps up afterwards. Both write through the same unique Stripe ID columns, so a payment processed twice cannot produce two rows.

## To publish

1. **Migrate the database first.** Run `npx prisma migrate dev --name add-payments` locally against a development database, review the generated SQL, then apply it to production with `npx prisma migrate deploy`. Nothing below will work until the `Payment` table and the new `Dealer` columns exist. Take a database backup before applying to production.
2. Populate the environment variables above in Vercel, using live Stripe keys rather than test keys.
3. Create the monthly Price in Stripe and set `STRIPE_PRICE_SUBSCRIPTION_MONTHLY`.
4. Register the webhook endpoint in the Stripe dashboard, pointing at `https://carcupid.fit/api/webhooks/stripe`, and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Schedule `GET /api/cron/subscriptions-reconcile` and pass `CRON_SECRET`.
6. Run a full test transaction in Stripe test mode and confirm a row lands in `Payment`.
7. Add a link to `/dealer-subscription` from the header, footer, or the `/dealers` page.

Steps 1 to 6 are invisible to visitors. Step 7 is what makes the system public, so leave it until everything else is verified.

## Known gap

There is no button in the admin interface that calls the unsubscribe endpoint, and the dealer form does not collect contact details. Both were built on the payment branch alongside changes that were not carried over, because they would have altered the live admin area before the payment system is in use.

Two consequences for whoever publishes this:

- Cancelling a subscription currently requires calling `POST /api/admin/dealers/[id]/unsubscribe` directly rather than clicking something.
- `/api/payments/confirm` matches a dealer by `contactEmail`, but that field cannot be filled from the admin form as it stands. Add the contact fields to the dealer form before going live, or dealer records will need editing by hand.

## Before publishing, check the data source

The Prisma models describe dealers, cars and payments, but vehicle data on the live site may be served from Google Sheets rather than Neon, depending on `CARS_SOURCE`. Confirm which source is active before assuming the Prisma `Car` table reflects what visitors see. See the Data Source section in the root README.

## Branch history

`feature/dealer-payments` was an earlier draft: one-off payments only, no subscription mode, no success or cancel handling. It was superseded by `dev` and is not the version carried forward.
