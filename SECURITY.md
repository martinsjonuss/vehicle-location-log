# Security

Vehicle Location Log is hosted as a static GitHub Pages frontend. Treat all HTML, CSS, JavaScript, and client configuration in this repository as public.

## Supabase Keys

The Supabase publishable key in `js/supabase-config.js` is safe to expose only when Supabase Auth and Row Level Security are correctly configured.

Never commit:

* Supabase service role keys
* Database passwords
* JWT secrets
* Private keys
* Personal credentials

## Authentication

Users must be created and managed manually in Supabase Auth. The frontend must not provide public sign-up or account creation.

The app should only support sign-in and sign-out for existing Supabase users.

## Database Access

RLS must remain enabled on `public.vehicle_movements`.

Only the `authenticated` role should have:

* `SELECT` access for reading vehicle records
* `INSERT` access for creating movement records

Do not create `anon` read or insert policies for vehicle records.

The frontend should only create new movement rows. It should not update or delete existing vehicle movement records.

## Data Handling

This prototype should not store customer personal data. Vehicle records should be limited to operational movement details such as registration, status, stage, mileage, parking location, notes, GPS coordinates, and the authenticated user email saved as `staff_name`.

Apply the policies in `data/supabase-rls.sql` after any database reset or Supabase project migration.
