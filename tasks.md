## Overview
- Stack: **TypeScript** (Next.js + Express + Prisma + Zod)
- Order: **Backend → Auth → Admin → Frontend → Media → Deploy**
- Pace: **15 days × ~2h/day**
- Notes: SES = email (Contact/Join), S3 = media uploads, Caching = faster event lists

## Phase 0 — Setup & DB (Days 1–3)
**Day 1 — Repo & Scaffolding**
- Create the repo with two apps:
/apps/web   (Next.js — TypeScript)
/apps/api   (Express — TypeScript)
tasks.md, CONTRACTS.md, README.md, .gitignore, .editorconfig, .env.sample

- Web (Next.js):
- `npx create-next-app@latest apps/web --ts`
- Run: `npm run dev` → http://localhost:3000
- API (Express + TS):
- `npm init -y`
- `npm i express zod cors helmet morgan`
- `npm i -D typescript ts-node-dev @types/node @types/express`
- `npx tsc --init` (set `"strict": true`, `"outDir": "dist"`, `"esModuleInterop": true`)
- Create `src/server.ts` with a health route:  
  `GET /health` → `{ ok: true }`
- Add scripts in `package.json`:
  ```json
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
  ```
- Run: `npm run dev` → http://localhost:4000/health
- Housekeeping:
- `.gitignore` (node_modules, .env, dist, .next)
- `.env.sample` (`DATABASE_URL=`, `NEXTAUTH_SECRET=`, etc.)
- `README.md` (goal + how to run apps)
- Commit initial structure.

### DoD (Definition of Done)
- Next.js boots at **http://localhost:3000**.
- Express responds at **http://localhost:4000/health** with `{ "ok": true }`.
- Repo contains: `apps/web`, `apps/api`, `tasks.md`, `CONTRACTS.md`, `.env.sample`, `.gitignore`.

---

## Day 2 — Prisma & Database Schema

### Tasks
- Install & init Prisma in `/apps/api`:
- `npm i @prisma/client`
- `npm i -D prisma`
- `npx prisma init`
- Define models in `schema.prisma`:
- **User**
  - id, name, email?, avatarUrl, description, role
- **Event**
  - id, title, location, date  
  - finalPlaylistProvider?, finalPlaylistUrl?
- **Interest**
  - eventId, userId, interested  
  - `@@unique([eventId, userId])`
- **AvailabilityPreference**
  - id, eventId, userId, days: Weekday[], updatedAt  
  - `@@unique([eventId, userId])`
- **Media**
  - id, eventId, type, source, url, thumbUrl?, title?, createdAt
- **JoinRequest**
  - id, userId?, name, email, message, status, createdAt
- **PlaylistItem**
  - id, eventId, provider, title, artist, url, createdAt
- Define enums:
- `Role { GUEST, MEMBER, ADMIN }`
- `Weekday { MON, TUE, WED, THU, FRI, SAT, SUN }`
- `MediaType { IMAGE, VIDEO }`
- `MediaSource { S3, YOUTUBE, INSTAGRAM, DRIVE }`
- `JoinStatus { PENDING, APPROVED, REJECTED }`
- `PlaylistProvider { SPOTIFY, YOUTUBE, EXTERNAL, SOUNDCLOUD }`
- Add FKs:
- `Interest.eventId → Event.id`, `Interest.userId → User.id`
- `AvailabilityPreference.eventId → Event.id`, `userId → User.id`
- `Media.eventId → Event.id`
- `PlaylistItem.eventId → Event.id`
- Run: `npx prisma migrate dev`
- Create `prisma/seed.ts`:
- Seed 1 ADMIN user, 1 MEMBER user, 1 future event, 1 past event.
- Run: `npx prisma db seed`

### DoD
- Migration runs successfully (tables created).
- `npx prisma studio` opens and seeded rows are visible:
- Users table has ADMIN + MEMBER.
- Events table has 1 future + 1 past event.

## Day 3 — API Skeleton & Middleware (TypeScript)

# Goals
Create a clean backend structure with routes → controllers → services, input validation with Zod, and a global error pipeline. No feature logic yet—just the skeleton wired up.

## File/Folder Layout
apps/api/src/
server.ts
lib/
prisma.ts
config.ts
middleware/
auth.ts          // stub today (real on Day 6)
validate.ts      // Zod helpers for params/query/body
errors.ts        // global error handler
schemas/
events.schemas.ts
members.schemas.ts
join.schemas.ts
contact.schemas.ts
common.schemas.ts // Weekday enum, ids, etc. (Zod)
controllers/
events.controller.ts
members.controller.ts
join.controller.ts
contact.controller.ts
services/
events.service.ts
members.service.ts
join.service.ts
contact.service.ts
routes/
events.routes.ts
members.routes.ts
join.routes.ts
contact.routes.ts

## Tasks

### 1) `lib/prisma.ts`
- Export a **singleton** `PrismaClient` to reuse connections.

### 2) `lib/config.ts`
- Parse `.env` with **Zod** (e.g., `DATABASE_URL`, optional `AWS_REGION`, etc.).
- Export a typed `config` object. Fail fast if required keys are missing.

### 3) `middleware/validate.ts`
- Helpers: `validateParams(schema)`, `validateQuery(schema)`, `validateBody(schema)` that:
  - parse with Zod,
  - attach parsed values to `req` (e.g., `req.validated.params`),
  - `next()` with a 422-style error if invalid.

### 4) `middleware/auth.ts` (stub today)
- `authSession` → for now, attach a fake user to `req.user` (or `undefined`).
- `requireRole('ADMIN')` → for now, just `next()`; wire real checks Day 6.

### 5) `middleware/errors.ts`
- A **global error handler** that:
  - Maps known errors (validation, not found, forbidden) to proper HTTP codes.
  - Returns JSON `{ error: "MESSAGE", code?: "ERROR_CODE" }`.

### 6) `schemas/*.schemas.ts`
- Define **Zod schemas for API inputs** (not DB):
  - `common.schemas.ts`: `IdSchema` (cuid/uuid), `WeekdaySchema` enum, etc.
  - `events.schemas.ts`: 
    - `GetEventParams` (eventId)
    - `CreateEventBody` (`title`, `location`, `date`)
    - `PatchEventBody` (partial)
    - `InterestBody` (`interested: boolean`)
    - `AvailabilityBody` (`days: Weekday[]`)
  - `members.schemas.ts`: create/patch member (require `avatarUrl`, `name`, `description`)
  - `join.schemas.ts`: join request submit, review (approve/reject)
  - `contact.schemas.ts`: contact message body (`name`, `email`, `message`)

*(Responses can be typed later; start with inputs.)*

### 7) `controllers/*.controller.ts` (thin)
- For each route handler, just:
  - read **validated** data from `req`,
  - call a **service** function (which is still a stub),
  - return `res.json({ ok: true })` for now.

### 8) `services/*.service.ts` (stubs)
- Export functions you’ll fill in on feature days:
  - `events.service.ts`: `getEventDetail`, `updateInterest`, `updateAvailability`, `createEvent`, `patchEvent`, `deleteEvent`, etc.
  - `members.service.ts`: `listMembers`, `getMember`, `createMember`, `patchMember`, `deleteMember`
  - `join.service.ts`: `submitJoinRequest`, `listJoinRequests`, `reviewJoinRequest`
  - `contact.service.ts`: `submitContactMessage`

### 9) `routes/*.routes.ts`
- Mount GET/POST endpoints per contract **but** point them to thin controllers.
- Apply `validate.*` and **(stub)** `authSession`/`requireRole` where appropriate.
  - Example (conceptually):  
    - Public: `GET /api/events`, `GET /api/events/:id`, `POST /api/contactus`, `POST /api/join-team`
    - Admin (guard later): events CRUD, members CRUD, join-requests review, media endpoints (to be added later)

### 10) `src/server.ts`
- Create Express app with:
  - `helmet`, `cors`, `morgan` (basic logging)
  - `app.get('/health', ...)`
  - Mount route modules under `/api/...`
  - **Mount `errors.ts` LAST** so it catches everything.

## Definition of Done (DoD)
- Server starts without errors.
- `GET /health` returns `{ ok: true }`.
- Hitting any stubbed route returns a simple JSON (e.g., `{ ok: true }`).
- Invalid inputs on a validated route return **422-style** JSON from your **global error handler**.
- Project layout matches the structure above (routes → controllers → services, plus middleware & schemas).

> **Reminder for tomorrow (Day 4):** you’ll replace stubs with **real logic** for Scenario 1 (Event detail, Interest, Availability), using the Zod schemas you created today.

# Day 4 — Scenario 1: Event Detail, Interest & Availability
## Goals
Implement member-facing features for a single event:
- Compute and return **capabilities** for the current user
- Return **performers**, **tallies**, and **topDays**
- Allow **interest toggle** (Yes/No)
- Allow **availability** selection (Weekday[])

> Writes are **future events only**. Guests can read, not write.

---

## Endpoints (backend)

### 1) Get Event Detail (with computed fields)

GET /api/events/:eventId
**Server computes & returns:**
- `capabilities`: `{ canSetInterest, canSetAvailability }`
- `performers`: list of users where `Interest.interested = true`
- `tallies`: `{ MON, TUE, WED, THU, FRI, SAT, SUN }` from `AvailabilityPreference.days`
- `topDays`: top 2 by YES count (tie-breaker: MAYBE not used here; if you later add MAYBE, tie-break MAYBE desc, then date asc)
- `interested`: current user’s value or `false` if none
- `myDays`: current user’s availability days or `[]` if none

**Rules:**
- `eventIsFuture = event.date > nowUTC`
- `canSetInterest = isMemberOrAdmin && eventIsFuture`
- `canSetAvailability = isMemberOrAdmin && eventIsFuture`

---

### 2) Toggle Interest
POST /api/events/:eventId/interest
Body: { “interested”: boolean }
**Behavior:**
- Upsert `Interest` (unique on `eventId + userId`)
- Only if **future** event and **role ∈ {MEMBER, ADMIN}**
- Returns `{ interested, performerCount }`

**Errors:**
- `401` unauthenticated
- `403` guest or past event
- `404` event not found
- `422` invalid body

---

### 3) Get Availability (myDays + tallies)
GET /api/events/:eventId/availability
**Returns:**
- `myDays` for current user
- `tallies` for all users
- `topDays` (top 2)

---

### 4) Set Availability
POST /api/events/:eventId/availability
Body: { “days”: Weekday[] }   // e.g., [“SUN”,“MON”]
**Behavior:**
- Upsert `AvailabilityPreference` (unique on `eventId + userId`)
- Recompute `tallies` + `topDays` and return them

**Errors:**
- `401` unauthenticated
- `403` guest or past event
- `404` event not found
- `422` invalid days

---

## Data sources (DB)
- `Event` (id, title, location, date, …)
- `Interest` (`eventId`, `userId`, `interested`, `@@unique([eventId,userId])`)
- `AvailabilityPreference` (`id`, `eventId`, `userId`, `days: Weekday[]`, `@@unique([eventId,userId])`)
- `User` (id, name, avatarUrl, description, role)

---

## Zod request schemas (inputs)
- `GetEventParams`: `{ eventId: string }`
- `InterestBody`: `{ interested: boolean }`
- `AvailabilityBody`: `{ days: Weekday[] }` (Weekday ∈ {MON…SUN})

*(You created these file shells on Day 3; today you finalize the shapes.)*

---

## Services (business logic you implement)
- `getEventDetail(eventId, user)`
  - Load event; compute `eventIsFuture`
  - Query `Interest` where `interested=true` → build `performers` (id, name, avatarUrl, description)
  - Query all `AvailabilityPreference` → reduce to `tallies`
  - Compute `topDays` = top 2 by count (stable tie-break by weekday order if needed)
  - `myDays` from current user’s row; `interested` from their `Interest`
  - Compute `capabilities` per rules above
- `updateInterest(userId, eventId, interested)`
  - Guard: role + future date
  - Upsert Interest
  - Return `{ interested, performerCount }`
- `updateAvailability(userId, eventId, days)`
  - Guard: role + future date
  - Upsert AvailabilityPreference
  - Recompute and return `{ myDays, tallies, topDays }`

---

## Controllers (thin)
- Read validated `params/body`, read `req.user` (temporary stub ok today)
- Call service
- Return JSON
- Throw/next on errors → global error handler formats response

---

## Middleware usage today
- `validateParams/validateBody` (Zod) on these routes
- `authSession` can be **stubbed** today (real parsing Day 6)
- **Do not** forget: server must still enforce guards in services

---

## Definition of Done (DoD)
- `GET /api/events/:eventId` returns:
  - `capabilities`, `performers`, `tallies`, `topDays`, `interested`, `myDays`
- `POST /api/events/:eventId/interest` toggles and returns `interested` + `performerCount`
- `GET/POST /api/events/:eventId/availability` returns/updates `myDays`, `tallies`, `topDays`
- Past events reject writes with **403**
- Guests cannot write (403), but can read detail/availability
- Basic Postman tests recorded (happy + error paths)

---

## Test matrix (quick)
- **Future event, MEMBER**
  - GET detail → `canSet* = true`
  - POST interest true/false → success
  - POST availability `["SUN","MON"]` → success, tallies update
- **Past event, MEMBER**
  - GET detail → `canSet* = false`
  - POST interest/availability → 403
- **Guest**
  - GET detail/availability → 200
  - POST interest/availability → 403
- **Invalid**
  - Bad eventId → 404
  - Bad body (`days: ["FUNDAY"]`) → 422

### **Day 5 — Admin Event CRUD + Validation (TypeScript + Zod)**
**Goal**
- Implement create/update/delete for Events.
- Validate inputs with Zod.
- Protect routes with admin-only middleware (stub today; real auth on Day 6).

**Endpoints (Admin-only)**
- `POST /api/events` — create
- `PATCH /api/events/:eventId` — update core fields
- `DELETE /api/events/:eventId` — delete

**Tasks**
- **Schemas** (`apps/api/src/schemas/events.schemas.ts`)
  - `EventIdParams`: `{ eventId: string }` (use your IdSchema if you have one)
  - `CreateEventBody`: `{ title (1–120), location (1–160), date (ISO-8601) }`
  - `PatchEventBody`: `{ title?, location?, date? }` + refine(≥1 field)
- **Middleware**
  - Use `validateParams/validateBody` (Zod).
  - Use `authSession` (stub today) and `requireRole('ADMIN')` (check `req.user?.role`).
- **Routes** (`apps/api/src/routes/events.routes.ts`)
  - `POST /api/events` → `authSession` → `requireRole('ADMIN')` → `validateBody(CreateEventBody)` → controller.create
  - `PATCH /api/events/:eventId` → `authSession` → `requireRole('ADMIN')` → `validateParams(EventIdParams)` → `validateBody(PatchEventBody)` → controller.patch
  - `DELETE /api/events/:eventId` → `authSession` → `requireRole('ADMIN')` → `validateParams(EventIdParams)` → controller.remove
- **Controllers** (thin)
  - Read `req.validated`, call services, send JSON / 201 / 200 / 204.
- **Services** (`apps/api/src/services/events.service.ts`)
  - `createEvent({ title, location, date })` → Prisma create → return `{ id, title, location, date }`
  - `patchEvent(eventId, partial)` → Prisma update (404 if missing) → return updated fields
  - `deleteEvent(eventId)` → Prisma delete (or soft-delete) → controller sends 204
- **Errors**
  - `403` when non-admin
  - `422` for Zod validation failures
  - `404` when event not found
  - All formatted by global error handler

**DoD ✅**
- Admin can:
  - **Create** event → `201` with `{ id, title, location, date }`
  - **Update** event core fields → `200` with updated fields
  - **Delete** event → `204` no content
- Non-admin write attempts return **403**.
- Invalid payloads return **422** with field errors.
- Basic Postman tests run for happy & error paths.

### **Day 6 — Authentication (Auth.js + Google + Prisma)**
**Goal**
- Implement user login/logout using Auth.js (NextAuth).
- Store user records in Postgres via Prisma.
- Expose session info to frontend and backend.

**Tasks**
- **Setup Auth.js**
  - Install `next-auth`, `@auth/prisma-adapter`.
  - Add `/app/api/auth/[...nextauth]/route.ts`.
  - Configure `GoogleProvider` with client ID/secret (from Google Cloud Console).
  - Configure `PrismaAdapter` for session/user persistence.
- **Prisma Setup**
  - Update `User` model in schema if needed:
    ```prisma
    model User {
      id        String   @id @default(cuid())
      name      String?
      email     String?  @unique
      image     String?
      role      Role     @default(GUEST)
      createdAt DateTime @default(now())
      updatedAt DateTime @updatedAt
    }
    ```
  - Run `npx prisma migrate dev -n add_auth`.
- **Frontend**
  - Add login/logout buttons using `signIn('google')` / `signOut()`.
  - Display logged-in user’s name/avatar from `useSession()`.
- **Backend Integration**
  - Configure Auth.js to issue JWT (so Express backend can verify).
  - Add middleware in Express (`authSession`) that decodes and validates JWT.
  - For now: just log `req.user` in one protected route to confirm auth flow.
- **Testing**
  - Log in with Google → check user row created in DB.
  - Refresh page → session persists.
  - Call a protected backend route with JWT attached → backend sees `req.user`.

**DoD ✅**
- User can log in with Google.
- User is persisted in Postgres (`User` table).
- Session info available in frontend via `useSession()`.
- Express backend can verify session/JWT and identify the user.
- Logout works and clears session.

### **Day 7 — Members CRUD (Public read, Admin write)**

**Goal**
- Expose members publicly.
- Allow admins to create/update/delete members.
- Validate inputs with Zod and guard writes with admin middleware.

**Endpoints**
- `GET /api/members` — **public** list (role=MEMBER)
- `GET /api/members/:memberId` — **public** detail
- `POST /api/members` — **admin** create
- `PATCH /api/members/:memberId` — **admin** update
- `DELETE /api/members/:memberId` — **admin** delete

**Zod Schemas** (`apps/api/src/schemas/members.schemas.ts`)
- `MemberIdParams`: `{ memberId: string }`
- `CreateMemberBody`:
  - `{ name: string(1..120), avatarUrl: string.url(), description: string(1..2000) }`
- `PatchMemberBody`:
  - `{ name?: string(1..120), avatarUrl?: string.url(), description?: string(1..2000) }`
  - `refine` to ensure at least one field provided.

**Route wiring** (`apps/api/src/routes/members.routes.ts`)
- `GET /api/members` → controller.list
- `GET /api/members/:memberId` → `validateParams(MemberIdParams)` → controller.get
- `POST /api/members` → `authSession` → `requireRole('ADMIN')` → `validateBody(CreateMemberBody)` → controller.create
- `PATCH /api/members/:memberId` → `authSession` → `requireRole('ADMIN')` → `validateParams(MemberIdParams)` → `validateBody(PatchMemberBody)` → controller.patch
- `DELETE /api/members/:memberId` → `authSession` → `requireRole('ADMIN')` → `validateParams(MemberIdParams)` → controller.remove

**Controllers** (thin)
- Read `req.validated` and call services; return JSON.

**Services** (`apps/api/src/services/members.service.ts`)
- `listMembers({ search? })` → Prisma `User.findMany({ where: { role: 'MEMBER' } })` (optional search on name)
- `getMember(memberId)` → Prisma `User.findUnique` (ensure role=MEMBER)
- `createMember(data)` → Prisma `User.create({ data: { ...data, role: 'MEMBER' } })`
- `patchMember(memberId, partial)` → Prisma update (ensure role=MEMBER)
- `deleteMember(memberId)` → Prisma delete (or soft delete)

**Validation rules**
- `avatarUrl` is **required** on create (per your spec).
- `name` required; `description` required (used on profile card).
- Patch allows partial updates but must include ≥1 field.

**Auth & Middleware**
- Public GETs: no auth.
- Writes: `authSession` + `requireRole('ADMIN')`.
- Zod validation on all param/body inputs.
- Global error handler formats `422/403/404`.

**DoD ✅**
- Public can:
  - `GET /api/members` → list of members (id, name, avatarUrl, description)
  - `GET /api/members/:memberId` → detail record
- Admin can:
  - `POST` create a member (role automatically set to MEMBER)
  - `PATCH` edit name/avatarUrl/description
  - `DELETE` remove a member
- Non-admin write attempts → **403**
- Bad inputs → **422** with field errors
- Unknown member id → **404**

### **Day 8 — Join Team (Auth Required) + Admin Review + Email (SES) + Rate Limit**

**Goal**
- Logged-in users can submit a **Join Team** request.
- Show “request already sent” while status is **PENDING**.
- Admins can **list** and **approve/reject** requests.
- Send an **email notification to admins (SES)** when a request is submitted.
- Add **rate limiting** to protect POST endpoints from abuse.

---

## Endpoints

### Public (UI visible to everyone, submit requires login)
- `POST /api/join-team`  
  **Body**: `{ message?: string }` (name & email come from session)  
  **Auth**: required (redirect to login in the web app)  
  **Behavior**:
  - If no existing PENDING request → create `PENDING`
  - If existing `PENDING` → return same state (no duplicate)
  - If `REJECTED`/`APPROVED` → allow new `PENDING`
  - Send email to admins (SES)
  - Return `202 { "status": "queued" }`
  **Errors**:
  - `401` if not logged in
  - `429` if rate limit exceeded
  - `500` on email failure (request may still be stored)

### Admin
- `GET /api/join-requests?status=PENDING|APPROVED|REJECTED`  
  **Auth**: admin  
  **Returns**: list (id, userId, name, email, message, status, createdAt)

- `PATCH /api/join-requests/:id`  
  **Auth**: admin  
  **Body**: `{ action: "APPROVE" | "REJECT" }`  
  **Behavior**:
  - APPROVE → set status=APPROVED and promote user to MEMBER
  - REJECT → set status=REJECTED
  - Return updated record (or `{ ok: true }`)

---

## Frontend UX

- On Event pages (for non-members):
  - Show **Join Team** button instead of interest/availability.
  - If user not logged in → clicking opens **Sign-in**.
  - If logged in:
    - If user has a `PENDING` join request → show **“Join request already sent”** (disable button).
    - Else → clicking submits `POST /api/join-team`, then show success toast + “request sent” state.

- Admin navbar: **Requests** page
  - List PENDING requests.
  - Approve/Reject buttons (optimistic UI allowed).
  - On APPROVE → user becomes **MEMBER**.

---

## SES — Email Flow

**Setup**
1. Verify sender domain/email in AWS SES.
2. Configure IAM user with `ses:SendEmail`.
3. Add env vars:
   - `AWS_REGION=us-east-1`
   - `SES_FROM=admin@yourdomain.com`
   - `ADMIN_NOTIFY=admins@yourdomain.com`

**Service flow**
- In `JoinRequestsService.submitJoinRequest`:
  1. Create `JoinRequest(PENDING)`.
  2. Call `EmailSender.notifyAdmins()` with subject/body.
  3. Return `202 { status: "queued" }`.

---

## Rate Limiting

- Protect `POST /join-team` and `POST /contactus`.
- Example: **5 requests / 10 minutes / IP**.
- On exceed → `429 Too Many Requests`.

---

## Middleware & Wiring

- `authSession` (from Day 6): ensures user is logged in.
- `requireRole('ADMIN')` for admin endpoints.
- `rateLimitJoin` middleware on `POST /join-team`.
- `validateBody` (Zod) for `PATCH /join-requests/:id`.

---

## Services

- `submitJoinRequest(user, message?)`
  - Create or return existing `PENDING` request.
  - Notify admins via SES.
  - Return `{ status: "queued" }`.

- `listJoinRequests({ status })`
  - Filter by status; order by `createdAt DESC`.

- `reviewJoinRequest(id, action)`
  - APPROVE → set status=APPROVED; `User.role = MEMBER`
  - REJECT → set status=REJECTED

---

## Zod Schemas

- `ReviewActionSchema`:  
  ```ts
  z.object({
    action: z.enum(["APPROVE", "REJECT"])
  })

  ## Day 9 — Contact Us Endpoint

### Tasks
- [ ] Create `ContactController` with `POST /api/contactus`.
- [ ] Add `zod` schema for `{ name, email, message }`.
- [ ] Apply `validateBody` middleware (Zod).
- [ ] Implement `ContactService.submitMessage(payload)`:
  - (optional) Store in `ContactMessage` table.
  - Always send email to admins via SES.
- [ ] Add rate limiting middleware (e.g., 5 requests / 10 min per IP).
- [ ] Build frontend form with:
  - Fields: name, email, message.
  - Client-side validation for instant feedback.
  - On success → show “Thank you” screen, redirect to homepage.

### DoD (Definition of Done)
- API rejects invalid input with `422`.
- Rate limit works (returns `429` on spam).
- Valid submission triggers SES email to admins.
- Frontend shows success message & redirects.
- Errors (422/429/500) are gracefully handled on UI.

### **Day 10 — Fetch & Search Events (`GET /api/events`)**

**Goal**
- Build the public **“See All Events”** API.
- When user clicks **Events** in the navbar, fetch **all events** (no pagination needed).
- Support simple filters: `status` (upcoming/past/all) and `search` (title/location).
- Return lightweight card data and set short cache headers.

---

## Endpoints

### Public
- `GET /api/events`  
  **Query (optional):**  
  - `status`: `"upcoming" | "past" | "all"` (default: `"all"`)  
  - `search`: free-text over `title` **or** `location` (case-insensitive)

**Behavior**
- `status=upcoming` → events with `date > now`
- `status=past` → events with `date <= now`
- `status=all` → no date filter
- If `search` present → `title CONTAINS search` **OR** `location CONTAINS search` (case-insensitive)
- Return lightweight event cards: `id, title, location, date, coverUrl`
- Set cache header: `Cache-Control: public, s-maxage=60`

**Errors**
- `422` invalid query (Zod)
- `500` server error

---

## Frontend UX
- Navbar **Events** → navigate `/events` → call `GET /api/events` **without params** to show all.
- Optional UI controls:
  - Filter pills: **All | Upcoming | Past** → refetch with `status=...`
  - Search input → on submit, refetch with `search=...`
- Render a **responsive grid** of event cards using returned fields.

---

## Middleware & Wiring
- `validateQuery` (Zod) on `GET /api/events`.
- No auth required (public).
- Global error handler formats `422/500`.

**Route**
- `GET /api/events` → `validateQuery(ListEventsQuery)` → `eventsController.list`

---

## Services
- `eventsService.list({ status, search })`
  - Build Prisma `where`:
    - Date filter from `status`
    - `OR`-filter for `search` on `title`/`location` (mode: `insensitive`)
  - `select`: `{ id, title, location, date, coverUrl }`
  - Return array

---

## Zod Schemas
```ts
// apps/api/src/schemas/events.schemas.ts
import { z } from "zod";

export const ListEventsQuery = z.object({
  status: z.enum(["upcoming", "past", "all"]).optional().default("all"),
  search: z.string().trim().max(120).optional()
});
export type ListEventsQueryInput = z.infer<typeof ListEventsQuery>;

// dod
- Clicking **Events** in the navbar loads `/events` and fetches all events (no query params).
- `GET /api/events` endpoint is implemented with:
  - `status` filter (`all`, `upcoming`, `past`)
  - `search` filter (title/location, case-insensitive)
- Returns only **card fields**: `id`, `title`, `location`, `date`, `coverUrl`.
- Zod validates query params:
  - Invalid inputs → `422 Unprocessable Entity`
- Successful request → `200 OK` with `items[]`.
- Cache headers set: `Cache-Control: public, s-maxage=60`.
- Postman tests verify:
  - No params → all events
  - `status=upcoming`, `status=past`
  - `search=<keyword>`

  ### **Day 11 — Media Uploads via S3 (Admin-only)**

**Goal**
- Allow admins to upload images/videos for an event.
- Store files in **Amazon S3** (cheap, scalable file storage).
- Protect endpoints with **admin middleware**.
- Support CRUD: upload, register, delete.

---

## Teaching — S3 Basics

- **Amazon S3** = Simple Storage Service. Think of it as a cloud hard drive.
- Files go into **buckets** (like folders).
- Each file (object) has a **key** (its path/name).
- Public can’t upload directly → instead we use **pre-signed URLs**:
  1. Admin requests a pre-signed URL from backend.
  2. Backend calls AWS S3 SDK → generates a short-lived URL (e.g., valid 1 minute).
  3. Admin’s browser uses that URL to upload directly to S3.
  4. Once uploaded, admin calls backend again to **register metadata** (title, type, etc.).

This avoids uploading files *through your server* → saves bandwidth and money.

---

## Endpoints (Admin-only)

### 1. Create Pre-signed Upload URL
http
POST /api/events/:eventId/media/presign

Body:
{ "contentType": "image/jpeg" }

 Response:
 {
  "uploadUrl": "https://s3.amazonaws.com/bucket/key?...",
  "fileKey": "events/evt_123/media/abcd.jpg"
}
	•	Backend uses AWS SDK:
s3.getSignedUrl("putObject", { Bucket, Key, ContentType, Expires })

2. Register Media
POST /api/events/:eventId/media
Body: {
  "fileKey": "events/evt_123/media/abcd.jpg",
  "type": "IMAGE",
  "title": "Backstage photo"
}
response:
{
  "id": "m_1",
  "eventId": "evt_123",
  "url": "https://cdn.mysite.com/events/evt_123/media/abcd.jpg",
  "thumbUrl": null,
  "title": "Backstage photo",
  "createdAt": "2025-09-20T15:01:00Z"
}
3. delete media
DELETE /api/media/:id
response:
{
  "ok": true
}


Middleware & Validation
	•	requireRole('ADMIN') → only admins can call these.
	•	validateBody (Zod):
    z.object({
  contentType: z.string().regex(/^image\/|^video\//),
  type: z.enum(["IMAGE", "VIDEO"]),
  title: z.string().max(120).optional()
})

DoD 
	•	Admin can:
	•	Request pre-signed URL (POST /media/presign).
	•	Upload file to S3 via that URL.
	•	Register file in DB via POST /media.
	•	Delete file via DELETE /media/:id.
	•	Non-admin calls → 403 Forbidden.
	•	Zod validation in place for body params.
	•	Postman tests cover happy path and errors.
	•	At least one uploaded file visible in event’s media[].
