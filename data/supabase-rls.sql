alter table public.vehicle_movements enable row level security;

alter table public.vehicle_movements add column if not exists user_id uuid references public.user_profiles(id);
alter table public.vehicle_movements add column if not exists fuel_status text default 'unknown';
alter table public.vehicle_movements add column if not exists cleaning_status text default 'unknown';

-- NOT VALID preserves legacy rows while enforcing stable values on all new writes.
alter table public.vehicle_movements drop constraint if exists vehicle_movements_vehicle_type_check;
alter table public.vehicle_movements add constraint vehicle_movements_vehicle_type_check
  check (vehicle_type in ('customer', 'loan', 'courtesy', 'raf', 'enterprise', 'other')) not valid;
alter table public.vehicle_movements drop constraint if exists vehicle_movements_fuel_status_check;
alter table public.vehicle_movements add constraint vehicle_movements_fuel_status_check
  check (fuel_status in ('ready', 'needs_fuel', 'unknown')) not valid;
alter table public.vehicle_movements drop constraint if exists vehicle_movements_cleaning_status_check;
alter table public.vehicle_movements add constraint vehicle_movements_cleaning_status_check
  check (cleaning_status in ('clean', 'needs_cleaning', 'unknown')) not valid;

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
using (auth.uid() is not null);

create policy "Allow authenticated insert access"
on public.vehicle_movements
for insert
to authenticated
with check (auth.uid() = user_id);

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

-- One current row per registration, calculated in PostgreSQL rather than by
-- downloading movement history into the browser. security_invoker ensures the
-- caller's vehicle_movements RLS policy is applied to the view query.
create or replace view public.current_vehicle_fleet
with (security_invoker = true)
as
with normalised_movements as (
  select
    vehicle_movements.*,
    upper(regexp_replace(trim(registration), '[[:space:]-]+', '', 'g')) as normalised_registration
  from public.vehicle_movements
)
select distinct on (normalised_registration)
  id,
  normalised_registration as registration,
  status,
  stage,
  case
    when lower(trim(vehicle_type)) in ('customer', 'customer vehicle') then 'customer'
    when lower(trim(vehicle_type)) = 'other' then 'other'
    else vehicle_type
  end as vehicle_type,
  fuel_status,
  cleaning_status,
  mileage,
  parking_location,
  staff_name,
  note,
  latitude,
  longitude,
  accuracy,
  created_at
from normalised_movements
order by normalised_registration, created_at desc, id desc;

revoke all on public.current_vehicle_fleet from public, anon;
grant select on public.current_vehicle_fleet to authenticated;

-- Serialise status transitions per registration and reject rapid duplicate
-- check-ins / mark-outs while continuing to allow normal consecutive IN updates.
create or replace function public.prevent_duplicate_vehicle_status()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare latest_status text;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.registration, 0));
  select status into latest_status
  from public.vehicle_movements
  where registration = new.registration
  order by created_at desc, id desc
  limit 1;

  if (new.status = 'OUT' and latest_status = 'OUT') or
     (new.status = 'IN' and new.stage = 'Checked In' and latest_status = 'IN') then
    raise exception 'Vehicle already has status %', latest_status using errcode = '23505';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_duplicate_vehicle_status on public.vehicle_movements;
create trigger prevent_duplicate_vehicle_status
before insert on public.vehicle_movements
for each row execute function public.prevent_duplicate_vehicle_status();
