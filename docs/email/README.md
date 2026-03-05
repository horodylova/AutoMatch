# 📧 Email Services & Communication

This document details the email delivery systems and contact request handling in the AutoMatch project.

## 🏗 Architecture Overview

The project uses two distinct services for different types of communication:

1.  **Formspree**: For handling "Contact Us" and "For Dealers" form submissions (External Service).
2.  **Brevo (formerly Sendinblue)**: For sending transactional emails (Quiz Results) via API.

---

## 🤝 Dealer Contact Requests ("For Dealers")

This flow handles inquiries from potential dealer partners on the `/dealers` page.

### 1. Form Submission (Formspree)
*   **Trigger**: User submits the "Get Matched Buyers" form.
*   **Service**: [Formspree](https://formspree.io).
*   **Endpoint**: `process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT` (fallback: `https://formspree.io/f/mqebkzdj`).
*   **Purpose**: Sends an immediate email notification to the site administrators/managers.
*   **Implementation**: `src/utils/formSubmission.ts` handles the POST request to Formspree.

### 2. Database Recording (Internal)
*   **Trigger**: Immediately after a successful Formspree submission.
*   **Endpoint**: `/api/dealers/contact`.
*   **Database Model**: `DealerContactRequest` (Prisma).
*   **Purpose**: Stores the lead in the internal database for the Admin Panel (`/admin`).
*   **Data Stored**:
    *   `dealershipName` (Company)
    *   `contactName` (Name)
    *   `email`
    *   `phone`
    *   `interest`
    *   `status` (Default: "new")

### 📝 Code Reference
*   **Frontend**: `src/app/dealers/page.tsx` (Handles both Formspree submission and API call).
*   **API Route**: `src/app/api/dealers/contact/route.ts` (Saves to Prisma).
*   **Admin View**: `src/app/api/admin/requests/route.ts` (Retrieves list for Admin UI).

---

## 📨 Quiz Results Email

This flow sends a rich HTML email to users with their car matches.

### 1. Sending Logic (Brevo)
*   **Trigger**: User clicks "Email Results" in the results gallery or "Save for Later" modal.
*   **Service**: [Brevo](https://www.brevo.com/) (Transactional Email API).
*   **Endpoint**: `https://api.brevo.com/v3/smtp/email`.
*   **Authentication**: `process.env.BREVO_API_KEY`.
*   **Sender**: `CarCupid <noreply@carcupid.fit>`.

### 2. Implementation Details
*   **Frontend**: `src/components/quiz/modals/EmailModal.tsx`.
*   **API Route**: `src/app/api/send-results/route.ts`.
*   **Content**: Generates an HTML template server-side containing the list of matched cars (Year, Make, Model, Image).

### 📝 Code Reference
*   **API Handler**: [route.ts](file:///Users/svetlanagorodilova/w/AutoMatch/src/app/api/send-results/route.ts)
*   **Utility**: [api.ts](file:///Users/svetlanagorodilova/w/AutoMatch/src/utils/api.ts)

---

## 🔑 Environment Variables

Required secrets in `.env`:

```env
# For Dealer Contact Form
NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/mqebkzdj

# For Quiz Results Email
BREVO_API_KEY=xkeysib-...
```
