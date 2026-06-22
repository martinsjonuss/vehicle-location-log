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
