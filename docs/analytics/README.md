# 📊 Analytics & Tracking Implementation

This document details the integration of **Meta Pixel** (Facebook) and **Google Analytics 4 (GA4)** within the AutoMatch project.

## 🏗 Architecture Overview

Analytics providers are initialized in the global layout to ensure they run on every page.

*   **File**: `src/components/ClientLayout.tsx`
*   **Wrappers**:
    *   `<GoogleAnalytics />` (from `@next/third-parties/google`)
    *   `<FacebookPixel />` (Custom Client Component)

---

## ♾️ Meta Pixel (Facebook)

The Meta Pixel is used for tracking user behavior, retargeting, and conversion optimization.

### ⚙️ Configuration
*   **Pixel ID**: `1594732338344456` (Hardcoded in `src/lib/pixel.ts` and `src/components/FacebookPixel.tsx`).
*   **Component**: `src/components/FacebookPixel.tsx`
    *   Uses `next/script` with `strategy="afterInteractive"`.
    *   Automatically triggers `PageView` on route changes using `usePathname()` and `useSearchParams()`.
    *   Wrapped in `Suspense` to handle search params safely.

### 📡 Tracked Events
Custom events are fired using the `event` function from `src/lib/pixel.ts`.

| Event Name | Trigger Location | Description |
| :--- | :--- | :--- |
| **PageView** | `FacebookPixel.tsx` | Fired automatically on every route change. |
| **StartQuizView** | `src/app/quiz/page.tsx` | User lands on the Quiz introduction. |
| **StartQuiz** | `src/components/quiz/QuizIntro.tsx` | User clicks "Start Quiz". |
| **CompletedQuiz** | `src/hooks/useQuiz.ts` | User finishes the quiz and sees results. |
| **JournalView** | `src/components/JournalViewTracker.tsx` | User reads a blog article (Client Component wrapper). |
| **CompareCarsView** | `src/app/compare/page.tsx` | User lands on the Comparison page. |
| **CompareCarsClick** | `src/app/compare/page.tsx` | User clicks to compare specific vehicles. |
| **ForDealersView** | `src/app/dealers/page.tsx` | User views the "For Dealers" page. |
| **ForDealersRequest** | `src/app/dealers/page.tsx` | User submits the dealer contact form. |
| **ForDealersClick** | `src/app/dealers/page.tsx` | User interacts with dealer page elements. |
| **DeepInterest_Cars_2min** | `src/components/CarListingTimer.tsx` | User spends >2 minutes cumulatively browsing car listings in a session. |

---

## 📈 Google Analytics 4 (GA4)

GA4 is used for general traffic analysis and user journey tracking.

### ⚙️ Configuration
*   **Measurement ID**: `process.env.NEXT_PUBLIC_GA_ID`.
*   **Component**: `<GoogleAnalytics />` in `ClientLayout.tsx`.
*   **Condition**: Only renders in `production` environment (`process.env.NODE_ENV === 'production'`).

### 📡 Tracked Events
Custom events are fired using the `sendEvent` function from `src/lib/gtag.ts` (wrapper around `sendGAEvent`).

| Event Name | Trigger Location | Parameters |
| :--- | :--- | :--- |
| **quiz_start** | `src/components/quiz/QuizIntro.tsx` | None |
| **quiz_complete** | `src/hooks/useQuiz.ts` | `match_count`: Number of matched cars. |
| **dealer_click** | `src/components/ResultsGallery.tsx` | `car_make`, `car_model`, `dealer_name`, `price`. |

---

## 🛠 Helper Utilities

### `src/lib/pixel.ts`
*   `pageview()`: Manually triggers a PageView (mostly handled automatically by the component).
*   `event(name, options)`: Triggers a custom event with optional JSON data.

### `src/lib/gtag.ts`
*   `sendEvent(eventName, params)`: Sends a generic event to GA4.
*   `trackQuizStart()`: Helper for quiz start.
*   `trackQuizComplete(matchCount)`: Helper for quiz completion.
*   `trackDealerClick(...)`: Helper for tracking clicks on dealer links.
