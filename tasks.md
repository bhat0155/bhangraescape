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