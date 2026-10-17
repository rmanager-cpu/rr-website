-- wall_submissions_02_one_reward.sql — at most one 10%-off reward per email (or phone).
--
-- Alex, 2026-10-16: "Max 1 coupon per email." Someone can send as many stories as they like, but only
-- one of their submissions can ever carry a reward_code. Matching ignores case and surrounding spaces.
-- Setting a reward_code on a second submission from the same contact is refused with an error.
-- Needs wall_submissions.sql first. Safe to run again. Run as the owner; one transaction in the paste.

begin;

do $$
begin
  if to_regclass('public.wall_submissions') is null then
    raise exception 'Run wall_submissions.sql first. Nothing was changed.';
  end if;
end $$;

create unique index if not exists wall_submissions_one_reward_per_contact
  on public.wall_submissions (lower(btrim(contact)))
  where reward_code is not null and contact is not null;

-- A reward needs somewhere to send it.
alter table public.wall_submissions drop constraint if exists wall_submissions_reward_needs_contact;
alter table public.wall_submissions add constraint wall_submissions_reward_needs_contact
  check (reward_code is null or (contact is not null and btrim(contact) <> ''));

comment on index public.wall_submissions_one_reward_per_contact is
  'The Wall: one 10%-off reward per email/phone (Alex, 2026-10-16).';

commit;
