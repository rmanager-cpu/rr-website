-- no_drops.sql — nothing anyone sends on the website is ever dropped (management's rule, 2026-11-12).
--
-- 1. The Wall: its guard used to skip a repeat of the same story on the same photo within a day, without a
--    word, and to refuse everything past 300 an hour. Now it keeps every one; past 300 an hour a row is
--    labelled "maybe bot" at the front of `page` (the staff alert shows that label).
-- 2. site_form_log: one row for EVERY send of every website form (Careers, Request to play), whether it was
--    saved, needed fixing, or looked like a bot, with exactly what was typed. /admin/submissions lists it.
--
-- No password in this file. Safe to run again. Run as the owner, in the SQL editor; one transaction.

begin;

create or replace function public.wall_submissions_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (select count(*) from wall_submissions where created_at > now() - interval '1 hour') >= 300
     and coalesce(new.page, '') not like '[maybe bot%' then
    new.page := left('[maybe bot: over 300 this hour] ' || coalesce(new.page, ''), 500);
  end if;
  new.story := btrim(new.story);
  return new;
end $$;

create table if not exists public.site_form_log (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  form        text not null,                    -- 'careers', 'request-to-play'
  outcome     text not null,                    -- what the person was shown: saved, or what to fix
  saved       boolean not null default false,   -- whether it also landed in that form's own list
  maybe_bot   text,                             -- why it might be a bot; null when nothing looked off
  fields      jsonb not null default '{}'::jsonb
);
create index if not exists site_form_log_created_idx on public.site_form_log (created_at desc);
alter table public.site_form_log enable row level security;

grant select, insert on public.site_form_log to rr_site_app;
drop policy if exists site_form_log_app on public.site_form_log;
create policy site_form_log_app on public.site_form_log for all to rr_site_app using (true) with check (true);

commit;
