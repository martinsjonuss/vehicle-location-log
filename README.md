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

### Vehicle Check In

* Vehicle registration capture
* Mileage capture
* Vehicle type selection
* Optional parking location selection
* Optional notes
* GPS location capture
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
* Add movement notes
* Record movement history

### Movement History

* Full history per vehicle
* Timestamped updates
* Vehicle stages
* Parking locations
* Mileage information
* Status tracking

### Activity Feed

* Recent vehicle activity
* Displays latest 10 updates
* Shows vehicle status
* Quick access to vehicle records

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

## Parking Locations

The application currently supports:

* Sales
* Budget
* Parking 1
* Parking 2
* Parking 3
* Parking 4
* Parking 5
* Parking 6
* Parking 7
* Other

Parking locations are optional and can be used alongside GPS location data.

---

## Technology

Frontend:

* HTML
* CSS
* JavaScript

Storage:

* Browser localStorage

Hosting:

* GitHub Pages

Maps:

* Google Maps

---

## Limitations

This is currently a proof of concept.

The application does not currently include:

* User accounts
* Shared database
* Multi-user support
* Notifications
* Vehicle assignment
* Integration with dealership systems
* Customer information

All data is stored locally within the browser.

---

## Future Ideas

Potential future enhancements:

* Shared database
* User authentication
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
* Recent activity limited to latest 10 records

## User Experience

* Improved wording throughout the application
* Updated workflow descriptions
* Removed unnecessary demo messaging
* Removed GPS explanatory text
* Update Location panel now automatically hides when changing views
* Mark Out remains a one-click action
* Mark Out button is hidden once a vehicle is already OUT
