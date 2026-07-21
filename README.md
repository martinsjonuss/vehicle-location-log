# Vehicle Location Log

Mobile-friendly web application designed to help dealership staff track vehicle locations, movements, and status throughout the vehicle journey.

The application was created as a proof of concept after observing time being spent locating vehicles that had been moved between departments, resulting in outdated parking information and uncertainty about a vehicle's latest location.

---

## Purpose

Vehicles can be moved multiple times throughout the day by different departments, including:

* Drive Thru Hosts
* Service Advisors
* Technicians
* Valet / Wash Teams
* Sales Teams

While parking locations may initially be recorded, the information often becomes outdated once a vehicle is moved.

This application provides a simple way to:

* Require staff sign-in before records can be viewed or created
* Record a vehicle's location when parked
* Update the location when moved
* View the latest known location
* Open the location in Google Maps
* View movement history
* Track vehicle status (IN / OUT)

---

## Core Workflow

```text
Customer Arrives
        ↓
Vehicle Checked In
        ↓
Mileage Recorded
        ↓
GPS Location Captured
        ↓
Vehicle Parked
        ↓
Vehicle Searched Later
        ↓
Open Latest Location
        ↓
Vehicle Moved
        ↓
Update Location
        ↓
Movement History Updated
        ↓
Vehicle Collected
        ↓
Marked OUT
```

---

## Features

### Authentication

* Supabase Auth sign-in
* Existing Supabase users only
* No public sign-up flow
* Main app hidden until a valid session exists
* Sign out returns the user to the login screen
* Signed-in user profile linked to new records through `user_id`
* Signed-in user's name saved as a movement display snapshot

### Vehicle Check In

* Vehicle registration capture
* Mileage capture
* Vehicle type selection
* Automatic current stage of Checked In
* Parking location selection with Drive Thru selected by default
* Optional notes
* Optional GPS location capture
* Parking location fallback when GPS is unavailable
* Automatic status assignment (IN)

### Vehicle Search

* Search by registration
* View latest known status
* View latest stage
* View mileage
* View parking location
* View notes
* Open location in Google Maps

### Vehicle Updates

* Update vehicle location after movement
* Update current stage
* Update parking location
* Automatically set Drive Thru when the stage is Ready for Customer
* Automatically display and save Workshop when the stage is In Workshop
* Add movement notes
* Record movement history
* Save with parking location only when GPS is unavailable
* Mark vehicle OUT by creating a new movement record

### Movement History

* Full history per vehicle
* Timestamped updates
* Vehicle stages
* Parking locations
* Mileage information
* Status tracking

### Activity Feed

* Recent vehicle activity
* Displays latest 5 updates
* Shows vehicle status
* Quick access to vehicle records

### My Stats

* Personal movement summary for today, this week, or this month
* Counts check-ins, location updates, marked OUT actions, and active vehicles handled
* Shows most used location, most active time, activity over time, and recent personal activity
* Uses `vehicle_movements.user_id` for user-specific stats

### Vehicle Fleet

* Groups the current fleet into Loan, Courtesy, RAF, Enterprise, Other and Customer
* Shows availability plus fuel and cleaning readiness for non-Customer vehicles
* Uses Needs fuel and Needs cleaning switches in check-in and update forms; off means ready and on means attention is required
* Provides contextual check-in, update, mark-out and history actions
* Uses the database-side `current_vehicle_fleet` view for one current row per registration

---

## Status Tracking

Vehicles can be tracked as:

### IN

Vehicle currently on site.

### OUT

Vehicle has left the dealership or compound.

Examples:

* Customer collected vehicle
* Courtesy vehicle currently off site
* Sales vehicle released

---

## Current Stages

The current-stage dropdown supports:

* Parked
* Returned from Wash
* Ready for Customer
* In Workshop
* Valet / Wash
* Other

Parked is selected by default when the update form opens or resets.

Returned from Wash keeps the normal parking-location dropdown visible and records that the vehicle is washed or cleaned while still parked.

Ready for Customer automatically selects Drive Thru as the parking location. Staff can still choose another parking location afterwards for exceptions.

In Workshop hides the normal parking-location dropdown and saves Workshop as the displayed location. Workshop is not a standard parking area and is not included in the parking-location options.

---

## Parking Locations

The application currently supports:

* Drive Thru
* Budget
* Sales
* S1
* S2
* S3
* S4
* S7
* Customer Car Park
* Fruit Market
* Breakdown Hill
* Other

Parking locations are optional and can be used alongside GPS location data.

---

## Technology

Frontend:

* HTML
* CSS
* JavaScript

Storage:

* Supabase database

Authentication:

* Supabase Auth

* Users managed manually in the Supabase dashboard

Hosting:

* GitHub Pages

Maps:

* Google Maps

---

## Data Model

Vehicle movement records are stored in the `vehicle_movements` table.

The app records:

* Registration
* IN / OUT status
* Current stage
* Vehicle type
* Mileage
* Parking location
* Authenticated user ID
* Staff display name snapshot
* Optional movement note
* Optional GPS latitude and longitude
* Optional GPS accuracy
* Created timestamp

Each check-in, location update, or mark-out action creates a new movement row. Existing movement rows are not updated or deleted by the frontend.

Fuel and cleaning readiness are stored with each movement. The latest movement is the current operational state, exposed through `current_vehicle_fleet`; this avoids a second competing vehicle table and avoids reducing all movement history in the browser.

Vehicle records are stored in Supabase. Browser `localStorage` is used only for the user's GPS capture preference.

---

## Security Model

This project is designed for GitHub Pages, so all frontend code is public.

Real data protection must come from Supabase Auth and Row Level Security, not from hiding elements in the browser.

Security expectations:

* Supabase Row Level Security must stay enabled on `public.vehicle_movements`
* Only authenticated users should be able to read vehicle records
* Only authenticated users should be able to insert movement records
* Anonymous read or insert policies should not be created
* Service role keys, database passwords, JWT secrets, and private keys must never be committed
* The frontend should use only a Supabase publishable key
* Users should be created manually in Supabase Auth
* Customer personal data should not be stored in this prototype

The SQL policy template is stored in `data/supabase-rls.sql`. Apply it in the Supabase SQL Editor after database setup, reset, or migration.

See `SECURITY.md` for more detail.

---

## Setup Notes

To run or deploy the app safely:

* Create the `vehicle_movements` table in Supabase
* Configure Supabase Auth users manually
* Add the project URL and publishable key in `js/supabase-config.js`
* Apply the authenticated-only RLS policies from `data/supabase-rls.sql`
* Deploy the static files to GitHub Pages or another static host
* Do not add service role keys or database credentials to frontend files

Do not commit real credentials, service role keys, database passwords, JWT secrets, or private keys.

---

## Limitations

This is currently a proof of concept.

The application does not currently include:

* Notifications
* Vehicle assignment
* Integration with dealership systems
* Customer information
* User profile display names

Vehicle movement records are stored in Supabase and can be shared across browsers and devices. Users must sign in before using the vehicle tracking workflow.

---

## Future Ideas

Potential future enhancements:

* User profile display names
* Department assignment
* Vehicle ownership tracking
* Notifications between departments
* Dashboard view
* Vehicle photos and damage recording
* Key location tracking
* Key safe tracking
* Courtesy vehicle management
* Integration with existing dealership systems

---

# v3 Update

## New Features

* Added mileage field during vehicle check-in
* Added parking location dropdown during vehicle check-in
* Added parking location dropdown during location updates
* Added parking location support throughout the application
* Added vehicle status visibility in recent activity

## Improvements

* Mileage displayed in vehicle details
* Mileage displayed in movement history
* Parking location displayed in vehicle details
* Parking location displayed in movement history
* Parking location displayed in recent activity
* Recent activity limited to latest 5 records

## User Experience

* Improved wording throughout the application
* Updated workflow descriptions
* Removed unnecessary demo messaging
* Removed GPS explanatory text
* Update Location panel now automatically hides when changing views
* Mark Out remains a one-click action
* Mark Out button is hidden once a vehicle is already OUT

---

# Supabase Auth Update

## New Features

* Added Supabase Auth login screen
* Added sign out support
* Hid the main app until a valid session exists
* Removed manual "Updated by" fields
* Linked new movement records to the authenticated user with `user_id`
* Saved the signed-in user's name as a movement display snapshot
* Added authenticated-only RLS SQL template
* Added security documentation

## Security Improvements

* Removed temporary Supabase connection logging
* Kept database operations to SELECT and INSERT
* Kept Mark Out as an insert-only movement event
* Documented that frontend code is public on GitHub Pages
* Documented that real protection depends on Supabase Auth and RLS
