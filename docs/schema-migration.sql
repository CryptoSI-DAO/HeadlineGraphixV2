-- HeadlineGraphixV2 — Schema for self-hosted Supabase (db.cryptosidao.org)
-- Target: supabase-db container
-- Run: docker exec -i supabase-db psql -U postgres < docs/schema-migration.sql

-- Ensure extensions -------------------------------------------------------
create extension if not exists pgcrypto;

-- ============================================================================
-- TABLES
-- ============================================================================

-- hgprofiles ----------------------------------------------------------------
-- id links directly to auth.users(id) so the auth trigger can auto-create rows
create table if not exists public.hgprofiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  name text not null,
  focus_topics text[] default array[]::text[],
  backlink_urls text[] default array[]::text[],
  brand_presets jsonb default '[]'::jsonb,
  credit_balance integer default 0,
  reference_images jsonb default '[]'::jsonb,
  content_history jsonb default '[]'::jsonb,
  ai_preferences jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.hgprofiles is 'User profile, preferences, and cached reference data';

create index if not exists profiles_email_idx on public.hgprofiles(email);

-- updated_at trigger
create or replace function public.handle_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists profiles_updated_at on public.hgprofiles;
create trigger profiles_updated_at
before update on public.hgprofiles
for each row execute function public.handle_profiles_updated_at();

-- brand_kits ----------------------------------------------------------------
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

comment on table public.brand_kits is 'User brand kit configurations with logo storage';

create index if not exists brand_kits_user_idx on public.brand_kits(user_id);

create or replace function public.handle_brand_kits_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists brand_kits_updated_at on public.brand_kits;
create trigger brand_kits_updated_at
before update on public.brand_kits
for each row execute function public.handle_brand_kits_updated_at();

-- reference_images ----------------------------------------------------------
create table if not exists public.reference_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.hgprofiles(id) on delete cascade,
  storage_path text not null,
  image_url text not null,
  description text,
  ai_hint text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists reference_images_user_idx on public.reference_images(user_id);

-- content_packs -------------------------------------------------------------
create table if not exists public.content_packs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.hgprofiles(id) on delete cascade,
  headline_id text,
  headline text not null,
  reference_image_id uuid references public.reference_images(id) on delete set null,
  reference_image_url text,
  reference_image_removed_at timestamptz,
  config jsonb not null default '{}'::jsonb,
  drafts jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default timezone('utc', now())
);

create index if not exists content_packs_user_idx on public.content_packs(user_id);
create index if not exists content_packs_headline_idx on public.content_packs(headline_id);
create index if not exists content_packs_reference_image_idx on public.content_packs(reference_image_id);

-- Trigger: sync reference_image_url when reference_image_id changes
create or replace function public.sync_content_pack_reference_image()
returns trigger as $$
begin
  if new.reference_image_id is null then
    new.reference_image_url = null;
    return new;
  end if;
  select image_url
    into new.reference_image_url
  from public.reference_images
  where id = new.reference_image_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists content_packs_reference_image_sync on public.content_packs;
create trigger content_packs_reference_image_sync
before insert or update of reference_image_id on public.content_packs
for each row execute function public.sync_content_pack_reference_image();

-- Trigger: nullify reference when image is deleted
create or replace function public.handle_reference_image_deleted()
returns trigger as $$
begin
  update public.content_packs
    set reference_image_id = null,
        reference_image_url = null,
        reference_image_removed_at = timezone('utc', now())
  where reference_image_id = old.id;
  return old;
end;
$$ language plpgsql;

drop trigger if exists reference_images_cleanup on public.reference_images;
create trigger reference_images_cleanup
before delete on public.reference_images
for each row execute function public.handle_reference_image_deleted();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.hgprofiles enable row level security;
alter table public.brand_kits enable row level security;
alter table public.reference_images enable row level security;
alter table public.content_packs enable row level security;

-- Drop any old demo policies
drop policy if exists "hgprofiles demo access" on public.hgprofiles;
drop policy if exists "reference_images demo access" on public.reference_images;
drop policy if exists "content_packs demo access" on public.content_packs;

-- hgprofiles: user can CRUD their own profile (id = auth.uid())
drop policy if exists "hgprofiles select own" on public.hgprofiles;
create policy "hgprofiles select own"
  on public.hgprofiles for select
  using (auth.uid() = id);

drop policy if exists "hgprofiles insert own" on public.hgprofiles;
create policy "hgprofiles insert own"
  on public.hgprofiles for insert
  with check (auth.uid() = id);

drop policy if exists "hgprofiles update own" on public.hgprofiles;
create policy "hgprofiles update own"
  on public.hgprofiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "hgprofiles delete own" on public.hgprofiles;
create policy "hgprofiles delete own"
  on public.hgprofiles for delete
  using (auth.uid() = id);

-- brand_kits: user can CRUD their own brand kits
drop policy if exists "brand_kits select own" on public.brand_kits;
create policy "brand_kits select own"
  on public.brand_kits for select
  using (auth.uid() = user_id);

drop policy if exists "brand_kits insert own" on public.brand_kits;
create policy "brand_kits insert own"
  on public.brand_kits for insert
  with check (auth.uid() = user_id);

drop policy if exists "brand_kits update own" on public.brand_kits;
create policy "brand_kits update own"
  on public.brand_kits for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "brand_kits delete own" on public.brand_kits;
create policy "brand_kits delete own"
  on public.brand_kits for delete
  using (auth.uid() = user_id);

-- reference_images: user can CRUD their own reference images
drop policy if exists "reference_images select own" on public.reference_images;
create policy "reference_images select own"
  on public.reference_images for select
  using (auth.uid() = user_id);

drop policy if exists "reference_images insert own" on public.reference_images;
create policy "reference_images insert own"
  on public.reference_images for insert
  with check (auth.uid() = user_id);

drop policy if exists "reference_images update own" on public.reference_images;
create policy "reference_images update own"
  on public.reference_images for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "reference_images delete own" on public.reference_images;
create policy "reference_images delete own"
  on public.reference_images for delete
  using (auth.uid() = user_id);

-- content_packs: user can CRUD their own content packs
drop policy if exists "content_packs select own" on public.content_packs;
create policy "content_packs select own"
  on public.content_packs for select
  using (auth.uid() = user_id);

drop policy if exists "content_packs insert own" on public.content_packs;
create policy "content_packs insert own"
  on public.content_packs for insert
  with check (auth.uid() = user_id);

drop policy if exists "content_packs update own" on public.content_packs;
create policy "content_packs update own"
  on public.content_packs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "content_packs delete own" on public.content_packs;
create policy "content_packs delete own"
  on public.content_packs for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- AUTH TRIGGER — auto-create hgprofiles row on signup
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.hgprofiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- reference-images: 5MB limit, JPEG/PNG/WebP, public read
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reference-images',
  'reference-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- brand-logos: 10MB limit, JPEG/PNG/WebP, public read
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'brand-logos',
  'brand-logos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies: allow authenticated users to manage their own files
-- Pattern: path starts with user_id/
drop policy if exists "reference-images auth read" on storage.objects;
create policy "reference-images auth read"
  on storage.objects for select
  to public
  using (bucket_id = 'reference-images');

drop policy if exists "reference-images auth write" on storage.objects;
create policy "reference-images auth write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'reference-images');

drop policy if exists "reference-images auth update" on storage.objects;
create policy "reference-images auth update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'reference-images');

drop policy if exists "reference-images auth delete" on storage.objects;
create policy "reference-images auth delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'reference-images');

drop policy if exists "brand-logos auth read" on storage.objects;
create policy "brand-logos auth read"
  on storage.objects for select
  to public
  using (bucket_id = 'brand-logos');

drop policy if exists "brand-logos auth write" on storage.objects;
create policy "brand-logos auth write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'brand-logos');

drop policy if exists "brand-logos auth update" on storage.objects;
create policy "brand-logos auth update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'brand-logos');

drop policy if exists "brand-logos auth delete" on storage.objects;
create policy "brand-logos auth delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'brand-logos');

-- Drop old service-role-only policies from previous schema
drop policy if exists "reference-images read" on storage.objects;
drop policy if exists "reference-images service write" on storage.objects;

-- ============================================================================
-- DONE
-- ============================================================================
