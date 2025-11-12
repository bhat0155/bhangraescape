# Bhangraescape

## 🌟 Overview
**Title:** Bhangraescape
**Description:** A modern full-stack application that lets members explore events, manage teams, and collaborate through a seamless experience spanning a fast Next.js interface and a secure Express.js API backed by PostgreSQL.  
**Tech Stack:**
- Next.js (React) for the web client
- Express.js (Node.js) for the REST API
- PostgreSQL for relational data
- Tailwind CSS for utility-first styling

## 🚀 Getting Started
**Prerequisites**
- Node.js (v18+) and npm (or Yarn)
- PostgreSQL (running locally or accessible remotely)

**Installation**
```bash
git clone <repository-url>
cd Bhangraescape
npm install
```

## ⚙️ Configuration
Create a `.env` (or `.env.local`) file before running the app and populate it with the values that connect the backend, frontend, and database.
##############################
# 🔵 GOOGLE OAUTH (Frontend)
##############################

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret


##############################
# 🟣 DATABASE (Local / Cloud)
##############################

DATABASE_URL="postgresql://username:password@host:5432/database?schema=public"


##############################
# 🔐 AUTH / NEXTAUTH
##############################

NEXTAUTH_SECRET=your_nextauth_secret
AUTH_SECRET=your_auth_secret

NEXTAUTH_URL=http://localhost:3000
AUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true


##############################
# 🌐 PUBLIC SITE CONFIG
##############################

NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api


##############################
# 🟠 INTERNAL API ROUTING
##############################

API_INTERNAL_BASE_URL=http://localhost:4000/api


##############################
# 🟡 AWS (S3 / SES)
##############################

AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_bucket_name

SES_FROM=your_verified_ses_email
ADMIN_NOTIFY=your_admin_email


##############################
# 🧪 DEV ONLY
##############################

NEXT_DEV_ORIGIN=http://localhost:3000
NEXTAUTH_COOKIE_DOMAIN=localhost

## 💾 Database Setup
Ensure PostgreSQL is running and the credentials above are valid, then run:
```bash
npm run db:migrate
npm run db:seed
```
These commands synchronize the schema and populate essential seed data.

## ▶️ Running the Application
Start each service in separate terminals:

- **Backend (Express):**
  ```bash
  npm run dev
  ```
- **Frontend (Next.js):**
  ```bash
  npm run dev
  ```

Access the frontend at `http://localhost:3000` and the API at `http://localhost:4000` (or the ports configured in your `.env`).

## 📝 Key API Endpoints
| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Authenticate a member and retrieve a JWT |
| `GET` | `/api/events` | Fetch the list of upcoming events |
| `POST` | `/api/uploads/media` | Upload event-related media assets |
| `GET` | `/api/members/:id` | Retrieve a member profile by ID |

## 📄 License & Contact
- **License:** MIT License  
- **Contact:** [Your Name](https://github.com/your-handle) · your.email@example.com
