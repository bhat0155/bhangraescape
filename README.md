# Bhangraescape

Full-stack team management platform for a Bhangra performance team — browse events, request to join, manage availability, and coordinate media and playlists. Built for team admins and members.

[![CI](https://github.com/bhat0155/bhangraescape/actions/workflows/ci.yml/badge.svg)](https://github.com/bhat0155/bhangraescape/actions/workflows/ci.yml)

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the app](#running-the-app)
- [Testing](#testing)
- [API reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- Browse events, view details, and mark interest (public listing, authenticated interest/availability actions)
- Submit and review team join requests, with admin approve/reject workflow
- Member directory with admin-managed roles (`GUEST`, `MEMBER`, `ADMIN`)
- Per-event playlists and a "final mix" selection, managed by admins
- Event media uploads to S3 via presigned URLs, with admin-managed media records
- Contact form submission with rate limiting
- Google OAuth sign-in (NextAuth/Auth.js), with the API validating the resulting session token as a bearer token

## Tech stack

- [Next.js](https://nextjs.org) (App Router) — web client, in `apps/web/bhangraescape`
- [Express](https://expressjs.com) — REST API, in `apps/api`
- [PostgreSQL](https://www.postgresql.org) with [Prisma](https://www.prisma.io) — database and ORM (used independently by both apps)
- [NextAuth (Auth.js) v5](https://authjs.dev) — authentication, Google OAuth provider
- [Tailwind CSS](https://tailwindcss.com) — styling
- AWS S3 / SES — media storage and outbound email

The web app also exposes its own `/api/*` route handlers that act as a server-side proxy to the Express API (see `API_INTERNAL_BASE_URL` in [Configuration](#configuration)), rather than the browser calling the Express API directly for most actions.

## Prerequisites

- Node.js 20.x and npm (matches the version used in CI; see [`.github/workflows/ci.yml`](.github/workflows/ci.yml))
- A PostgreSQL database (local or hosted), reachable from both apps
- A Google OAuth client ID/secret for sign-in
- AWS credentials with access to an S3 bucket and SES, if you need media uploads or outbound email

## Installation

This repository has no root `package.json`; the API and web app are installed and run independently.

1. Clone the repository:
   ```bash
   git clone https://github.com/bhat0155/bhangraescape.git
   cd Bhangraescape
   ```
2. Install the API:
   ```bash
   cd apps/api
   npm install
   ```
3. Install the web app:
   ```bash
   cd ../web/bhangraescape
   npm install
   ```

## Configuration

Each app reads its own `.env` file. Create `apps/api/.env` and `apps/web/bhangraescape/.env.local`, and populate them as described below. Neither file is committed to the repository.

### API (`apps/api/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | Port the API listens on (default `4000`) |
| `NEXTAUTH_SECRET` | Yes | Shared secret used to verify the session token issued by the web app |
| `AUTH_SESSION_COOKIE` | No | Overrides the session cookie name used when decoding the auth token |
| `NEXT_DEV_ORIGIN` | No | Frontend origin allowed by CORS in development (default `http://localhost:3000`) |
| `AWS_ACCESS_KEY_ID` | Yes, for uploads | AWS access key for S3 |
| `AWS_SECRET_ACCESS_KEY` | Yes, for uploads | AWS secret key for S3 |
| `AWS_REGION` | Yes, for uploads | AWS region for S3/SES |
| `S3_BUCKET_NAME` | Yes, for uploads | S3 bucket used for event/member media |
| `SES_FROM` | Yes, for email | Verified SES sender address |
| `ADMIN_NOTIFY` | No | Email address notified of admin events (e.g. new join requests) |

### Web app (`apps/web/bhangraescape/.env.local`)

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string (used by the Prisma adapter for NextAuth) |
| `API_INTERNAL_BASE_URL` | Yes | Base URL the web app's server-side route handlers use to call the Express API |
| `NEXT_PUBLIC_API_BASE_URL` | No | Fallback/public base URL for the API, exposed to the client |
| `NEXT_PUBLIC_SITE_URL` | No | Public site URL |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | Yes | Secret used to sign/encrypt session tokens |
| `NEXTAUTH_URL` / `AUTH_URL` | Yes | Canonical URL of the web app, required by Auth.js |
| `AUTH_TRUST_HOST` | No | Set to `true` when running behind a proxy (e.g. Vercel) |
| `NEXTAUTH_COOKIE_DOMAIN` | No | Cookie domain for the session cookie |

## Running the app

Start each service in its own terminal.

API (from `apps/api`):
```bash
npm run dev
```

Web app (from `apps/web/bhangraescape`):
```bash
npm run dev
```

The web app runs at `http://localhost:3000` and the API at `http://localhost:4000` by default.

### Database setup

Run migrations and seed data from `apps/api`:
```bash
npx prisma migrate deploy
npm run seed
```

## Testing

API (from `apps/api`):
```bash
npm test
```

This runs Jest and also matches the checks CI runs (`npx tsc --noEmit` and `npm test`; see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

The web app has no test script; CI runs `npm run lint` and `npm run build` for it instead.

## API reference

All routes below are relative to the API's base URL (`http://localhost:4000` in development) and, except `/health`, are prefixed with `/api`. "Auth" indicates the required role, where `session` means any signed-in user and `—` means no authentication is required.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | — | Health check; verifies database connectivity |
| `GET` | `/events` | — | List events |
| `POST` | `/events` | ADMIN | Create an event |
| `GET` | `/events/:eventId` | session | Get event detail |
| `PATCH` | `/events/:eventId` | ADMIN | Update an event |
| `DELETE` | `/events/:eventId` | ADMIN | Delete an event |
| `POST` | `/events/:eventId/interest` | MEMBER, ADMIN | Toggle interest in an event |
| `GET` | `/events/:eventId/availability` | session | Get availability for an event |
| `POST` | `/events/:eventId/availability` | MEMBER, ADMIN | Set availability for an event |
| `PUT` | `/events/:eventId/performers` | ADMIN | Replace the performer list for an event |
| `GET` | `/events/:eventId/playlist` | — | List playlist items for an event |
| `POST` | `/events/:eventId/playlist` | ADMIN | Add a playlist item |
| `PATCH` | `/playlist/:playlistId` | ADMIN | Update a playlist item |
| `DELETE` | `/playlist/:playlistId` | ADMIN | Delete a playlist item |
| `GET` | `/events/:eventId/final-mix` | — | Get the final mix for an event |
| `PUT` | `/events/:eventId/final-mix` | ADMIN | Set the final mix for an event |
| `DELETE` | `/events/:eventId/final-mix` | ADMIN | Clear the final mix for an event |
| `GET` | `/members` | — | List members |
| `GET` | `/members/:memberId` | — | Get a member by ID |
| `POST` | `/members` | ADMIN | Create a member |
| `PATCH` | `/members/:memberId` | ADMIN | Update a member |
| `DELETE` | `/members/:memberId` | ADMIN | Delete a member |
| `PATCH` | `/members/:id/role` | ADMIN | Update a member's role |
| `POST` | `/join-team` | session | Submit a join request |
| `GET` | `/join-requests` | ADMIN | List join requests |
| `POST` | `/join-requests/:id` | ADMIN | Approve or reject a join request |
| `POST` | `/contactus` | — (rate-limited) | Submit the contact form |
| `POST` | `/uploads/presign` | session | Get a presigned URL for a member avatar upload |
| `POST` | `/uploads/:eventId/media/presign` | ADMIN | Get a presigned URL for event media upload |
| `POST` | `/uploads/:eventId/media` | ADMIN | Register uploaded media for an event |
| `GET` | `/uploads/:eventId/media` | — | List media for an event |
| `PATCH` | `/uploads/media/:mediaId` | ADMIN | Update a media record |
| `DELETE` | `/uploads/media/:mediaId` | ADMIN | Delete a media record |
| `GET` | `/admin/eligible-performers` | ADMIN | List members eligible to perform |
| `GET` | `/auth/debug` | session | Return the decoded session payload (debugging) |

## Contributing

There are no formal contribution guidelines in this repository yet. If you open a pull request:

- Target the `main` branch.
- Ensure the CI checks pass: `npx tsc --noEmit` and `npm test` in `apps/api`, and `npm run lint` and `npm run build` in `apps/web/bhangraescape` (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## License

Personal project; no open-source license is granted. All rights reserved.

## Contact

ekamsingh643@gmail.com
