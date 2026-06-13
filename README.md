# Vehicle Location Log

Mobile-friendly static demo for logging and searching the last known location of vehicles within a dealership, compound, or storage area.

## Purpose

The current dealership workflow may record where a vehicle was first parked, but the vehicle can later be moved by several people:

- drive-thru host
- technician
- valet / wash team
- service team
- another staff member moving blocked vehicles

The original key tag or location note can quickly become stale. This demo focuses on the core idea:

> Whoever parks the vehicle updates the latest location. The newest saved record becomes the source of truth.

## What the demo does

- Enter a vehicle registration
- Capture the phone/browser current GPS location
- Save status as `IN`
- Mark a vehicle as `OUT`
- Search a registration
- Show latest known status
- Show last updated timestamp
- Show who updated it
- Open saved GPS location in Google Maps
- Show recent movement history

## Important

This is a prototype only.

- No backend
- No real database
- No customer information
- No dealership system integration
- Records are stored in browser `localStorage`
- Data only exists on the device/browser used

## Hosting

This can be hosted as a static site using:

- GitHub Pages
- Netlify
- Vercel

GPS location capture requires HTTPS. GitHub Pages provides HTTPS.

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
Vehicle parked
↓
Staff opens web app
↓
Enter registration
↓
Tap Save Current Location
↓
GPS + timestamp + staff name are saved
↓
Next person searches registration
↓
Tap Open Location in Google Maps
```

## Future enhancements

Possible later features:

- Real shared database
- Staff login
- Shared records across devices
- Car park zone names
- Damage recording with car body diagram
- Photo upload for damage evidence
- Number plate OCR
- Dashboard for vehicles currently IN / OUT
