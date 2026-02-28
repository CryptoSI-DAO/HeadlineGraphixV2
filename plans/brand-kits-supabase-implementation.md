# Brand Kits Supabase Implementation Plan

## Overview
Implement Supabase integration for the Brand Kits page, allowing each user to have up to 10 brands with their own logo images.

## Prerequisites
**IMPORTANT:** The SQL schema must be executed in Supabase BEFORE implementing the code. Run the SQL statements below in the Supabase SQL Editor.

## Current State
- Brand Kits page exists with mock data
- Uses local state management
- Has UI components for displaying and editing brands
- No Supabase integration yet

## Architecture

```mermaid
graph TB
    subgraph Client
        A[BrandKitsPage] --> B[useBrandKits Hook]
        B --> C[API Routes]
        A --> D[EditBrandModal]
        A --> E[BrandPresetsTable]
    end

    subgraph Server
        C --> F[GET /api/brand-kits]
        C --> G[POST /api/brand-kits]
        C --> H[DELETE /api/brand-kits/[id]]
        F --> I[Data Layer]
        G --> I
        H --> I
        I --> J[Supabase Client]
        J --> K[(brand_kits Table)]
        J --> L[(brand-logos Bucket)]
    end

    subgraph Supabase
        K
        L
    end
```

## Database Schema

### brand_kits Table
```sql
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

create index if not exists brand_kits_user_idx on public.brand_kits(user_id);

-- Updated at trigger
create or replace function public.handle_brand_kits_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger brand_kits_updated_at
before update on public.brand_kits
for each row execute function public.handle_brand_kits_updated_at();

-- RLS Policy
alter table public.brand_kits enable row level security;

drop policy if exists "brand_kits demo access" on public.brand_kits;
create policy "brand_kits demo access"
  on public.brand_kits
  for all
  using (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
  with check (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
```

### Storage Bucket for Brand Logos
```sql
-- Create a public bucket for brand logos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('brand-logos', 'brand-logos', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Allow everyone to read from the bucket
drop policy if exists "brand-logos read" on storage.objects;
create policy "brand-logos read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'brand-logos');

-- Allow writes only through the service role
drop policy if exists "brand-logos service write" on storage.objects;
create policy "brand-logos service write"
  on storage.objects
  for all
  to public
  using (bucket_id = 'brand-logos' and auth.role() = 'service_role')
  with check (bucket_id = 'brand-logos' and auth.role() = 'service_role');
```

## Implementation Steps

### 1. Database Schema
- Create `brand_kits` table with all required fields
- Add indexes and triggers
- Configure RLS policies
- Create storage bucket for logos

### 2. Data Layer (`src/lib/data/brand-kits.ts`)
- `listBrandKits(userId)` - Fetch all brands for a user
- `mapBrandKit(row)` - Map database row to BrandKit type

### 3. API Routes

#### GET `/api/brand-kits`
- List all brands for authenticated user
- Return array of BrandKit objects

#### POST `/api/brand-kits`
- Create or update a brand
- Validate 10 brand limit per user
- Handle logo file upload to storage
- Store metadata in database

#### DELETE `/api/brand-kits/[id]`
- Delete a brand by ID
- Remove logo from storage if exists
- Delete database record

### 4. Custom Hook (`src/hooks/use-brand-kits.ts`)
- Fetch brands on mount
- `createBrand(data)` - Create new brand
- `updateBrand(id, data)` - Update existing brand
- `deleteBrand(id)` - Delete brand
- Handle loading and error states

### 5. UI Updates

#### Brand Kits Page (`src/app/(app)/brand-kits/page.tsx`)
- Replace mock data with Supabase data
- Use `useBrandKits` hook
- Handle loading states
- Show empty slots up to 10

#### EditBrandModal (`src/app/(app)/brand-kits/components/EditBrandModal.tsx`)
- Add logo upload functionality
- Show logo preview
- Handle file validation
- Support both create and update modes

#### BrandPresetsTable (`src/app/(app)/brand-kits/components/BrandPresetsTable.tsx`)
- Wire up delete button
- Show loading states
- Handle empty slots

### 6. Type Updates
- Update `BrandPreset` type to match database schema
- Add `logo_storage_path` field
- Ensure consistency across files

## Constants
```typescript
// src/lib/brand-kits.ts
export const MAX_BRAND_KITS = 10;
export const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2MB
export const ALLOWED_LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
```

## File Structure
```
src/
├── app/
│   └── api/
│       └── brand-kits/
│           ├── route.ts          # GET, POST
│           └── [id]/
│               └── route.ts      # DELETE
├── hooks/
│   └── use-brand-kits.ts         # Custom hook
├── lib/
│   ├── data/
│   │   ├── brand-kits.ts         # Data layer
│   │   ├── constants.ts          # Add TABLES.brandKits
│   │   └── mappers.ts            # Add mapBrandKit
│   └── brand-kits.ts             # Constants
└── app/(app)/brand-kits/
    ├── page.tsx                  # Update to use hook
    ├── types.ts                  # Update types
    └── components/
        ├── EditBrandModal.tsx     # Add logo upload
        └── BrandPresetsTable.tsx # Add delete handler
```
