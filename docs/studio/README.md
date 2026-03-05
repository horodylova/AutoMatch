# 🎙 Sanity Studio & Content Management

This document details the integration of **Sanity Studio**, the headless CMS used for managing blog content ("Journal") in AutoMatch.

## 🏗 Architecture Overview

The project uses an **Embedded Sanity Studio**, meaning the CMS interface is rendered directly within the Next.js application rather than being hosted separately.

*   **Route**: `/studio` (and all sub-paths via `[[...tool]]`).
*   **Configuration**: `sanity.config.ts` (Project Root).
*   **Schema Definition**: `src/sanity/schemaTypes`.
*   **Environment Variables**: `src/sanity/env.ts`.

---

## ⚙️ Configuration

The Studio is configured in `sanity.config.ts` using `defineConfig` from `sanity`.

```typescript
// sanity.config.ts
export default defineConfig({
  basePath: '/studio', // Mounts the Studio at this path
  projectId,           // From env: NEXT_PUBLIC_SANITY_PROJECT_ID
  dataset,             // From env: NEXT_PUBLIC_SANITY_DATASET
  schema,              // Imported from src/sanity/schemaTypes
  plugins: [
    structureTool(),   // The default content editing tool
  ],
})
```

### Environment Variables
The configuration relies on `src/sanity/env.ts`, which safely loads and asserts the presence of:

*   `NEXT_PUBLIC_SANITY_PROJECT_ID`: The unique ID of the Sanity project.
*   `NEXT_PUBLIC_SANITY_DATASET`: The dataset name (usually `production`).
*   `NEXT_PUBLIC_SANITY_API_VERSION`: API version date (default: `2024-01-21`).

---

## 🗂 Content Schema

The content model is defined in `src/sanity/schemaTypes/index.ts` and currently consists of two document types:

### 1. Post (`post`)
Represents a blog article in the "Journal".
*   **File**: `src/sanity/schemaTypes/post.ts`
*   **Fields**:
    *   `title` (String): Article headline.
    *   `slug` (Slug): URL-friendly identifier (generated from title).
    *   `mainImage` (Image): Featured image with alt text.
    *   `publishedAt` (Datetime): Publication date.
    *   `categories` (Array of References): Links to `category` documents.
    *   `tags` (Array of Strings): Simple text tags.
    *   `excerpt` (Text): Short summary for previews (max 3 rows).
    *   `body` (Portable Text): The main content, supporting rich text and embedded images with alignment options (Left, Right, Center).

### 2. Category (`category`)
Represents a classification for posts.
*   **File**: `src/sanity/schemaTypes/category.ts`
*   **Fields**:
    *   `title` (String): Name of the category.
    *   `description` (Text): Optional description.

---

## 🔌 Integration Logic

### Page Rendering
The Studio is rendered via a Next.js **Client Component** at `src/app/studio/[[...tool]]/page.tsx`.

```tsx
// src/app/studio/[[...tool]]/page.tsx
'use client'
import {NextStudio} from 'next-sanity/studio'
import config from '../../../../sanity.config'

export default function StudioPage() {
  return <NextStudio config={config} />
}
```
*   **Route Segment**: `[[...tool]]` is an optional catch-all route, ensuring that sub-paths like `/studio/structure/post` are correctly handled by the Single Page Application (SPA) of the Studio.
*   **Force Static**: The page exports `dynamic = 'force-static'` to ensure optimal loading performance.

### Data Fetching
To fetch data from Sanity in the frontend (e.g., for the Journal page), the project uses the Sanity Client (configured in `src/lib/sanity.ts` or similar utility) to execute **GROQ** queries against the dataset defined in the environment.
