# Data Model

This document describes the Supabase tables that back the HeadlineGraphix experience. Fields are expressed using PostgreSQL-friendly types, but the same structure can be serialized to JSON for mocks or seed files.

## `hgprofiles`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key, matches Supabase Auth user id (or the hardcoded `DEMO_USER_ID` until auth is wired). |
| `email` | `text` | User email for contact + auth. |
| `name` | `text` | Display name. |
| `focus_topics` | `text[]` | Saved topic filters for tailoring headline feeds. |
| `backlink_urls` | `text[]` | Canonical URLs to include in generated CTAs. |
| `brand_presets` | `jsonb` | Array of preset objects `{ id, name, tone, palette, logoUrl }`. |
| `credit_balance` | `integer` | AI generation credits remaining. |
| `reference_images` | `jsonb` | Cached metadata for the latest uploaded reference images `{ id, storagePath, imageUrl, aiHint }`. |
| `content_history` | `jsonb` | Lightweight cache of the most recent content pack ids for quick display in the sidebar. |
| `ai_preferences` | `jsonb` | AI-specific defaults described below. |
| `created_at` / `updated_at` | `timestamptz` | Standard timestamps. |

### `ai_preferences` structure

```ts
type AIPreferences = {
  defaultTone: string;           // e.g. 'Professional'
  fallbackTone: string;
  defaultReferenceImageId?: string;
  defaultLinkedInCallToAction?: string;
  temperature?: number;          // model creativity knob
  maxDraftsPerRequest?: number;  // to cap tokens/costs
};
```

Default tone + image selections give the UI and server flows a consistent starting point when the user has not supplied overrides. The additional knobs (CTA, temperature, max drafts) are available for future experimentation without additional schema changes.

## `reference_images`

Although the profile JSON stores a quick cache for rendering, every uploaded image also gets a proper row:

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `user_id` | `uuid` | FK → `hgprofiles.id`. |
| `storage_path` | `text` | Path inside the Supabase Storage bucket. |
| `image_url` | `text` | Signed/public URL. |
| `description` | `text` | User-entered description or AI hint. |
| `ai_hint` | `text` | Optional textual hint to feed Imagen/Genkit. |
| `created_at` | `timestamptz` | Upload timestamp. |

## `content_packs`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `user_id` | `uuid` | FK → `hgprofiles.id`. |
| `headline_id` | `text` | Headline slug or external id. |
| `headline` | `text` | Snapshot of the source headline. |
| `reference_image_id` | `uuid` | FK → `reference_images.id`, nullable. |
| `reference_image_url` | `text` | Cached URL while the image remains in the archive. |
| `reference_image_removed_at` | `timestamptz` | Timestamp set when the archive image is deleted. |
| `config` | `jsonb` | Input configuration `{ brandTone, referenceImage, userAngle, backlinks[] }`. |
| `drafts` | `jsonb` | Draft payload `{ blogPost, linkedInPost, infographicUrl }`. |
| `generated_at` | `timestamptz` | When the AI job finished. |

The `content_history` JSON inside `hgprofiles` stores a limited slice of the most recent `content_packs.id` values for instant access. When the UI needs deeper history it should query the `content_packs` table directly.

---

Keeping the schema centralized here makes it easier to align Supabase migrations, mock data, and the AppContext shape as we replace the in-memory store with real persistence.
