# 🛡️ Admin Area & Database Management

This document details the architecture of the **Admin Panel** (`/admin`) and the underlying **Database** structure managed via Prisma.

## 🏗 Architecture Overview

The Admin Area is a protected section of the Next.js application designed for managing dealers, inventory, and user access.

*   **Route**: `/admin` (Protected by `AdminLayout`).
*   **Authentication**: Custom JWT-based session management (`src/lib/auth.ts`).
*   **Database**: PostgreSQL (hosted on Vercel/Neon), managed via Prisma ORM.
*   **Sync Engine**: Automated inventory synchronization from Dealer CSV feeds.

---

## 🗄 Database Schema (Prisma)

The database schema is defined in `prisma/schema.prisma`. It consists of four main models:

### 1. Dealer
Represents a car dealership partner.
*   `id` (UUID): Unique identifier.
*   `name` (String): Display name.
*   `slug` (String, Unique): URL-friendly identifier.
*   `feedUrl` (String, Optional): The URL to the dealer's CSV inventory feed.
*   `cars` (Relation): One-to-many relationship with `Car`.

### 2. Car
Represents a specific vehicle in a dealer's inventory.
*   **Composite Unique Key**: `[dealerId, vin]` ensures a VIN is unique *per dealer*.
*   `vin` (String): Vehicle Identification Number.
*   `make`, `model`, `year` (String/Int): Core specs.
*   `price` (Decimal): Listing price.
*   `mileage` (Int): Odometer reading.
*   `imageUrl` (String): Primary photo URL.
*   `features` (JSON): Flexible storage for options/packages.
*   `dealerId` (FK): Links to `Dealer`.

### 3. Admin
Represents a dashboard user.
*   `email` (String, Unique): Login credential.
*   `passwordHash` (String): Bcrypt-hashed password.
*   `role` (String): Defaults to "ADMIN".

### 4. DealerContactRequest
Stores leads from the "For Dealers" landing page.
*   `dealershipName`, `contactName`, `email`, `phone`: Contact details.
*   `status` (String): Workflow status (default: "new").

---

## 🔐 Authentication & Security

The Admin Panel uses a custom, lightweight authentication system rather than NextAuth.js.

### Implementation Details
*   **Library**: `jose` (JSON Object Signing and Encryption).
*   **Token**: JWT (HS256 algorithm).
*   **Storage**: HTTP-Only Cookie named `admin_session`.
*   **Expiry**: 24 hours.

### Key Files
*   `src/lib/auth.ts`: Handles token signing (`signSession`), verification (`verifySession`), and cookie retrieval (`getSession`).
*   `src/app/api/admin/login/route.ts`: Validates credentials and sets the cookie.
*   `src/app/admin/(main)/layout.tsx`: Server Component that checks for a valid session via `getSession()`. Redirects unauthenticated users to `/admin/login`.

---

## 🔄 Inventory Synchronization

The system features an automated engine to keep dealer inventory up-to-date without manual entry.

### Logic Flow (`src/lib/dealers-sync.ts`)
1.  **Trigger**: Can be triggered manually via API or potentially via Cron (see `src/app/api/cron/sync-dealers` if implemented).
2.  **Fetch**: Retrieves the CSV file from the Dealer's `feedUrl`.
3.  **Parse**: Uses `papaparse` to convert CSV text to JSON objects.
4.  **Validation**: Skips rows missing critical data (VIN, Make, Model, Year, Price).
5.  **Upsert**: Uses `prisma.car.upsert()`:
    *   **Update**: If `(dealerId, vin)` exists, updates price, mileage, etc.
    *   **Create**: If not found, creates a new record.

### CSV Format Requirements
The sync engine expects headers similar to:
*   `VIN`
*   `Make`
*   `Model`
*   `Year`
*   `Price`
*   `Mileage` (Optional)
*   `ImageURL` or `Image` (Optional)
*   `Features` (Optional, pipe `|` or comma separated)

---

## 🛠 API Routes

The Admin frontend interacts with a set of dedicated API endpoints in `src/app/api/admin`:

*   **Auth**:
    *   `/api/admin/login`: POST (Email/Password).
    *   `/api/admin/logout`: POST (Clears cookie).
    *   `/api/admin/me`: GET (Current user info).
    *   `/api/admin/change-password`: POST.
    *   `/api/admin/invite`: POST (Create new admin).

*   **Management**:
    *   `/api/admin/dealers`: GET (List), POST (Create).
    *   `/api/admin/dealers/[id]`: PUT (Update), DELETE.
    *   `/api/admin/users`: User management.
    *   `/api/admin/requests`: Lead management.
