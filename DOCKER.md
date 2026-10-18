# Docker setup — Hospital Management System

## Services

| Service   | Description                          | Host port |
|-----------|--------------------------------------|-----------|
| `db`      | PostgreSQL 16                        | 5432      |
| `migrate` | One-shot EF Core migrations          | —         |
| `backend` | ASP.NET Core API (.NET 10)           | 5000      |
| `frontend`| React (Vite) via nginx               | **8080**  |

Frontend: **http://localhost:8080**  
API (direct): http://localhost:5000  
Postgres: localhost:5432

## Quick start

```bash
# 1. Environment
cp .env.docker.example .env.docker

# 2. Edit secrets (REQUIRED)
#    - JWT_SECRET  → at least 32 characters (openssl rand -base64 48)
#    - GEMINI_API_KEY → from Google AI Studio (app fails to start without it)
#    - DB_PASSWORD

# 3. Build & run
docker compose --env-file .env.docker up --build -d

# 4. Watch logs
docker compose --env-file .env.docker logs -f
```

Migrations are applied automatically by the `migrate` service before the API starts.

## Re-run migrations only

```bash
docker compose --env-file .env.docker run --rm migrate
```

## Stop & clean

```bash
docker compose --env-file .env.docker down
# Remove DB volume too:
docker compose --env-file .env.docker down -v
```

## Architecture notes

- Frontend nginx proxies `/Hospital/` and `/uploads/` to the backend container (`backend:8080`).
- Leave `VITE_API_BASE_URL` empty so the browser uses same-origin requests (recommended).
- CORS is set to `http://localhost:8080` by default.
- JWT is expected in a cookie named `jwt` (see Program.cs).
