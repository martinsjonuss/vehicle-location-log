alter table vehicle_movements enable row level security;

drop policy if exists "Allow read access" on vehicle_movements;
drop policy if exists "Allow insert access" on vehicle_movements;
drop policy if exists "Allow authenticated read access" on vehicle_movements;
drop policy if exists "Allow authenticated insert access" on vehicle_movements;

create policy "Allow authenticated read access"
on vehicle_movements
for select
to authenticated
using (true);

create policy "Allow authenticated insert access"
on vehicle_movements
for insert
to authenticated
with check (true);
