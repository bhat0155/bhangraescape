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

| Variable | Description |
| --- | --- |
| `PG_USER` | PostgreSQL user |
| `PG_HOST` | PostgreSQL host (e.g., `localhost`) |
| `PG_DATABASE` | Target database name |
| `PG_PASSWORD` | Password for the database user |
| `PG_PORT` | PostgreSQL port (default `5432`) |
| `EXPRESS_PORT` | Port for the Express server (e.g., `4000`) |
| `NEXT_PUBLIC_API_URL` | Base URL the Next.js app uses to reach the API |
| `JWT_SECRET` | Secret key for signing authentication tokens |

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
  npm run dev:server
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
