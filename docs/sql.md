# Supabase Schema SQL

Run the statements below in the Supabase SQL Editor (or via the CLI/MCP) to provision the tables that back the HeadlineGraphix data model. The script assumes the `pgcrypto` extension is available so we can call `gen_random_uuid()` for primary keys.

```sql
-- Ensure pgcrypto is available for gen_random_uuid()
create extension if not exists pgcrypto;

-- hgprofiles ---------------------------------------------------------------
create table if not exists public.hgprofiles (
  id uuid primary key default gen_random_uuid(),
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

create or replace function public.handle_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
before update on public.hgprofiles
for each row execute function public.handle_profiles_updated_at();

-- reference_images -------------------------------------------------------
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

-- content_packs ----------------------------------------------------------
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

-- Row Level Security -----------------------------------------------------
alter table public.hgprofiles enable row level security;
alter table public.reference_images enable row level security;
alter table public.content_packs enable row level security;

-- Replace these policies when auth lands; for now allow the demo user id.
drop policy if exists "hgprofiles demo access" on public.hgprofiles;
create policy "hgprofiles demo access"
  on public.hgprofiles
  for all
  using (id = '00000000-0000-0000-0000-000000000001'::uuid)
  with check (id = '00000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists "reference_images demo access" on public.reference_images;
create policy "reference_images demo access"
  on public.reference_images
  for all
  using (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
  with check (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

drop policy if exists "content_packs demo access" on public.content_packs;
create policy "content_packs demo access"
  on public.content_packs
  for all
  using (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
  with check (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
```

Replace the temporary RLS policies once authentication is wired up (e.g., `auth.uid()` integration). This script can be rerun safely thanks to the `if not exists` guards.

## Demo Data Seed

Run the block below to populate Supabase with the same mock data that powers `AppContext`. Re-run as needed to reset the demo state.

```sql
do $func$
declare
  demo_user uuid := '00000000-0000-0000-0000-000000000001';
  latest_pack uuid;
begin
  insert into public.hgprofiles (
    id,
    email,
    name,
    focus_topics,
    backlink_urls,
    brand_presets,
    credit_balance,
    reference_images,
    content_history,
    ai_preferences
  ) values (
    demo_user,
    'demo@example.com',
    'Demo User',
    array['AI in Marketing', 'SaaS Growth', 'Content Strategy'],
    array['https://blog.hubspot.com', 'https://neilpatel.com/blog', 'https://backlinko.com/blog'],
    '[]'::jsonb,
    42,
    '[]'::jsonb,
    '[]'::jsonb,
    jsonb_build_object('defaultTone', 'Professional', 'fallbackTone', 'Conversational')
  )
  on conflict (id) do update set
    focus_topics = excluded.focus_topics,
    backlink_urls = excluded.backlink_urls,
    credit_balance = excluded.credit_balance,
    ai_preferences = excluded.ai_preferences;

  delete from public.reference_images where user_id = demo_user;
  insert into public.reference_images (id, user_id, storage_path, image_url, description, ai_hint)
  values
    (gen_random_uuid(), demo_user, 'placeholders/ref-1.jpg', 'https://images.unsplash.com/photo-1512998844734-cd2cca565822?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8YWJzdHJhY3QlMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzY0MTM4MTI4fDA&ixlib=rb-4.1.0&q=80&w=1080', 'Abstract architecture', 'abstract architecture'),
    (gen_random_uuid(), demo_user, 'placeholders/ref-2.jpg', 'https://images.unsplash.com/photo-1605702012553-e954fbde66eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxjaXR5JTIwbmlnaHR8ZW58MHx8fHwxNzY0MjMzNTg5fDA&ixlib=rb-4.1.0&q=80&w=1080', 'Cityscape at night', 'city night'),
    (gen_random_uuid(), demo_user, 'placeholders/ref-3.jpg', 'https://images.unsplash.com/photo-1518655048521-f130df041f66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxtaW5pbWFsaXN0JTIwb2ZmaWNlfGVufDB8fHx8MTc2NDI1MDM0MHww&ixlib=rb-4.1.0&q=80&w=1080', 'Minimalist office interior', 'minimalist office');

  delete from public.content_packs where user_id = demo_user;
  insert into public.content_packs (id, user_id, headline_id, headline, config, drafts)
  values (
    gen_random_uuid(),
    demo_user,
    'crypto-market-update',
    'Crypto Market Update: Bitcoin Halving Aftermath and Altcoin Season',
    jsonb_build_object(
      'brandTone', 'Professional',
      'referenceImage', 'https://images.unsplash.com/photo-1605702012553-e954fbde66eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxjaXR5JTIwbmlnaHR8ZW58MHx8fHwxNzY0MjMzNTg5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'userAngle', 'Focus on the impact for long-term investors.'
    ),
    jsonb_build_object(
      'blogPost', $blog$
# Unpacking the Future: Tech Trends for 2025

The technology landscape is in a constant state of flux. As we look towards 2025, several key trends are poised to redefine industries and our daily lives. From the rapid advancements in Artificial Intelligence to the immersive worlds of Virtual Reality and the mind-bending potential of Quantum Computing, the next few years promise to be transformative.

## The AI Revolution Continues

AI is no longer a futuristic concept; it's a present-day reality. In 2025, expect to see:

- **Hyper-Personalization**: AI algorithms will deliver experiences tailored to individual users with unprecedented accuracy.
- **Generative AI in Business**: Beyond chatbots, generative AI will automate complex creative and analytical tasks.
- **Ethical AI Frameworks**: A growing focus on developing and deploying AI responsibly.

## Virtual and Augmented Reality: A New Dimension

The metaverse is taking shape. VR and AR are set to become more mainstream, with applications beyond gaming:

- **Collaborative Workspaces**: Virtual meeting rooms that are as interactive as physical ones.
- **Enhanced Retail Experiences**: Try before you buy in augmented reality.
- **Immersive Education**: Students can take virtual field trips to historical sites or distant planets.
$blog$,
      'linkedInPost', $linkedin$
🚀 Get ready for 2025! The tech world is accelerating with major shifts in AI, VR, and Quantum Computing.

Key takeaways:
- AI-driven hyper-personalization is the new standard.
- VR is moving from gaming to mainstream business collaboration.
- Quantum computing is on the brink of solving currently unsolvable problems.

What trend are you most excited about? #TechTrends #AI #FutureOfWork #Innovation #VR #QuantumComputing
$linkedin$,
      'infographic', 'https://picsum.photos/seed/infographic1/800/1200'
    )
  )
  returning id into latest_pack;

  update public.hgprofiles
    set content_history = jsonb_build_array(latest_pack::text),
        reference_images = jsonb_build_array(
          jsonb_build_object('id', 'ref-1', 'storagePath', 'placeholders/ref-1.jpg', 'imageUrl', 'https://images.unsplash.com/photo-1512998844734-cd2cca565822?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8YWJzdHJhY3QlMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzY0MTM4MTI4fDA&ixlib=rb-4.1.0&q=80&w=1080', 'aiHint', 'abstract architecture', 'createdAt', timezone('utc', now())),
          jsonb_build_object('id', 'ref-2', 'storagePath', 'placeholders/ref-2.jpg', 'imageUrl', 'https://images.unsplash.com/photo-1605702012553-e954fbde66eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxjaXR5JTIwbmlnaHR8ZW58MHx8fHwxNzY0MjMzNTg5fDA&ixlib=rb-4.1.0&q=80&w=1080', 'aiHint', 'city night', 'createdAt', timezone('utc', now())),
          jsonb_build_object('id', 'ref-3', 'storagePath', 'placeholders/ref-3.jpg', 'imageUrl', 'https://images.unsplash.com/photo-1518655048521-f130df041f66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxtaW5pbWFsaXN0JTIwb2ZmaWNlfGVufDB8fHx8MTc2NDI1MDM0MHww&ixlib=rb-4.1.0&q=80&w=1080', 'aiHint', 'minimalist office', 'createdAt', timezone('utc', now()))
        )
  where id = demo_user;
end;
$func$ language plpgsql;
```

## Storage Bucket + Signed Upload Support

```sql
-- Create a private bucket for reference images (idempotent).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reference-images', 'reference-images', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Allow everyone (including anon clients) to read from the bucket.
drop policy if exists "reference-images read" on storage.objects;
create policy "reference-images read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'reference-images');

-- Allow writes only through the service role (e.g., server actions or Edge Functions).
drop policy if exists "reference-images service write" on storage.objects;
create policy "reference-images service write"
  on storage.objects
  for all
  to public
  using (bucket_id = 'reference-images' and auth.role() = 'service_role')
  with check (bucket_id = 'reference-images' and auth.role() = 'service_role');

-- Helper function to mint signed upload URLs that expire in 1 hour.
create or replace function public.generate_reference_image_upload(target_path text)
returns json
security definer
set search_path = public
language plpgsql
as $$
declare
  signed json;
begin
  select storage.generate_signed_upload_url(
    'reference-images',
    target_path,
    3600,
    jsonb_build_object('contentType', 'image/*')
  )
  into signed;

  return signed;
end;
$$;

grant execute on function public.generate_reference_image_upload(text) to anon, authenticated;
```
