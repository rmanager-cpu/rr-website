-- site_menus.sql — the website's food and drink menus, in river-ranch-office.
--
-- Shape: menu → sections → items. An item is one dish on one menu, with that menu's prices; the dish
-- itself (name, description, dietary tags, photo) is shared, so fixing a description fixes it on
-- every menu. Serving hours are stored once per menu and feed the page, the "serving now" chip and
-- Google. Same login and rules as site_tables.sql (rr_site_app reaches only site_* tables).
-- Safe to run again. One transaction; runs inside the website paste.

begin;

create table if not exists public.site_dishes (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,100}$'),
  name        text not null check (char_length(name) between 1 and 160),
  description text check (description is null or char_length(description) <= 2000),
  tags        text[] not null default '{}',          -- GF, V, VG, DF, GM, CG …
  raw         boolean not null default false,        -- served raw/undercooked: shows the advisory mark
  photo       text check (photo is null or char_length(photo) <= 400),
  signature   boolean not null default false,        -- gets its own page at /menus/dishes/<slug>
  updated_at  timestamptz not null default now()
);

create table if not exists public.site_menus (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{0,80}$'),
  name         text not null check (char_length(name) between 1 and 80),
  sort         int not null default 0,
  intro        text check (intro is null or char_length(intro) <= 1000),
  hours        jsonb not null default '[]',          -- [{days:[1..7], start:'17:00', end:'21:00', label:'Nightly'}]
  serving_note text check (serving_note is null or char_length(serving_note) <= 200),
  footer       text check (footer is null or char_length(footer) <= 2000),
  active       boolean not null default true,
  show_until   date,                                 -- seasonal / holiday menus switch off on their own
  updated_at   timestamptz not null default now()
);

create table if not exists public.site_menu_sections (
  id       uuid primary key default gen_random_uuid(),
  menu_id  uuid not null references public.site_menus(id) on delete cascade,
  name     text not null check (char_length(name) between 1 and 120),
  note     text check (note is null or char_length(note) <= 600),
  sort     int not null default 0
);

create table if not exists public.site_menu_items (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references public.site_menu_sections(id) on delete cascade,
  dish_id     uuid not null references public.site_dishes(id),
  sort        int not null default 0,
  prices      jsonb not null default '[]',          -- [{label:'Half', price:12}, {label:'Full', price:17}]
  price_note  text check (price_note is null or char_length(price_note) <= 60),   -- e.g. Market Price
  description text check (description is null or char_length(description) <= 2000), -- this menu only
  hidden      boolean not null default false
);
create index if not exists site_menu_items_section_idx on public.site_menu_items (section_id, sort);
create index if not exists site_menu_sections_menu_idx on public.site_menu_sections (menu_id, sort);

alter table public.site_dishes enable row level security;
alter table public.site_menus enable row level security;
alter table public.site_menu_sections enable row level security;
alter table public.site_menu_items enable row level security;

grant select, insert, update, delete on public.site_dishes, public.site_menus, public.site_menu_sections, public.site_menu_items to rr_site_app;
do $$
declare t text;
begin
  foreach t in array array['site_dishes', 'site_menus', 'site_menu_sections', 'site_menu_items'] loop
    execute format('drop policy if exists %I on public.%I', t || '_app', t);
    execute format('create policy %I on public.%I for all to rr_site_app using (true) with check (true)', t || '_app', t);
  end loop;
end $$;

commit;
