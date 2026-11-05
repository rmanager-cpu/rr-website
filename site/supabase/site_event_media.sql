-- site_event_media.sql — "Add to Calendar": uploaded photos, outside links and the highlight option.
--
-- Photos are stored in the database, so staff can upload from a phone with no separate storage service.
-- They are resized before saving (1800px at most, a few hundred KB each). The website reaches them only
-- through its own login, rr_site_app. No password in this file.
-- Safe to run again. Run as the owner; one transaction.

begin;

alter table public.site_events add column if not exists highlighted boolean not null default false;

alter table public.site_event_pages add column if not exists photos text[] not null default '{}';
alter table public.site_event_pages add column if not exists links jsonb not null default '[]'::jsonb;

create table if not exists public.site_event_photos (
  id          uuid primary key default gen_random_uuid(),
  bytes       bytea not null check (octet_length(bytes) <= 3000000),
  width       integer not null,
  height      integer not null,
  created_at  timestamptz not null default now(),
  created_by  text
);

alter table public.site_event_photos enable row level security;
grant select, insert, delete on public.site_event_photos to rr_site_app;
drop policy if exists site_event_photos_app on public.site_event_photos;
create policy site_event_photos_app on public.site_event_photos for all to rr_site_app using (true) with check (true);

commit;
