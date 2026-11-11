-- wall_notify.sql — let the website email staff about new Wall submissions.
--
-- Adds notified_at to wall_submissions, and lets the website's own login (rr_site_app) read the
-- submissions and stamp notified_at, nothing else. The two test rows from Oct 17 are marked as already
-- sent so they don't go out. No password in this file. Safe to run again. Run as the owner; one transaction.

begin;

alter table public.wall_submissions add column if not exists notified_at timestamptz;
update public.wall_submissions set notified_at = now() where notified_at is null and created_at < '2026-11-12';

create index if not exists wall_submissions_unnotified_idx on public.wall_submissions (created_at) where notified_at is null;

grant select (id, created_at, frame_id, section_id, story, name, contact, page, notified_at) on public.wall_submissions to rr_site_app;
grant update (notified_at) on public.wall_submissions to rr_site_app;

drop policy if exists wall_submissions_site_read on public.wall_submissions;
create policy wall_submissions_site_read on public.wall_submissions for select to rr_site_app using (true);
drop policy if exists wall_submissions_site_notify on public.wall_submissions;
create policy wall_submissions_site_notify on public.wall_submissions for update to rr_site_app using (true) with check (true);

commit;
