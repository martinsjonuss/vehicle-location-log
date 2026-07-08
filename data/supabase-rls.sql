alter table public.vehicle_movements enable row level security;

drop policy if exists "Allow read access" on public.vehicle_movements;
drop policy if exists "Allow insert access" on public.vehicle_movements;
drop policy if exists "Allow authenticated read access" on public.vehicle_movements;
drop policy if exists "Allow authenticated insert access" on public.vehicle_movements;

grant usage on schema public to authenticated;
grant select, insert on table public.vehicle_movements to authenticated;

create policy "Allow authenticated read access"
on public.vehicle_movements
for select
to authenticated
using (true);

create policy "Allow authenticated insert access"
on public.vehicle_movements
for insert
to authenticated
with check (true);

alter table public.user_profiles enable row level security;

alter table public.user_profiles add column if not exists first_name text;
alter table public.user_profiles add column if not exists last_name text;
alter table public.user_profiles add column if not exists email text;
alter table public.user_profiles add column if not exists role text;
alter table public.user_profiles add column if not exists department text;
alter table public.user_profiles add column if not exists is_active boolean default true;
alter table public.user_profiles add column if not exists created_at timestamptz default now();

drop policy if exists "Authenticated users can read profiles" on public.user_profiles;
drop policy if exists "Allow authenticated own profile read access" on public.user_profiles;

grant usage on schema public to authenticated;
grant select on table public.user_profiles to authenticated;

create policy "Allow authenticated own profile read access"
on public.user_profiles
for select
to authenticated
using (auth.uid() = id);
