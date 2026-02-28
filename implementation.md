# Implementation Plan

This document lays out a step-by-step plan to take HeadlineGraphix V2 from its current “mock data” state to a production-ready app. Each phase lists the concrete tasks to tackle. Work sequentially unless otherwise noted.

---

## Phase 0 – Groundwork

1. **Inventory & Cleanup**
   - Run `npm run lint` and `npm run typecheck` to see the current error surface.
   - Remove/resolve unused dependencies or imports that lint highlights.
   - Document current `.env.example` values (Supabase, Google GenAI) and make sure `README.md` stays accurate.
2. **Environment Setup**
   - Standardize on Supabase (hosted Postgres + Storage) for persistence so every downstream task targets the same backend.
   - Register the Supabase MCP server (via the Supabase CLI) so local tools and Codex can administer the project through MCP.
   - Create project secrets for `GOOGLE_GENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and the `SUPABASE_SERVICE_ROLE_KEY` (store them with the MCP secret manager of your choice).
3. **Dev Experience**
   - Add `scripts` for seeding mock data, running tests, and formatting if missing.
   - Configure VS Code settings / EditorConfig if needed to keep consistent formatting.

---

## Phase 1 – Domain Modeling & Persistence

1. **Define User Profile Shape**
   - Document the profile schema: `{ id, email, name, focusTopics[], backlinkUrls[], brandPresets[], creditBalance, referenceImages[], contentHistory[], aiPreferences }` (see `docs/data-model.md`).
   - Capture AI-specific preferences like default tones, fallback tone, default reference image ids, CTA defaults, and generation temperature so the UI/server actions share the same defaults.
2. **Set Up Data Layer**
   - Use `@supabase/supabase-js` (browser + server clients) and/or Supabase RPCs exposed via MCP to talk to the Postgres database and Storage.
   - Create a thin abstraction in `src/lib/data` with functions like `getCurrentUserProfile()`, `updateUserPreferences()`, `listReferenceImages()`, `saveContentPack()`.
   - For now, hardcode a single dummy user ID (see the `DEMO_USER_ID` constant in `src/lib/data`, currently `00000000-0000-0000-0000-000000000001`). All reads/writes target this row. Replace later when auth lands.
3. **Supabase Database**
   - Create tables/schemas:
     - `hgprofiles` – stores preferences, credit count, onboarding state.
     - `reference_images` – metadata + Storage path (scoped by `user_id`).
     - `content_packs` – generated drafts + configs, references the profile.
   - Seed the dummy user with the mock data currently in `AppContext` using Supabase SQL (via MCP or the dashboard SQL editor).
4. **Storage**
   - Configure a Supabase Storage bucket (e.g., `reference-images`) for uploads.
   - Implement signed upload flow or Storage service role uploads via Supabase Edge Functions or Server Actions.

---

## Phase 2 – Data Access in the App

1. **Replace AppContext Mock Data**
   - Keep the context but source its initial state from the data layer.
   - Convert `useAppContext` methods (`addHistoryItem`, `savePreferences`, etc.) into async functions that call Supabase Postgres + Storage.
   - Ensure optimistic UI updates with rollback on failure.
2. **API Routes or Server Actions**
   - Where client components need secure access (e.g., uploading to Storage), add Next.js Server Actions or `/app/api/*` routes that invoke Supabase admin clients or MCP-run SQL.
   - Handle errors centrally with typed responses + toast messaging.
3. **Caching**
   - Use React Query/SWR (if added) or manual revalidation to avoid refetch loops.
   - Consider `next/cache` mutations if using App Router server components later.

---

## Phase 3 – Headlines & Preferences

1. **User Topics to News Feed**
   - Pick a news provider (NewsAPI, GNews, custom RSS) and wrap it under `src/lib/news`.
   - Implement `fetchHeadlinesForTopics(topics: string[])` that returns normalized `Headline` objects with `slug`, `title`, `source`, `date`, `content`.
2. **Ingestion Strategy**
   - For development, fetch directly from the provider on each request.
   - For production, consider a scheduled Supabase Edge Function + Cron job that stores curated headlines per topic to reduce API costs.
3. **Headlines Page Wiring**
   - Replace the timeout-based mock with a call to the news service.
   - Allow filtering/sorting, show fallback states (no headlines, API errors).
4. **Studio Routing**
   - Ensure `/studio/[slug]` can fetch the full article content by slug (via cached map or direct API call).

---

## Phase 4 – AI Flows

1. **Genkit Configuration**
   - Confirm `src/ai/genkit.ts` handles missing env gracefully (already validates). Add logging/config for prod vs. dev models if needed.
2. **Content Draft Flow**
   - Expand `GenerateContentDraftsInput` to include backlinks, tone presets, call-to-action preferences.
   - Pipe actual article content from the news API when available.
   - Store the resulting drafts + inputs when users save content packs.
3. **Image Flow**
   - Honor `referenceImages`: upload to Storage, get signed URLs, and pass them to Imagen via `media`.
   - Support aspect ratios from the UI (square, portrait, landscape).
4. **Summaries & Additional Agents**
   - Wire `summarizeHeadline` where quick context is needed (e.g., preview modals).
   - Consider additional flows such as CTA suggestions or SEO keyword extraction.

---

## Phase 5 – Media Handling

1. **Reference Image Uploads**
   - Replace the simulated uploader with actual uploads to Storage.
   - Generate thumbnails (optional) via Cloud Functions or Image CDN.
2. **Image Archive**
   - List real images from the user’s collection.
   - Enable delete/download via Storage APIs.
3. **Generated Infographics**
   - When the AI returns an image URL, persist it to Storage or keep remote URL metadata depending on licensing constraints.

---

## Phase 6 – UI/UX Enhancements

1. **Dashboard**
   - Show real credit balance, upcoming limits, last generated content, etc.
2. **Content Library**
   - Support pagination / search when many packs exist.
   - Add export options (Markdown, PDF) using server actions.
3. **Error & Loading States**
   - Wrap expensive sections with Suspense or skeletons that reflect real data fetching.

---

## Phase 7 – Testing & Observability

1. **Unit/Integration Tests**
   - Add tests for data layer functions (mock Supabase client interactions) and Genkit flows (mock responses).
   - Write React Testing Library tests for critical pages (headlines, studio).
2. **E2E Tests**
   - Use Playwright or Cypress to cover the main user story: update preferences → fetch headlines → generate content → save pack.
3. **Monitoring**
   - Wire up Supabase logs/observability or add custom logging (e.g., Sentry) for server actions and Edge Functions.

---

## Phase 8 – Authentication & Multi-User Rollout

1. **Choose Auth Provider**
   - Options already hinted: Clerk or Supabase Auth. Pick one and integrate.
   - Gate the App Router tree by wrapping `/app/(app)` with auth checks and redirect unauthenticated users to `/login`.
2. **Replace Dummy User**
   - Remove the hardcoded user ID. Use the authenticated user’s UID/email to scope Supabase reads/writes.
   - Backfill existing dummy data into a migration script if you need to preserve it.
3. **Role-Based Controls (Optional)**
   - Add roles/teams if needed (e.g., multi-seat accounts) by extending the user profile schema.
4. **Security Review**
   - Audit Supabase Row Level Security policies and Storage bucket rules to ensure users only access their data.
   - Verify server actions validate session tokens before hitting AI services or storage.

---

## Phase 9 – Polish & Launch

1. **Performance**
   - Optimize bundle size (code splitting, lazy load heavy components like ReactMarkdown).
   - Cache AI outputs where feasible to reduce cost.
2. **Documentation**
   - Update `README.md` and create user-facing docs (docs/ directory) that describe the real behavior.
3. **Deployment**
   - Configure Supabase Edge Functions/cron (or Vercel) for hosting APIs, and retire the old Firebase Hosting config when done.
   - Set up CI/CD (GitHub Actions) for linting, testing, and deploy previews.

---

### Ongoing
- Track AI usage and cost; implement quotas per user.
- Gather user feedback via feature flags or staged rollouts.
- Iterate on brand kits, templates, and analytics once the core flow is stable.

Following these phases ensures you build the real, profile-driven experience first (even with a dummy user), then layer authentication on once the product experience is solid.
