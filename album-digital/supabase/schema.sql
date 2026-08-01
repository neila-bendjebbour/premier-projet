-- À exécuter dans Supabase : Project > SQL Editor > New query

create extension if not exists "pgcrypto";

create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  country_name text not null,
  city_name text default '',
  date_start date,
  date_end date,
  text text default '',
  mood text default '🥰',
  author text not null,
  photos text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists visited_countries (
  country_name text primary key,
  status text not null default 'visited'
);

create table if not exists settings (
  id int primary key default 1,
  title text not null default 'Notre Album Digital',
  partner_names text[] not null default array['Moi', 'Toi'],
  constraint single_row check (id = 1)
);

insert into settings (id) values (1) on conflict (id) do nothing;

alter table memories enable row level security;
alter table visited_countries enable row level security;
alter table settings enable row level security;

-- Seuls les comptes connectés (vous deux) peuvent lire/écrire.
create policy "authenticated read memories" on memories for select to authenticated using (true);
create policy "authenticated write memories" on memories for insert to authenticated with check (true);
create policy "authenticated update memories" on memories for update to authenticated using (true);
create policy "authenticated delete memories" on memories for delete to authenticated using (true);

create policy "authenticated read visited_countries" on visited_countries for select to authenticated using (true);
create policy "authenticated write visited_countries" on visited_countries for insert to authenticated with check (true);
create policy "authenticated delete visited_countries" on visited_countries for delete to authenticated using (true);

create policy "authenticated read settings" on settings for select to authenticated using (true);
create policy "authenticated update settings" on settings for update to authenticated using (true);

-- Privilèges de base requis en plus des policies RLS
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.memories to authenticated;
grant select, insert, update, delete on public.visited_countries to authenticated;

alter table visited_countries add column if not exists status text not null default 'visited';
grant select, update on public.settings to authenticated;

-- Realtime : permet aux deux comptes de voir les changements en direct
alter publication supabase_realtime add table memories;
alter publication supabase_realtime add table visited_countries;
alter publication supabase_realtime add table settings;

-- Bucket de stockage pour les photos (à créer aussi via l'UI : Storage > New bucket > "photos", coché "Public")
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "authenticated upload photos" on storage.objects for insert to authenticated with check (bucket_id = 'photos');
create policy "authenticated delete photos" on storage.objects for delete to authenticated using (bucket_id = 'photos');
create policy "public read photos" on storage.objects for select using (bucket_id = 'photos');
