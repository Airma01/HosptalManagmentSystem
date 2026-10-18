# Hospital Management System

Full-stack hospital management platform with role-based access for doctors, nurses, pharmacy, laboratory, radiology, cashiers, reception, central store, and administration.

| Layer | Technology |
|--------|------------|
| **Backend** | ASP.NET Core (.NET 10), Entity Framework Core, JWT (cookie), PostgreSQL |
| **Frontend** | React 19, Vite, Tailwind CSS, Axios |
| **Database** | PostgreSQL 16 |
| **AI** | Google Gemini (clinical assistant) |

---

## Features

- Multi-role authentication (SuperAdmin, Doctor, Nurse, Pharmacist, Lab, Radiology, Cashier, Receptionist, CSM, etc.)
- Patient registration, triage, appointments, consultations
- Adult / child / maternal health care modules
- Laboratory & radiology workflows with payment status
- Pharmacy (central store + branch pharmacies, inventory, transfers)
- Billing & multi-cashier payment flows
- Security monitoring, audit logs, rate limiting
- Clinical AI assistant (Gemini)

---

## Project structure

```
HosptalManagmentSystem/
├── HospitalSys/          # ASP.NET Core API
│   ├── Controllers/
│   ├── Models/
│   ├── Migrations/       # EF Core migrations
│   ├── Services/
│   ├── Dockerfile
│   └── Program.cs
├── frontend/             # React (Vite) SPA
│   ├── src/
│   ├── Dockerfile
│   └── nginx.conf
├── nginx/                # Optional reverse-proxy config
├── docker-compose.yml
├── .env.docker.example
└── DOCKER.md
```

---

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (recommended)
- Or locally: .NET 10 SDK, Node.js 20+, PostgreSQL 16

---

## Quick start with Docker (recommended)

### 1. Clone and enter the repo

```bash
git clone https://github.com/Airma01/HosptalManagmentSystem.git
cd HosptalManagmentSystem
```

### 2. Create environment file

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker` and set at least:

```env
# Use a free host port if local Postgres already uses 5432
DB_HOST_PORT=5433
DB_NAME=HospitalManagement
DB_USER=postgres
DB_PASSWORD=ChangeMe_StrongPassword_123

# REQUIRED — min 32 characters (generate with: openssl rand -base64 48)
JWT_SECRET=CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS_xxxxxxxx

# REQUIRED by the app at startup (https://aistudio.google.com/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

CORS_ORIGINS=http://localhost:8080
```

### 3. Build and run

```bash
docker compose --env-file .env.docker up --build -d
```

This will:

1. Pull **PostgreSQL 16**
2. Apply **EF Core migrations** automatically
3. Start the **API**
4. Start the **frontend** on port **8080**

### 4. Open the app

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:8080 |
| API (direct) | http://localhost:5000 |
| Postgres (host) | `localhost:5433` (or whatever you set in `DB_HOST_PORT`) |

### Useful Docker commands

```bash
# Logs
docker compose --env-file .env.docker logs -f

# Migrate only
docker compose --env-file .env.docker run --rm migrate

# Stop
docker compose --env-file .env.docker down

# Stop and delete database volume
docker compose --env-file .env.docker down -v
```

---

## Local development (without Docker)

### Database

Create a PostgreSQL database and set connection details in `HospitalSys/.env` (copy from `HospitalSys/.env.example`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=HospitalManagement
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_long_secret_at_least_32_chars
GEMINI_API_KEY=your_key
CORS_ORIGINS=http://localhost:5173
```

Apply migrations:

```bash
cd HospitalSys
dotnet ef database update
dotnet run
```

API typically listens on `http://localhost:5241` (or the port in `launchSettings.json`).

### Frontend

```bash
cd frontend
npm install
# Optional: set VITE_API_BASE_URL in frontend/.env
# e.g. VITE_API_BASE_URL=http://localhost:5241
npm run dev
```

Frontend: http://localhost:5173

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | Yes | PostgreSQL connection |
| `JWT_SECRET` | Yes | ≥ 32 characters |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `CORS_ORIGINS` | Recommended | Comma-separated origins (e.g. `http://localhost:8080`) |
| `DB_HOST_PORT` | Optional | Host port for Postgres container (default `5432`) |
| `API_HOST_PORT` | Optional | Host port for API (default `5000`) |
| `VITE_API_BASE_URL` | Optional | Leave empty in Docker so the browser uses same-origin + nginx proxy |

---

## Architecture (Docker)

```
Browser → :8080 (frontend nginx)
              ├── /              → React SPA
              ├── /Hospital/*    → proxy → backend:8080
              └── /uploads/*     → proxy → backend:8080

backend → db:5432 (Postgres)
migrate (one-shot) → applies EF migrations, then exits
```

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| `migrate` exit 1 / JWT Secret not configured | Add `JWT_SECRET` and `GEMINI_API_KEY` to the **migrate** service in `docker-compose.yml` and to `.env.docker` |
| Port 5432 already in use | Set `DB_HOST_PORT=5433` (or another free port) in `.env.docker` |
| Frontend can’t call API | Ensure `CORS_ORIGINS=http://localhost:8080` and leave `VITE_API_BASE_URL` empty when using Docker |
| Gemini error on startup | Set a non-empty `GEMINI_API_KEY` in `.env.docker` |

View migrate logs:

```bash
docker compose --env-file .env.docker logs migrate
```

---

## License

Private / project use. Update this section if you publish the repository under a specific license.
