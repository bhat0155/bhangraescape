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

# Scenario 1 — Member/Admin Interest & Availability

## Overview
Members and Admins can mark **interest** (Yes/No) and set **practice availability** (weekdays) for **future events only**.  
Guests are read-only. For **past events**, interest/availability actions are **disabled** and availability endpoints **reject**.

---

## Event Detail (read)
```http
GET /api/events/:eventId
```
**Response (shape excerpt)**
```json
{
  "id": "evt_123",
  "title": "Diwali Night",
  "location": "Community Hall",
  "date": "2025-10-18T19:00:00Z",

  "performers": [{ "userId": "u1", "name": "Aisha", "avatarUrl": "/avatars/u1.jpg", "description": "..." }],

  "tallies": { "MON": 0, "TUE": 0, "WED": 0, "THU": 0, "FRI": 0, "SAT": 0, "SUN": 1 },
  "topDays": [{ "weekday": "SUN", "count": 1 }],

  "playlist": [],
  "media": [],
  "finalPlaylist": null,

  "capabilities": {
    "canSetInterest": true,
    "canSetAvailability": true
  },

  "interested": false,
  "myDays": ["SUN", "MON"]
}
```

**Notes**
- `performers[]` is **derived** from Interest rows where `interested = true` (includes admin backfills; see Scenario 2).
- `capabilities` are **computed** (not stored). Typical rules:
  - `canSetInterest = isMemberOrAdmin && eventIsFuture`
  - `canSetAvailability = isMemberOrAdmin && eventIsFuture`
- For **past events**: both capability flags are `false`.

---

## Mark Interest (self-service)
```http
POST /api/events/:eventId/interest
```
**Body**
```json
{ "interested": true }
```
**Response**
```json
{ "interested": true, "performerCount": 5 }
```
**Errors**
- `401` Not logged in
- `403` Not allowed (guest or **EVENT_IN_PAST**)
- `404` Event not found

---

## Get Availability (read)
```http
GET /api/events/:eventId/availability
```
**Response**
```json
{
  "eventId": "evt_123",
  "myDays": ["SUN","MON"],
  "tallies": { "MON": 1, "TUE": 0, "WED": 0, "THU": 0, "FRI": 0, "SAT": 0, "SUN": 1 },
  "topDays": [{ "weekday": "SUN", "count": 1 }, { "weekday": "MON", "count": 1 }],
  "capabilities": { "canSetAvailability": true }
}
```
**Errors**
- `403` **EVENT_IN_PAST**
- `404` Event not found

---

## Update Availability (write)
```http
POST /api/events/:eventId/availability
```
**Body**
```json
{ "days": ["SUN", "MON"] }
```
**Response**
```json
{
  "myDays": ["SUN","MON"],
  "tallies": { "MON": 1, "TUE": 0, "WED": 0, "THU": 0, "FRI": 0, "SAT": 0, "SUN": 1 },
  "topDays": [{ "weekday": "SUN", "count": 1 }, { "weekday": "MON", "count": 1 }]
}
```
**Errors**
- `400` Invalid days
- `401` Not logged in
- `403` Not allowed (guest or **EVENT_IN_PAST**)
- `404` Event not found

---

## Important Rules
- **Past events**: all interest/availability POSTs return `403 EVENT_IN_PAST`.
- **Computed, not stored**: `capabilities`, `tallies`, `topDays`.
- **Weekdays enum**: `"MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN"`.


## Scenario 3 — Join Team (Guest → Member via Admin Approval) — Login Required

### Overview
A **Guest** can request to join the team. They must be logged in to submit the form.  
If the user is not logged in, clicking **Join Team** redirects them to the Login/Signup page first.  
Once logged in as a Guest, they can submit a Join Team form.  
Admins receive an email notification, review the request, and approve/reject.  
On approval, the user’s role changes from `GUEST` → `MEMBER`.

---

### Data Structures

#### JoinRequest (response shape)
```json
{
  "id": "jr_123",
  "userId": "u_789",
  "name": "Ekam B",
  "email": "ekam@example.com",
  "message": "I'd like to join as a dancer.",
  "status": "PENDING",            // "PENDING" | "APPROVED" | "REJECTED"
  "createdAt": "2025-09-13T15:01:00Z",
  "reviewedAt": null
}
```

---

### Endpoints

#### Submit Join Request (Guest; must be authenticated)
```http
POST /api/join-team
```
**Request**
```json
{
  "name": "Ekam B",
  "email": "ekam@example.com",
  "message": "I'd like to join as a dancer."
}
```
**Response 201**
```json
{ "id": "jr_123", "status": "PENDING" }
```

**Side effects**
- Persist JoinRequest linked to the current session’s `userId`.
- Send notification email to admins containing `name` and `email`.

**Errors**
- `401` Unauthorized (not logged in) → redirect to login
- `409` Conflict (already has a PENDING request)
- `422` Validation error

---

#### List Pending Join Requests (Admin)
```http
GET /api/join-requests?status=PENDING
```

---

#### Review Join Request (Approve/Reject) — Admin
```http
PATCH /api/join-requests/:joinRequestId
```
- **APPROVE** → `user.role = MEMBER`, notify user.
- **REJECT** → request marked rejected, user can submit a new one later.

---

### UI Flow
1. **Anonymous visitor (not logged in)**  
   - Clicks **Join Team** → redirected to **Login/Signup** → on success, redirected back to Join Team form.

2. **Logged-in Guest (role = GUEST)**  
   - Clicks **Join Team** → taken to Join Team form → submits → request saved + email sent to admins.

3. **Logged-in Member/Admin**  
   - The **Join Team** button is **hidden** (not shown).

4. **While status = PENDING**  
   - Frontend shows: *“Join team request already sent.”*  
   - If status changes to APPROVED/REJECTED → message disappears.

---

### Acceptance Criteria
- Only logged-in Guests can access the Join Team form.  
- Non-logged in visitors clicking **Join Team** are redirected to Login/Signup first.  
- Members/Admins do not see the Join Team button at all.  
- Guests can only have one active PENDING request.  
- An email with `name` and `email` is sent to admins on submission.  
- Users with a **PENDING** request see “Join team request already sent.”  
- Approving a request sets `user.role = MEMBER`.  
- Rejected users can reapply by submitting a new request.

## Scenario 4 — Members Directory (Public) + Admin CRUD

### Overview
Anyone can view the **Members** list and individual **Member** profiles.  
Admins can **create, update, and delete** members from the Member Detail page (via + and ✏️ icons).  
Every member must have an **avatar image**.

---

### Data Structures

#### MemberPublic
```json
{
  "id": "u_123",
  "name": "Aisha",
  "avatarUrl": "https://cdn.example.com/avatars/u_123.jpg",
  "description": "Lead dancer with 5 years of experience",
  "role": "MEMBER"
}
```

---

### Endpoints

#### List Members (public)
```http
GET /api/members
```

#### Get Member Detail (public)
```http
GET /api/members/:memberId
```

---

### Admin CRUD

#### Create Member (Admin)
```http
POST /api/members
```
**Request**
```json
{
  "name": "Aisha",
  "avatarUrl": "https://cdn.example.com/avatars/u_123.jpg",
  "description": "Lead dancer with 5 years of experience"
}
```
**Response 201**
```json
{
  "id": "u_123",
  "name": "Aisha",
  "avatarUrl": "https://cdn.example.com/avatars/u_123.jpg",
  "description": "Lead dancer with 5 years of experience",
  "role": "MEMBER"
}
```

---

#### Update Member (Admin)
```http
PATCH /api/members/:memberId
```
**Request (partial allowed)**
```json
{
  "name": "Aisha K.",
  "description": "Lead dancer & choreography mentor",
  "avatarUrl": "https://cdn.example.com/avatars/u_123_new.jpg"
}
```

---

#### Delete Member (Admin)
```http
DELETE /api/members/:memberId
```

---

### Avatar Upload (Admin) — S3 Presign Pattern
1. **Presign request**  
   `POST /api/members/:memberId/avatar/presign` → `{ uploadUrl, publicUrl }`
2. **Upload to S3 directly**
3. **Register avatar URL**  
   `POST /api/members/:memberId/avatar` with `{ avatarUrl }` (required)

---

### Validation Rules
- `name`: required, 1–80 chars  
- `avatarUrl`: **required**, valid https URL, uploaded image must be `jpeg|png|webp`  
- `description`: optional, up to 300 chars  

---

### Acceptance Criteria
- Everyone can view Members list and details.  
- `avatarUrl` is mandatory for every member (at create and update).  
- Admin-only controls (+, edit, delete, change avatar) are hidden for non-admins and blocked by API.  
- Creating/updating a member without `avatarUrl` returns **422 Validation Error**.  
- Deleted members disappear from `GET /api/members`.  

## Scenario 5 — Contact Us (Public)

### Overview
Anyone can submit the Contact Us form. The system validates the input, sends the message to admin emails, and shows a confirmation page with a button to return to the homepage.

---

### Data Structures

#### ContactMessage (server-side record; optional to persist)
```json
{
  "id": "cm_123",
  "name": "Ekam B",
  "email": "ekam@example.com",
  "message": "We’d love to collaborate for Diwali Night.",
  "createdAt": "2025-09-13T15:01:00Z"
}
```

---

### Endpoint

#### Submit Contact Message (public)
```http
POST /api/contactus
```

**Request**
```json
{
  "name": "Ekam B",
  "email": "ekam@example.com",
  "message": "We’d love to collaborate for Diwali Night."
}
```

**Response**
- **202 Accepted**
```json
{ "status": "queued" }
```

**Side Effects**
- Validate `name`, `email`, and `message` fields.
- Persist a `ContactMessage` row for audit/support (optional).
- Immediately send an email to admin distribution with the provided details.

**Errors**
- `422` Validation error (missing/invalid `name`, `email`, or `message`).
- `429` Too Many Requests (rate limit exceeded).
- `500` Email dispatch failure (message may still be stored).

---

### Validation Rules
- `name`: required, 1–80 chars.
- `email`: required, valid email format.
- `message`: required, 1–2000 chars.
- Trim whitespace; reject empty-after-trim.

---

### Abuse & Reliability - For phase 2 - latter implementation
- **Rate limit** by IP and email (e.g., 5 requests / 10 minutes).
- **Bot protection**: reCAPTCHA or invisible honeypot field.
- **Email**: send via a transactional provider (SES/SendGrid/Postmark); retry on transient errors.
- **Logging**: log request ID + email provider response ID for troubleshooting.

---

### UI Flow
1. User clicks **Contact Us** in navbar → navigates to form page.
2. User fills **name, email, message** → clicks **Submit**.
3. Frontend calls `POST /api/contactus`.
4. On **success** (202), show a **confirmation page**:  
   “Thanks for contacting us, we will get back to you soon.”  
   → Display a **Return to Homepage** button.
5. On **error**, show inline validation or friendly retry message.

---

### Acceptance Criteria
- `name`, `email`, and `message` fields are validated before submission.
- Submitting sends an email to admins immediately.
- On success, the user sees a confirmation page with a **Return to Homepage** button.
- Invalid submissions return **422** with field-level errors.
- Excessive submissions return **429**.

## Scenario 6 — Events Listing (See All Events)

### Overview
When a user clicks **See All Events** on the homepage, the app navigates to the Events listing page and fetches a list of events. The frontend renders the events as **cards in a grid** with filters for **Upcoming / Past** and a **search field**.

---

### Endpoint (Public)

#### List Events
```http
GET /api/events
```

**Query Parameters (optional)**
- `status` — filter by time window: `upcoming` | `past` | `all` (default: `all`)
- `search` — free-text search over `title` and `location`

**Response 200**
```json
{
  "items": [
    {
      "id": "evt_123",
      "title": "Diwali Night",
      "location": "Community Hall",
      "date": "2025-10-18T19:00:00Z",
      "coverUrl": "https://cdn.example.com/events/evt_123/cover.jpg"
    }
  ]
}
```

**Notes**
- Listing items are **lightweight** (no `performers`, `tallies`, `playlist`, `media`).
- The **full event** (with capabilities, performers, tallies, media, etc.) is returned by `GET /api/events/:eventId`.

**Errors**
- Always `200` with empty `items` when no results.
- `400` if query params invalid (e.g., bad `status`).
- `500` on server error.

---

### Card Data (recommended)
- **Title**
- **Date** (formatted for locale)
- **Location**
- **Cover image** (optional; fallback to placeholder if none)

---

### UI Flow
1. User clicks **See All Events** → navigate to `/events`.
2. Frontend calls `GET /api/events` (optionally with `status` or `search`).
3. Render items as cards in a **responsive grid**.
4. User can toggle **Upcoming / Past** or enter a **search query** to filter results.
5. Clicking a card → navigate to Event Detail page (`/events/:eventId`) and call `GET /api/events/:eventId`.

---

### Acceptance Criteria
- **Given** the Events listing page, **when** the API returns results, **then** events are displayed as cards in a grid.
- **Given** no events match filters, **then** show an empty state (“No events yet. Check back soon.”).
- **Given** a user selects **Upcoming** or **Past**, **then** the list reloads accordingly.
- **Given** a user enters a **search query**, **then** the results filter to matching events.
- **Given** an event card is clicked, **then** the app navigates to the Event Detail page.

## Scenario 7 — Admin: Review Join Requests

### Overview
Admins see a **Requests** item in the navbar. Clicking it opens a page listing **pending join requests** with **Approve** / **Reject** actions.  
- **Approve** → user’s role changes from `GUEST` → `MEMBER` (they can now set interest/availability).  
- **Reject** → request is marked rejected; the user may submit a new request later.

---

### Data Structures

#### JoinRequest (list/detail shape)
```json
{
  "id": "jr_123",
  "userId": "u_789",
  "name": "Ekam B",
  "email": "ekam@example.com",
  "message": "I'd like to join as a dancer.",
  "status": "PENDING",            // "PENDING" | "APPROVED" | "REJECTED"
  "createdAt": "2025-09-13T15:01:00Z",
  "reviewedAt": null
}
```

---

### Endpoints (Admin-only)

#### List Join Requests
```http
GET /api/join-requests
```
**Query params (optional)**
- `status=PENDING|APPROVED|REJECTED` (default: `PENDING`)
- `q` (search by name/email)
  
**Response 200**
```json
{
  "items": [
    {
      "id": "jr_123",
      "userId": "u_789",
      "name": "Ekam B",
      "email": "ekam@example.com",
      "message": "I'd like to join as a dancer.",
      "status": "PENDING",
      "createdAt": "2025-09-13T15:01:00Z"
    }
  ]
}
```

**Errors**
- `401` Unauthorized
- `403` Forbidden (not admin)

---

#### Review a Join Request (Approve/Reject)
```http
PATCH /api/join-requests/:joinRequestId
```
**Request (approve)**
```json
{ "action": "APPROVE" }
```
**Request (reject)**
```json
{ "action": "REJECT" }
```

**Response 200 (approve)**
```json
{
  "id": "jr_123",
  "status": "APPROVED",
  "reviewedAt": "2025-09-13T16:10:00Z"
}
```

**Side effects**
- On **APPROVE**: set `user.role = "MEMBER"` for the associated `userId`; (optional) send confirmation email.
- On **REJECT**: mark request as rejected; user may submit a new request later.

**Errors**
- `401` Unauthorized
- `403` Forbidden (not admin)
- `404` Join request not found
- `409` Conflict (already reviewed)

---

### UI Behavior
- Navbar shows **Requests** (admin-only).  
- Requests page loads **PENDING** by default via `GET /api/join-requests?status=PENDING`.  
- Each row shows **name, email, message, createdAt** and **Approve / Reject** buttons.  
- Approve/Reject updates the row inline (optimistic UI allowed).  
- (Optional) Add tabs or filters: **Pending / Approved / Rejected**.

---

### Acceptance Criteria
- Only admins can access the Requests page and endpoints.
- Default view lists **PENDING** requests.
- Approving a request **promotes** the user to **MEMBER**.
- Rejecting a request **does not block** the user from applying again later.
- Users with a **PENDING** request see “Join team request already sent” (Scenario 3).
"""