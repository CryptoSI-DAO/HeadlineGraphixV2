# Migration Plan: Self-Hosted Supabase → Hosted Supabase (MCP)

## Overview

This document outlines the migration of the HeadlineGraphixV2 application from a self-hosted Supabase instance (now offline) to a hosted Supabase project via the MCP connection. This migration involves:

1. **Authentication Setup**: Configure Supabase Auth for user management
2. **Database Schema Creation**: Create all required tables with proper RLS policies
3. **Storage Buckets**: Set up storage for images (brand logos, reference images)
4. **Environment Configuration**: Update application to use new Supabase credentials
5. **Data Migration**: Migrate any existing data (if available)

> **Note**: This plan follows official Supabase best practices documented at https://supabase.com/docs

---

## Current State Analysis

### Existing Database Tables (from codebase)

Based on the codebase analysis, the following tables are referenced:

| Table Name | Purpose | Key Fields |
|------------|---------|------------|
| `hgprofiles` | User profiles | id, email, name, focus_topics, backlink_urls, brand_presets, credit_balance, reference_images, content_history, ai_preferences |
| `brand_kits` | Brand configurations | id, user_id, name, primary_color, secondary_color, trim_color, font, art_style, logo_storage_path, logo_url, logo_alt |
| `reference_images` | User reference images | id, user_id, storage_path, image_url, description, ai_hint |
| `content_packs` | Generated content | id, user_id, headline_id, headline, config, drafts, generated_at |

### Current Supabase Configuration

**Old (Self-Hosted - Offline):**
- URL: `https://supabase.cryptosi.org`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Service Role Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**New (Hosted via MCP):**
- Project ID: `rfcwtdadbecxmndgndge`
- Project Name: `CryptoSI`
- Organization: `CryptoSI DAO` (rucvnmddaiuffkuwcslq)
- Region: `eu-west-1`
- URL: `https://rfcwtdadbecxmndgndge.supabase.co`
- Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY3d0ZGFkYmVjeG1uZGduZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MjYxODYsImV4cCI6MjA4MzIwMjE4Nn0.bEz2TiYI1WgyXU9Bo_o0wG1qXXx92oqXZhpFuahHQhM`

### Existing Tables in Hosted Supabase

The hosted Supabase project already contains some tables from another application:
- `daoprojects`, `daoprojectstages`
- `chat_conversations`, `chat_messages`
- `user_profiles`, `user_settings`
- `tasks`, `task_events`, `task_reminders`
- `agent_action_logs`

**Note**: These tables are from a different application and should not interfere with our migration.

---

## Migration Architecture

```mermaid
graph TB
    subgraph Migration Phases
        A[Phase 1: Auth Setup] --> B[Phase 2: Database Schema]
        B --> C[Phase 3: Storage Buckets]
        C --> D[Phase 4: Environment Config]
        D --> E[Phase 5: Testing & Validation]
    end

    subgraph Phase 1
        A1[Enable Email Auth] --> A2[Configure Auth Providers]
        A2 --> A3[Create Auth Trigger for Profiles]
    end

    subgraph Phase 2
        B1[Create hgprofiles Table] --> B2[Create brand_kits Table]
        B2 --> B3[Create reference_images Table]
        B3 --> B4[Create content_packs Table]
        B4 --> B5[Apply RLS Policies]
    end

    subgraph Phase 3
        C1[Create brand-logos Bucket] --> C2[Create reference-images Bucket]
        C2 --> C3[Configure Storage Policies]
    end

    subgraph Phase 4
        D1[Update .env.local] --> D2[Update .env.local.example]
        D2 --> D3[Verify Connection]
    end

    subgraph Phase 5
        E1[Test Authentication] --> E2[Test CRUD Operations]
        E2 --> E3[Test Storage Uploads]
    end
```

---

## Phase 1: Authentication Setup

### 1.1 Enable Email Authentication

The hosted Supabase project should have email authentication enabled by default. Verify and configure:

```sql
-- Verify auth is enabled (this is typically done via Supabase Dashboard)
-- No SQL needed - verify in Supabase Dashboard > Authentication > Providers
```

### 1.2 Configure Auth Settings

In Supabase Dashboard:
1. Go to **Authentication** > **Providers**
2. Ensure **Email** provider is enabled
3. Configure email templates if needed
4. Set up email confirmation settings (optional)

### 1.3 Create Auth Trigger for Automatic Profile Creation

This trigger automatically creates a user profile when a new user signs up:

```sql
-- Create a function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.hgprofiles (id, email, name, focus_topics, backlink_urls, brand_presets, credit_balance, reference_images, content_history, ai_preferences)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'New User'),
    '[]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    0,
    '[]'::jsonb,
    '[]'::jsonb,
    '{"defaultTone": "Professional", "fallbackTone": "Conversational"}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to call the function on new user signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## Phase 2: Database Schema Creation

### 2.1 Create `hgprofiles` Table

```sql
-- Create hgprofiles table
create table if not exists public.hgprofiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  focus_topics jsonb default '[]'::jsonb,
  backlink_urls jsonb default '[]'::jsonb,
  brand_presets jsonb default '[]'::jsonb,
  credit_balance integer default 0,
  reference_images jsonb default '[]'::jsonb,
  content_history jsonb default '[]'::jsonb,
  ai_preferences jsonb default '{"defaultTone": "Professional", "fallbackTone": "Conversational"}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Create index for faster lookups
create index if not exists hgprofiles_email_idx on public.hgprofiles(email);

-- Enable Row Level Security
alter table public.hgprofiles enable row level security;

-- RLS Policies
drop policy if exists "hgprofiles public read" on public.hgprofiles;
create policy "hgprofiles public read"
  on public.hgprofiles for select
  using (true);

drop policy if exists "hgprofiles user insert" on public.hgprofiles;
create policy "hgprofiles user insert"
  on public.hgprofiles for insert
  with check ((select auth.uid()) = id);

drop policy if exists "hgprofiles user update" on public.hgprofiles;
create policy "hgprofiles user update"
  on public.hgprofiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "hgprofiles user delete" on public.hgprofiles;
create policy "hgprofiles user delete"
  on public.hgprofiles for delete
  using ((select auth.uid()) = id);

-- Updated at trigger
create or replace function public.handle_hgprofiles_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists hgprofiles_updated_at on public.hgprofiles;
create trigger hgprofiles_updated_at
  before update on public.hgprofiles
  for each row execute function public.handle_hgprofiles_updated_at();
```

### 2.2 Create `brand_kits` Table

```sql
-- Create brand_kits table
create table if not exists public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.hgprofiles(id) on delete cascade,
  name text not null,
  primary_color text not null,
  secondary_color text not null,
  trim_color text not null,
  font text not null,
  art_style text not null,
  logo_storage_path text,
  logo_url text,
  logo_alt text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- Create index for faster user lookups
create index if not exists brand_kits_user_idx on public.brand_kits(user_id);

-- Enable Row Level Security
alter table public.brand_kits enable row level security;

-- RLS Policies
drop policy if exists "brand_kits user read" on public.brand_kits;
create policy "brand_kits user read"
  on public.brand_kits for select
  using ((select auth.uid()) = user_id);

drop policy if exists "brand_kits user insert" on public.brand_kits;
create policy "brand_kits user insert"
  on public.brand_kits for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "brand_kits user update" on public.brand_kits;
create policy "brand_kits user update"
  on public.brand_kits for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "brand_kits user delete" on public.brand_kits;
create policy "brand_kits user delete"
  on public.brand_kits for delete
  using ((select auth.uid()) = user_id);

-- Updated at trigger
drop trigger if exists brand_kits_updated_at on public.brand_kits;
create trigger brand_kits_updated_at
  before update on public.brand_kits
  for each row execute function public.handle_brand_kits_updated_at();
```

### 2.3 Create `reference_images` Table

```sql
-- Create reference_images table
create table if not exists public.reference_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.hgprofiles(id) on delete cascade,
  storage_path text not null,
  image_url text not null,
  description text,
  ai_hint text,
  created_at timestamptz not null default timezone('utc', now())
);

-- Create index for faster user lookups
create index if not exists reference_images_user_idx on public.reference_images(user_id);

-- Enable Row Level Security
alter table public.reference_images enable row level security;

-- RLS Policies
drop policy if exists "reference_images user read" on public.reference_images;
create policy "reference_images user read"
  on public.reference_images for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "reference_images user insert" on public.reference_images;
create policy "reference_images user insert"
  on public.reference_images for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "reference_images user update" on public.reference_images;
create policy "reference_images user update"
  on public.reference_images for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "reference_images user delete" on public.reference_images;
create policy "reference_images user delete"
  on public.reference_images for delete
  to authenticated
  using (auth.uid() = user_id);
```

### 2.4 Create `content_packs` Table

```sql
-- Create content_packs table
create table if not exists public.content_packs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.hgprofiles(id) on delete cascade,
  headline_id uuid,
  headline text not null,
  config jsonb not null,
  drafts jsonb not null,
  generated_at timestamptz not null default timezone('utc', now())
);

-- Create index for faster user lookups
create index if not exists content_packs_user_idx on public.content_packs(user_id);
create index if not exists content_packs_generated_at_idx on public.content_packs(generated_at desc);

-- Enable Row Level Security
alter table public.content_packs enable row level security;

-- RLS Policies
drop policy if exists "content_packs user read" on public.content_packs;
create policy "content_packs user read"
  on public.content_packs for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "content_packs user insert" on public.content_packs;
create policy "content_packs user insert"
  on public.content_packs for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "content_packs user delete" on public.content_packs;
create policy "content_packs user delete"
  on public.content_packs for delete
  to authenticated
  using (auth.uid() = user_id);
```

---

## Phase 3: Storage Buckets Setup

### 3.1 Create `brand-logos` Bucket

```sql
-- Create brand-logos bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-logos',
  'brand-logos',
  true,
  2097152, -- 2MB limit
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read policy
drop policy if exists "brand-logos public read" on storage.objects;
create policy "brand-logos public read"
  on storage.objects for select
  using (bucket_id = 'brand-logos');

-- Service role write policy (for server-side uploads)
drop policy if exists "brand-logos service write" on storage.objects;
create policy "brand-logos service write"
  on storage.objects for all
  to public
  using (bucket_id = 'brand-logos' and auth.role() = 'service_role')
  with check (bucket_id = 'brand-logos' and auth.role() = 'service_role');
```

### 3.2 Create `reference-images` Bucket

```sql
-- Create reference-images bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reference-images',
  'reference-images',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read policy
drop policy if exists "reference-images public read" on storage.objects;
create policy "reference-images public read"
  on storage.objects for select
  using (bucket_id = 'reference-images');

-- Service role write policy (for server-side uploads)
drop policy if exists "reference-images service write" on storage.objects;
create policy "reference-images service write"
  on storage.objects for all
  to public
  using (bucket_id = 'reference-images' and auth.role() = 'service_role')
  with check (bucket_id = 'reference-images' and auth.role() = 'service_role');
```

---

## Phase 4: Environment Configuration

### 4.1 Update `.env.local`

Replace the old Supabase credentials with the new hosted ones:

```env
# OLD (Self-Hosted - Offline)
# NEXT_PUBLIC_SUPABASE_URL=https://supabase.cryptosi.org
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NEW (Hosted via MCP)
NEXT_PUBLIC_SUPABASE_URL=https://rfcwtdadbecxmndgndge.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY3d0ZGFkYmVjeG1uZGduZGdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MjYxODYsImV4cCI6MjA4MzIwMjE4Nn0.bEz2TiYI1WgyXU9Bo_o0wG1qXXx92oqXZhpFuahHQhM
SUPABASE_SERVICE_ROLE_KEY=<GET_FROM_SUPABASE_DASHBOARD>
SUPABASE_DB_PASSWORD=optional_local_db_password

# Keep other API keys unchanged
GOOGLE_GENAI_API_KEY=
OPENROUTER_API_KEY=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
ZAI_API_KEY=8dd00adeef3b44dab73d4c342fa70d23.mXCAJfl59rcXankf
OPENAI_API_KEY=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
```

**Note**: The `SUPABASE_SERVICE_ROLE_KEY` needs to be retrieved from the Supabase Dashboard:
1. Go to https://supabase.com/dashboard/project/rfcwtdadbecxmndgndge/settings/api
2. Copy the `service_role` secret

### 4.2 Update `.env.local.example`

Update the example file to reflect the new structure:

```env
# Copy this template to .env.local before running the dev server.

# Supabase Configuration (client + server)
# Get these from: https://supabase.com/dashboard/project/rfcwtdadbecxmndgndge/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://rfcwtdadbecxmndgndge.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_DB_PASSWORD=optional_local_db_password

# Google AI Configuration (required for Genkit flows)
GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here

# GLM Configuration (required for the "GLM (Free)" model option)
GLM_API_KEY=your_glm_api_key_here
```

---

## Phase 5: Testing & Validation

### 5.1 Authentication Testing

1. **Test User Sign Up**:
   - Navigate to `/login` page
   - Attempt to sign up with a new email
   - Verify profile is automatically created in `hgprofiles` table

2. **Test User Sign In**:
   - Sign in with existing credentials
   - Verify session is properly established
   - Check that user profile is accessible

3. **Test Session Management**:
   - Verify session persistence across page refreshes
   - Test sign out functionality

### 5.2 Database Operations Testing

1. **Profile Operations**:
   - Test GET `/api/profile` - returns user profile
   - Test PUT `/api/profile` - updates user profile
   - Test GET `/api/preferences` - returns user preferences
   - Test PUT `/api/preferences` - updates user preferences

2. **Brand Kits Operations**:
   - Test GET `/api/brand-kits` - lists user's brand kits
   - Test POST `/api/brand-kits` - creates new brand kit
   - Test DELETE `/api/brand-kits/[id]` - deletes brand kit

3. **Reference Images Operations**:
   - Test GET `/api/reference-images` - lists user's reference images
   - Test POST `/api/reference-images` - uploads new reference image
   - Test DELETE `/api/reference-images/[id]` - deletes reference image

4. **Content Packs Operations**:
   - Test GET `/api/content-packs` - lists user's content packs
   - Test POST `/api/content-packs` - saves new content pack
   - Test DELETE `/api/content-packs/[id]` - deletes content pack

### 5.3 Storage Testing

1. **Brand Logos Upload**:
   - Create a brand kit with a logo
   - Verify logo is uploaded to `brand-logos` bucket
   - Verify logo URL is accessible

2. **Reference Images Upload**:
   - Upload a reference image
   - Verify image is uploaded to `reference-images` bucket
   - Verify image URL is accessible

### 5.4 RLS Policy Validation

1. **User Isolation**:
   - Create two different user accounts
   - Verify User A cannot access User B's data
   - Verify each user can only access their own data

2. **Public Access**:
   - Verify public read policies work correctly
   - Test that unauthenticated users cannot write data

---

## Data Migration (If Needed)

### Assessing Data Migration Needs

Since the self-hosted Supabase is offline, we need to determine if there's any data that needs to be migrated:

1. **Check for existing data dumps**:
   - Look for SQL dumps in the project
   - Check for any backup files

2. **Assess critical data**:
   - User profiles and preferences
   - Brand kits and logos
   - Reference images
   - Content packs

### Migration Script (If Data Exists)

If data is available for migration, use the following approach:

```sql
-- Example migration script (adjust based on actual data structure)
-- This would be run after exporting data from the old database

-- Import users (if auth.users export is available)
-- Note: This requires special handling as auth.users is a system table

-- Import profiles
insert into public.hgprofiles (id, email, name, focus_topics, backlink_urls, brand_presets, credit_balance, reference_images, content_history, ai_preferences, created_at, updated_at)
select
  id,
  email,
  name,
  focus_topics,
  backlink_urls,
  brand_presets,
  credit_balance,
  reference_images,
  content_history,
  ai_preferences,
  created_at,
  updated_at
from old_hgprofiles;

-- Import brand_kits
insert into public.brand_kits (id, user_id, name, primary_color, secondary_color, trim_color, font, art_style, logo_storage_path, logo_url, logo_alt, created_at, updated_at)
select
  id,
  user_id,
  name,
  primary_color,
  secondary_color,
  trim_color,
  font,
  art_style,
  logo_storage_path,
  logo_url,
  logo_alt,
  created_at,
  updated_at
from old_brand_kits;

-- Import reference_images
insert into public.reference_images (id, user_id, storage_path, image_url, description, ai_hint, created_at)
select
  id,
  user_id,
  storage_path,
  image_url,
  description,
  ai_hint,
  created_at
from old_reference_images;

-- Import content_packs
insert into public.content_packs (id, user_id, headline_id, headline, config, drafts, generated_at)
select
  id,
  user_id,
  headline_id,
  headline,
  config,
  drafts,
  generated_at
from old_content_packs;
```

---

## Rollback Plan

If issues arise during migration, the following rollback steps can be taken:

1. **Revert Environment Variables**:
   - Restore old `.env.local` values
   - Restart the development server

2. **Database Rollback**:
   - Drop newly created tables: `hgprofiles`, `brand_kits`, `reference_images`, `content_packs`
   - Remove storage buckets: `brand-logos`, `reference-images`
   - Remove auth trigger: `on_auth_user_created`

3. **Verification**:
   - Verify application works with old configuration
   - Document issues encountered

---

## Post-Migration Tasks

### 1. Generate TypeScript Types

After creating the database schema, generate TypeScript types for better type safety:

```bash
# This can be done via Supabase CLI or manually
npx supabase gen types typescript --project-id rfcwtdadbecxmndgndge --schema public > src/lib/database.types.ts
```

### 2. Update Documentation

- Update README.md with new Supabase configuration
- Document any changes to API endpoints
- Update deployment guides

### 3. Monitor and Optimize

- Monitor database performance
- Check query execution times
- Add indexes if needed
- Review RLS policies for any issues

### 4. Security Review

- Verify all RLS policies are working correctly
- Check for any security vulnerabilities
- Run Supabase advisors: `get_advisors` for security and performance

---

## Migration Checklist

- [ ] Phase 1: Authentication Setup
  - [ ] Verify email auth is enabled
  - [ ] Configure auth providers
  - [ ] Create auth trigger for profile creation

- [ ] Phase 2: Database Schema Creation
  - [ ] Create `hgprofiles` table with RLS
  - [ ] Create `brand_kits` table with RLS
  - [ ] Create `reference_images` table with RLS
  - [ ] Create `content_packs` table with RLS
  - [ ] Create all indexes
  - [ ] Create all triggers

- [ ] Phase 3: Storage Buckets Setup
  - [ ] Create `brand-logos` bucket
  - [ ] Create `reference-images` bucket
  - [ ] Configure storage policies

- [ ] Phase 4: Environment Configuration
  - [ ] Get service role key from Supabase Dashboard
  - [ ] Update `.env.local` with new credentials
  - [ ] Update `.env.local.example`

- [ ] Phase 5: Testing & Validation
  - [ ] Test user sign up
  - [ ] Test user sign in
  - [ ] Test profile operations
  - [ ] Test brand kits operations
  - [ ] Test reference images operations
  - [ ] Test content packs operations
  - [ ] Test storage uploads
  - [ ] Verify RLS policies

- [ ] Post-Migration
  - [ ] Generate TypeScript types
  - [ ] Update documentation
  - [ ] Run security advisors
  - [ ] Monitor performance

---

## Notes and Considerations

1. **Demo User**: The application uses a demo user ID (`00000000-0000-0000-0000-000000000001`) for fallback scenarios. This should be handled appropriately in the new setup.

2. **Service Role Key**: The service role key is sensitive and should never be exposed to the client. It's only used server-side.

3. **RLS Policies**: All tables have RLS enabled to ensure users can only access their own data. This is critical for security.

4. **Storage Policies**: Storage buckets have public read policies but write is restricted to service role only, which is appropriate for this application's architecture.

5. **Data Types**: JSONB columns are used for arrays and complex objects (focus_topics, backlink_urls, etc.), which provides flexibility and efficient querying.

6. **Timestamps**: All tables use `timestamptz` for timestamps to ensure consistent timezone handling.

7. **Cascading Deletes**: Foreign key constraints use `on delete cascade` to ensure data consistency when a user is deleted.

---

## References

- Supabase Documentation: https://supabase.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase RLS: https://supabase.com/docs/guides/auth/row-level-security
- Supabase JS Client: https://supabase.com/docs/reference/javascript
