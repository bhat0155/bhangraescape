# Contract
## 1. API Contracts for Event Management

## Overview
This document describes how Members and Admins can interact with events in the BhangraEscape system. It covers two main features:
1. Marking interest in performing at an event (Yes/No)  
2. Setting availability for practice days (selecting weekdays)

### User Types and Permissions
- **Members/Admins**: Can mark interest and set availability for future events  
- **Guests**: Can only view event details and cannot make changes  

## Data Structures

### Event Object
```json
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

  "tallies": {
    "MON": 0, "TUE": 0, "WED": 0,
    "THU": 0, "FRI": 0, "SAT": 0, "SUN": 1
  },

  "topDays": [
    { "weekday": "SUN", "count": 1 }
  ],

  "playlist": [
    {
      "id": "pl_1",
      "provider": "SPOTIFY",
      "title": "Sadi Gali",
      "artist": "Lehmber Hussainpuri",
      "url": "https://open.spotify.com/track/..."
    }
  ],

  "media": [
    {
      "id": "m_1",
      "type": "IMAGE",
      "source": "S3",
      "url": "https://instagram.com/p/abcd...",
      "thumbUrl": "https://cdn.example.com/evt_123/abcd_thumb.jpg",
      "title": "Backstage",
      "createdAt": "2025-09-12T15:01:00Z"
    }
  ],

  "finalPlaylist": null,

  "capabilities": {
    "canSetInterest": true,
    "canSetAvailability": true
  },

  "interested": false,
  "myDays": ["SUN", "MON"]
}
```

#### Weekday Enum
Allowed values: `"MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN"`

#### Provider Rules
- `playlist[*].provider` ∈ {"SPOTIFY","YOUTUBE","EXTERNAL"}  
- `media[*].type` ∈ {"IMAGE","VIDEO"}  
- `media[*].source` ∈ {"S3","YOUTUBE","INSTAGRAM","DRIVE"}  

---

## API Endpoints

### 1. Get Event Details
```http
GET /api/events/:eventId
```
Returns all information about an event, including performers and availability.

**Possible Errors**:
- 404: Event not found

### 2. Mark Interest in Performing
```http
POST /api/events/:eventId/interest
```
Tell the system if you want to perform at this event.

**Request Body**:
```json
{ "interested": true }
```

**Response**:
```json
{ 
  "interested": true, 
  "performerCount": 5 
}
```

**Possible Errors**:
- 401: Not logged in
- 403: Not allowed (guests or past events)
- 404: Event not found

### 3. Get Availability Information
```http
GET /api/events/:eventId/availability
```
See which days people are available and your selected days.

**Response**:
```json
{
  "eventId": "evt_123",
  "myDays": ["SUN","MON"],
  "tallies": { 
    "MON": 1, "TUE": 0, "WED": 0,
    "THU": 0, "FRI": 0, "SAT": 0, "SUN": 1 
  },
  "topDays": [
    { "weekday": "SUN", "count": 1 },
    { "weekday": "MON", "count": 1 }
  ],
  "capabilities": { 
    "canSetAvailability": true 
  }
}
```

### 4. Update Your Availability
```http
POST /api/events/:eventId/availability
```
Set which days you're available for practice.

**Request Body**:
```json
{ "days": ["SUN", "MON"] }
```

**Response**:
```json
{
  "myDays": ["SUN","MON"],
  "tallies": { 
    "MON": 1, "TUE": 0, "WED": 0,
    "THU": 0, "FRI": 0, "SAT": 0, "SUN": 1 
  },
  "topDays": [
    { "weekday": "SUN", "count": 1 },
    { "weekday": "MON", "count": 1 }
  ]
}
```

**Possible Errors**:
- 400: Invalid days selected  
- 401: Not logged in  
- 403: Not allowed to update  
- 404: Event not found  

---

## Important Notes
- Guests can only view information, not make changes.  
- Changes only work for future events.  
- When no one has set availability yet, all day counts start at zero.  
- The system always shows the **top 2** most available days (tie-break: weekday order MON→SUN).  
- `playlist`, `media`, and `finalPlaylist` are read-only for non-admins and may be empty.  
- `finalPlaylist` is `null` when unset.  
- `performers`, `tallies`, `topDays`, `capabilities`, `interested`, and `myDays` are computed/derived (not client-set).  
- For guests, `interested` and `myDays` are omitted in responses.  
"""

## Scenario 2 — Admin CRUD for Events

### Overview
Admins can create, update, and delete events. The **create** form collects only **core event fields**:
- `title`
- `location`
- `date` (ISO 8601)

All other event fields are **added later** via their own flows:
- `playlist[]` (songs)
- `media[]` (images/videos)
- `finalPlaylist` (final mix link)
- `performers[]` (derived from member interest toggles; not admin-edited)

---

### Endpoints (Admin-only)

#### Create Event
```http
POST /api/events
```
**Request**
```json
{
  "title": "Diwali Night",
  "location": "Community Hall",
  "date": "2025-10-18T19:00:00Z"
}
```
**Response 201**
```json
{
  "id": "evt_123",
  "title": "Diwali Night",
  "location": "Community Hall",
  "date": "2025-10-18T19:00:00Z",
  "performers": [],
  "tallies": { "MON": 0, "TUE": 0, "WED": 0, "THU": 0, "FRI": 0, "SAT": 0, "SUN": 0 },
  "topDays": [],
  "playlist": [],
  "media": [],
  "finalPlaylist": null
}
```
**Errors**
- `401` Unauthorized (not logged in)
- `403` Forbidden (not admin)
- `422` Validation error (missing/invalid title, location, date)

**Notes**
- `id` is server-generated (client must not send it).
- Optional fields (e.g., `coverUrl`, `description`) can be added later via update.

---

#### Update Event
```http
PATCH /api/events/:eventId
```
**Request** (partial allowed)
```json
{
  "title": "Diwali Night 2025",
  "location": "Grand Hall",
  "date": "2025-10-19T19:00:00Z"
}
```
**Response 200**
```json
{
  "id": "evt_123",
  "title": "Diwali Night 2025",
  "location": "Grand Hall",
  "date": "2025-10-19T19:00:00Z"
}
```
**Errors**
- `401` Unauthorized
- `403` Forbidden (not admin)
- `404` Event not found
- `422` Validation error

**Notes**
- Updating `date` will affect runtime capabilities (`canSetInterest`, `canSetAvailability`) on reads.

---

#### Delete Event
```http
DELETE /api/events/:eventId
```
**Response 204** (no content)

**Errors**
- `401` Unauthorized
- `403` Forbidden (not admin)
- `404` Event not found

**Notes**
- Consider soft-delete if you want to keep historical media/links visible.

---

### Form → API Mapping (Create)
| Form Field | JSON Field | Required | Validation |
|------------|------------|----------|------------|
| Event name | `title`    | Yes      | non-empty, max ~120 chars |
| Location   | `location` | Yes      | non-empty, max ~160 chars |
| Date & time| `date`     | Yes      | ISO 8601 string; timezone-consistent |

---

### Acceptance Criteria
- **Given** I am an Admin, **when** I click **+ Create Event**, **then** I see a form for `title`, `location`, `date`.
- **When** I submit valid data, **then** an event is created and I’m redirected to the event detail or list view.
- **Given** I am not an Admin, **when** I call create/update/delete APIs, **then** I receive **403 Forbidden**.
- **Given** a new event, **then** `performers`, `playlist`, `media`, `finalPlaylist`, `tallies`, and `topDays` are empty/initial defaults and will be populated by later workflows.

---

### Out of Scope (handled by other endpoints)
- **Playlist** CRUD → `POST /api/events/:id/playlist`, `PATCH /api/playlist/:playlistItemId`, `DELETE /api/playlist/:playlistItemId`.
- **Media** uploads/links → `POST /api/events/:id/media/presign`, `POST /api/events/:id/media`, `DELETE /api/media/:mediaId`.
- **Final mix** link → `PUT /api/events/:id/final-playlist`, `DELETE /api/events/:id/final-playlist`.
- **Performers** derived from members’ `POST /api/events/:id/interest` (not admin-edited).
