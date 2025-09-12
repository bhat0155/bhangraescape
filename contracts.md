## Contracts


# 1
Use Case: Member/Admin can set Interest (toggle) and Availability for an Event

Overview

This contract defines the endpoints, request/response formats, and rules enabling authenticated Members and Admins to:

Set their Interest (Interested in performing: yes/no).

Mark Availability by selecting weekdays.

Guests have read-only access (event details, performers, tallies, top days) and see a Join Team CTA.

Entities
Event (Response Shape)
Field	Type	Notes
id	string	Unique identifier.
title	string	Event name/title.
location	string	Venue or place.
date	ISO8601 datetime	Scheduled date/time.
performers[]	array of UserPublic	Derived: users with interested = true for this event.
tallies	object {Weekday:int}	Vote counts per weekday, computed at runtime.
topDays[]	array {weekday,count}	Top two weekdays by count (may be empty initially).
capabilities	object	Runtime booleans: { canSetInterest, canSetAvailability }.
interested	boolean (optional)	Current user’s interest; omitted for guests.
myDays[]	array of Weekday (opt)	Current user’s availability; omitted for guests.
UserPublic
Field	Type	Notes
userId	string	Unique user id.
name	string	Display name.
avatarUrl	string	Profile image URL.
description	string	Short bio/role text shown on avatar/profile.
Weekday

"MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN"

Capabilities (Runtime Rules)

canSetInterest = true if user role ∈ {MEMBER, ADMIN} and event date is in the future.

canSetAvailability = true if user role ∈ {MEMBER, ADMIN} and event date is in the future.

Guests: both are false.

These flags are computed per request; never stored in the database.

Endpoints
1) Get Event Detail

GET /api/events/:eventId

200 OK

{
  "id": "evt_123",
  "title": "Diwali Night",
  "location": "Community Hall",
  "date": "2025-10-18T19:00:00Z",

  "performers": [
    {
      "userId": "u1",
      "name": "Aisha",
      "avatarUrl": "/avatars/u1.jpg",
      "description": "Lead dancer with 5 years of experience"
    }
  ],

  "tallies": { "MON": 0, "TUE": 0, "WED": 0, "THU": 0, "FRI": 0, "SAT": 0, "SUN": 1 },

  "topDays": [
    { "weekday": "SUN", "count": 1 }
  ],

  "capabilities": { "canSetInterest": true, "canSetAvailability": true },

  "interested": false,         // omit for guests
  "myDays": ["SUN","MON"]      // omit for guests
}


Errors

404 Event not found

Rules

performers, tallies, topDays are derived on read.

Capabilities are computed from role + future date.

2) Set Interest (toggle)

POST /api/events/:eventId/interest

Request

{ "interested": true }


200 OK

{ "interested": true, "performerCount": 5 }


Errors

401 Unauthorized (not logged in)

403 Forbidden (guest or past event)

404 Event not found

Rules

Idempotent (posting same state returns 200 with no change).

Server updates the user’s per-event interested flag; performers[] reflects on next GET.

Frontend Notes

Optimistic UI is fine; reconcile with response or quick refetch.

3) Get Availability

GET /api/events/:eventId/availability

200 OK

{
  "eventId": "evt_123",
  "myDays": ["SUN","MON"],     // omitted for guests
  "tallies": { "MON": 1, "TUE": 0, "WED": 0, "THU": 0, "FRI": 0, "SAT": 0, "SUN": 1 },
  "topDays": [
    { "weekday": "SUN", "count": 1 },
    { "weekday": "MON", "count": 1 }
  ],
  "capabilities": { "canSetAvailability": true }
}


Errors

404 Event not found

Rules

topDays = two weekdays with highest counts (tie-break by weekday order MON..SUN).

Guests: myDays omitted and canSetAvailability=false.

4) Update Availability (replace selection)

POST /api/events/:eventId/availability

Request

{ "days": ["SUN","MON"] }


200 OK

{
  "myDays": ["SUN","MON"],
  "tallies": { "MON": 1, "TUE": 0, "WED": 0, "THU": 0, "FRI": 0, "SAT": 0, "SUN": 1 },
  "topDays": [
    { "weekday": "SUN", "count": 1 },
    { "weekday": "MON", "count": 1 }
  ]
}


Errors

400 Invalid weekday or duplicate values

401 Unauthorized

403 Forbidden (guest or past event)

404 Event not found

Rules

Idempotent for identical sets.

Server recalculates tallies and topDays on each update.

Initial/Empty States

performers: [] when no one is interested.

topDays: [] and tallies with all zeros when no availability is set.

interested/myDays omitted for guests.