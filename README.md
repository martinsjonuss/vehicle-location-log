# Vehicle Location Log

Mobile-friendly static MVP for logging and searching the last known location of vehicles within a dealership, compound, or storage area.

## Core problem

A vehicle can be moved by several people after check-in:

- drive-thru host
- mechanic
- service advisor
- sales team
- valet / wash team
- anyone moving blocked vehicles

The original key tag or first parking location can become stale. This prototype uses a simple rule:

> Whoever parks the vehicle updates the app. The newest saved record becomes the source of truth.

## Current demo features

- Check in a vehicle
- Capture phone/browser GPS location
- Search by registration
- Show current status: IN / OUT
- Show current stage, e.g. Checked In, In Workshop, Waiting for Valet, Ready for Customer
- Open latest GPS location in Google Maps
- Update location without retyping the registration after searching
- Mark vehicle as OUT with one click
- View clickable per-vehicle movement history
- View recent activity log
- Store records locally using `localStorage`

## Important

This is a static prototype only.

- No backend
- No real database
- No customer information
- No dealership system integration
- Data is stored only on the device/browser used

## Hosting

Can be hosted using:

- GitHub Pages
- Netlify
- Vercel

GPS requires HTTPS. GitHub Pages provides HTTPS.

## Project structure

```text
vehicle-location-log/
├── README.md
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── data/
    └── vehicles.json
```

## MVP workflow

```text
Customer arrives
↓
Drive-thru host checks vehicle in
↓
Host parks vehicle and saves GPS location
↓
Mechanic searches registration
↓
Mechanic opens location and finds vehicle
↓
Mechanic completes work and parks vehicle
↓
Mechanic updates location/stage
↓
Next person sees latest location
```

## Suggested future features

- Shared database
- Staff login
- Real-time sync across devices
- Damage recording with car body diagram
- Photo upload for damage evidence
- Number plate OCR
- Department-specific views
- Filter by stage/status

## v2.1 update

- Mark Out is now one-click.
- Mark Out button is hidden when a vehicle is already OUT.
