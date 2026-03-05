# Website Documentation (AutoMatch)

This document describes the structure and key components of the AutoMatch web application. The project is built on **Next.js (App Router)** and uses **TypeScript**.

## 🏗 Project Structure

Key directories and their purpose:

*   **`src/app`**: Main application routes (pages).
    *   `src/app/page.tsx`: Home page.
    *   `src/app/quiz`: Car matching quiz logic and pages.
    *   `src/app/results`: Quiz results page.
    *   `src/app/cars`: Car catalog and details pages (`/cars/[id]`).
    *   `src/app/compare`: Car comparison page.
    *   `src/app/journal`: Blog (articles from Sanity CMS).
    *   `src/app/dealers`: Landing page for dealers.
    *   `src/app/admin`: Admin panel (dealer management, requests, users).
    *   `src/app/studio`: Sanity Studio interface (CMS).
    *   `src/app/api`: API endpoints (including Cron jobs and integrations).

*   **`src/components`**: Reusable UI components.
    *   `src/components/quiz`: Quiz question components.
    *   `src/components/cars`: Car cards, filters, galleries.
    *   `src/components/admin`: Admin tables and modals.

*   **`src/lib`**: Utilities and data handling logic.
    *   `prisma.ts`: Database client.
    *   `sanity.ts`: Sanity CMS client.
    *   `googleSheets.ts`: Google Sheets integration.
    *   `dealers-sync.ts`: Dealer inventory synchronization logic.

*   **`prisma`**: Database schema (`schema.prisma`).

## 🗄 Data Sources

The project uses several data sources:

### 1. Database (PostgreSQL + Prisma)
The primary data storage for the application.
*   **Dealer**: Dealer information (name, slug, feed URL).
*   **Car**: Vehicles (VIN, make, model, price, photos, etc.). Linked to a Dealer.
*   **Admin**: Admin panel users (email, password, role).
*   **DealerContactRequest**: Connection requests from dealers.

### 2. CMS (Sanity)
Used for managing blog content (Journal).
*   **Content**: Articles, categories, authors.
*   **Access**: Via `/studio` or API client (`src/lib/sanity.ts`).

### 3. Google Sheets
Used as the **primary database** for the Car Catalog, Quiz, and Comparison tools.
*   **Access**: Client-side via `src/lib/dataset.ts`, which fetches from a secure API proxy (`/api/sheet-data`).
*   **Caching**: Data is cached in the browser's `localStorage` for 3 hours to minimize API calls and improve performance.
*   **Auth**: Server-side Service Account (JWT) via `src/lib/googleSheets.ts`.

### 4. External APIs and Integrations
*   **AutoDev API**: Used exclusively on the `/stats` page (`src/app/stats/page.tsx`) to fetch market data and listing statistics. It provides an overview of available vehicles by year range and is **not** used for the main car catalog.
*   **Meta Pixel**: Handles analytics and event tracking (`src/lib/pixel.ts`). Tracked events include:
    *   `StartQuiz` / `CompletedQuiz` (Quiz interactions).
    *   `DeepInterest_Cars_2min` (User spent >2 mins browsing cars).
    *   `JournalView` (Blog article views).
    *   `CompareCarsView` (Using the comparison tool).
    *   `ForDealersView` / `ForDealersRequest` (Dealer page interactions).

## ⚙️ Key Functionality

### Inventory Synchronization (Cron)
*   **Mechanism**: Cron job running on a schedule (or triggered manually).
*   **Endpoint**: `/api/cron/sync-dealers`.
*   **Logic**:
    1.  Fetches the list of dealers from the DB.
    2.  Downloads the CSV feed for each dealer (`feedUrl`).
    3.  Parses data and updates the `Car` table (creates new, updates existing, deletes sold).

### Admin Panel (`/admin`)
Allows administrators to:
*   Manage the list of dealers (add, edit, delete).
*   View the car inventory of a specific dealer.
*   View connection requests (`Requests`).
*   Manage admin users (`Users`).

### Quiz
The main tool for car matching.
*   User goes through a series of questions.
*   Answers are analyzed, and recommendations (Match Score) are provided on the `/results` page.
