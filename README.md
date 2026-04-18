# Product Catalog Manager

Full-stack app for managing a product catalog. JWT-authenticated REST API (Django + DRF) with a React SPA frontend.

---

## Running with Docker

```bash
# 1. Copy the backend env file
cp backend/.env.example backend/.env

# 2. Build and start all services
docker compose up --build
```

| Service     | URL                          |
|-------------|------------------------------|
| Frontend    | http://localhost:5173        |
| Backend API | http://localhost:8000        |
| Swagger UI  | http://localhost:8000/api/docs/ |

---

## Initial Data

After the containers are up, seed the database with a demo user and sample products:

```bash
docker compose exec backend python manage.py create_initial_data
```

This creates:
- **User:** `admin` / `admin123`
- **Products:** 5 sample items across electronics, lighting, and accessories categories

The command is idempotent — safe to run more than once.

---

## API Docs (Swagger)

Interactive API documentation is available at **http://localhost:8000/api/docs/**

Authorize using the JWT token obtained from `POST /api/auth/login/` — click the **Authorize** button and enter `Bearer <access_token>`.
