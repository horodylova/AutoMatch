# Payments

This document describes the current payments implementation for Dealer onboarding based on the repository code.

## Overview
- UI: Dealer Order page [dealers/order/page.tsx](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/dealers/order/page.tsx)
- Modes:
  - Subscription (monthly $150) via `/api/dealers/subscribe`
  - One-time payment (Card/ACH) via `/api/dealers/checkout` for multi-month prepay
- Success page: [order/success](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/dealers/order/success/page.tsx)
- Cancel page: [order/cancel](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/dealers/order/cancel/page.tsx)

## Dealer Order UI Behavior
- Collects:
  - Dealer Name
  - Contact Name/Email/Phone
  - Website (normalized to https://)
  - Optional Start Date
  - Term (for one-time checkout)
  - Payment preference: Subscription vs Checkout
- Submission:
  - Subscription: POST `/api/dealers/subscribe` with `{ dealerName, contactName, email, phone, website }`
  - Checkout: POST `/api/dealers/checkout` with `{ termMonths, startDate, dealerName, contactName, email, phone, website }`
- Redirect:
  - On success, redirects to Stripe Checkout URL; success/cancel are handled via app routes

## API: Subscription
- File: [subscribe route](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/api/dealers/subscribe/route.ts)
- Requires:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PRICE_SUBSCRIPTION_MONTHLY`
  - `NEXT_PUBLIC_APP_URL` (fallback for success/cancel URL base)
- Creates `mode: "subscription"` session:
  - `success_url`: `${origin}/dealers/order/success?sid={CHECKOUT_SESSION_ID}`
  - `cancel_url`: `${origin}/dealers/order/cancel`
  - `customer_email`: populated from contact email
  - Metadata includes dealer/contact fields for downstream processing

## API: One-time Checkout
- File: [checkout route](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/api/dealers/checkout/route.ts)
- Requires:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_PMC_ID` (optional, Payment Method Configuration)
  - `NEXT_PUBLIC_APP_URL`
- Creates `mode: "payment"` session:
  - `payment_method_types`: `["card", "us_bank_account"]`
  - ACH verification method: `automatic`
  - Line item: `$150.00` unit amount, quantity = `termMonths`
  - `success_url` / `cancel_url` same as subscription
  - Metadata mirrors intent payload

## Webhooks
- File: [Stripe webhook](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/api/webhooks/stripe/route.ts)
- Requires:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `BREVO_API_KEY` (optional; transactional emails)
- Handled events:
  - `invoice.payment_succeeded`
    - Dealer lookup: by `stripeCustomerId` or `customer_email`
    - Term extension: `termEndAt = addMonths(anchor, 1)` where `anchor` is `max(now, dealer.termEndAt)`
    - Dealer update: `billingStatus = "active"`, `termEndAt` set
    - Payment upsert:
      - `provider: "stripe"`, `method: "invoice"`, `status: "succeeded"`
      - `termMonths: 1`
      - `startDate: anchor`, `endDate: termEnd`
      - `stripeInvoiceId`, `stripeCustomerId`, `amount`, `currency`
    - Email: renewal email via Brevo with amount, billed date, and term end
  - `invoice.payment_failed`
    - Dealer update: `billingStatus = "past_due"`
    - Email: failure notice via Brevo

### Not handled (by current code)
- `checkout.session.completed`
- `payment_intent.succeeded`
- Implication: one-time Checkout payments do not create a `payment` DB record via webhook; subscription renewals do.

## Admin Integration
- Dealer list enrichment: [admin dealers GET](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/api/admin/dealers/route.ts)
  - Includes latest `payments` info and `cancelAtPeriodEnd` derived from Stripe active subscriptions
- Unsubscribe: [admin unsubscribe route](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/api/admin/dealers/[id]/unsubscribe/route.ts)
  - Schedules cancellation at period end in Stripe (`cancel_at_period_end: true` on active subscriptions)
  - Dealer remains `billingStatus: "active"` until end of current term; access preserved
  - Sends email with manager contact link

## Dealer Billing State
- `billingStatus`: `"active"` or `"past_due"` (set via webhook processing)
- `termEndAt`: extended monthly on successful subscription invoice
- `cancelAtPeriodEnd`: derived at runtime in Admin via Stripe subscriptions list

## Environment Variables
- `STRIPE_SECRET_KEY` — Stripe API key
- `STRIPE_PRICE_SUBSCRIPTION_MONTHLY` — Price ID for monthly subscription
- `STRIPE_WEBHOOK_SECRET` — Webhook signing secret
- `STRIPE_PMC_ID` — Payment Method Configuration (optional)
- `NEXT_PUBLIC_APP_URL` — Base URL for success/cancel redirect
- `BREVO_API_KEY` — Transactional email provider key (optional)
