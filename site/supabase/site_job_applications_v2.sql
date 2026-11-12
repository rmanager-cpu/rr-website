-- site_job_applications_v2.sql — the fuller job application on /careers.
--
-- Adds the application's answers (role, seasons, availability, certifications, references, a bit about
-- them) as one jsonb column, and a resume table. Resumes are stored in the database like event photos
-- (4 MB at most), reachable only through the website's own login (rr_site_app) and shown only to staff
-- signed in to /admin. No password in this file. Safe to run again. Run as the owner; one transaction.

begin;

create table if not exists public.site_job_resumes (
  id          uuid primary key default gen_random_uuid(),
  bytes       bytea not null check (octet_length(bytes) <= 4200000),
  filename    text not null check (char_length(filename) <= 200),
  mime        text not null check (mime in ('application/pdf', 'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/heic')),
  created_at  timestamptz not null default now()
);

alter table public.site_job_resumes enable row level security;
grant select, insert, delete on public.site_job_resumes to rr_site_app;
drop policy if exists site_job_resumes_app on public.site_job_resumes;
create policy site_job_resumes_app on public.site_job_resumes for all to rr_site_app using (true) with check (true);

alter table public.site_job_applications add column if not exists details jsonb not null default '{}'::jsonb;
alter table public.site_job_applications add column if not exists resume_id uuid references public.site_job_resumes (id) on delete set null;

commit;
