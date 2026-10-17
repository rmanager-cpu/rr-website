-- wall_submissions.sql — The Wall (history wall) crowd submissions, for river-ranch-office.
--
-- What people tell us about a photo on the wall, sent from the public page. The public can only add
-- rows: it can't read, change or delete any, and can't set the review or reward fields. Management
-- reads and reviews them in the Supabase table editor (or the events app, later).
-- Safe to run again. Run as the owner; one transaction in the paste.

begin;

create table if not exists public.wall_submissions (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  frame_id           text not null check (frame_id ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
  section_id         text not null check (section_id ~ '^[a-z0-9][a-z0-9-]{0,63}$'),
  story              text not null check (char_length(btrim(story)) between 3 and 4000),
  name               text check (name is null or char_length(name) <= 120),
  contact            text check (contact is null or char_length(contact) <= 160),
  page               text check (page is null or char_length(page) <= 500),
  -- review (management only)
  status             text not null default 'new' check (status in ('new', 'approved', 'used', 'rejected')),
  review_notes       text,
  -- 10%-off thank-you for approved submissions (management only)
  reward_code        text unique,
  reward_sent_at     timestamptz,
  reward_redeemed_at timestamptz
);

comment on table public.wall_submissions is
  'The Wall: what visitors know about a photo (frame_id = the number tag, e.g. f41). Public insert-only; never publicly readable. status/review/reward fields are set by management.';

create index if not exists wall_submissions_frame_idx on public.wall_submissions (frame_id, created_at desc);
create index if not exists wall_submissions_new_idx on public.wall_submissions (created_at desc) where status = 'new';

alter table public.wall_submissions enable row level security;

-- The page posts with the publishable key (role anon). Only these columns, only inserts.
revoke all on public.wall_submissions from anon, authenticated;
grant insert (frame_id, section_id, story, name, contact, page) on public.wall_submissions to anon;

drop policy if exists wall_submissions_public_insert on public.wall_submissions;
create policy wall_submissions_public_insert on public.wall_submissions
  for insert to anon
  with check (status = 'new' and review_notes is null and reward_code is null and reward_sent_at is null and reward_redeemed_at is null);

-- Brakes against bots and double-taps: the same story for the same photo within a day is dropped as a
-- duplicate, and past 300 submissions in an hour the page gets an error until the hour rolls over.
create or replace function public.wall_submissions_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (
    select 1 from wall_submissions
    where frame_id = new.frame_id and btrim(story) = btrim(new.story) and created_at > now() - interval '1 day'
  ) then
    return null; -- silently skip the duplicate
  end if;
  if (select count(*) from wall_submissions where created_at > now() - interval '1 hour') >= 300 then
    raise exception 'wall_submissions: too many submissions this hour';
  end if;
  new.story := btrim(new.story);
  return new;
end $$;

revoke all on function public.wall_submissions_guard() from public, anon, authenticated;

drop trigger if exists wall_submissions_guard on public.wall_submissions;
create trigger wall_submissions_guard before insert on public.wall_submissions
  for each row execute function public.wall_submissions_guard();

commit;
