# Product Catalog Manager

Full-stack application for managing products. Authenticated users can create, view, update, and delete records. The API supports filtering and pagination; the frontend is a React SPA.

---

## Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Backend  | Python 3.11 · Django 4.2 · Django REST Framework |
| Auth     | JWT via `djangorestframework-simplejwt`         |
| Database | PostgreSQL 15                                   |
| Frontend | React 18 · TypeScript · Vite · Axios            |

---

## Architecture

```
hired-expert/
├── backend/
│   ├── config/        # Django project settings, root URLs, login view wrapper
│   ├── core/          # Cross-cutting: correlation-ID middleware, exception handler
│   └── products/      # Product domain — model, serializer, service, view, pagination
└── frontend/
    └── src/
        ├── api/        # Axios client + per-resource functions
        ├── contexts/   # AuthContext (JWT storage, logout)
        ├── components/ # PrivateRoute
        └── pages/      # LoginPage, ProductListPage, ProductFormPage
```

**Key design decisions:**

- **Service layer** (`products/services.py`): all ORM queries live here; views stay thin.
- **Response envelope**: every response (success or error) has `{ success, data, error }`. Handled by a custom DRF exception handler and paginator — no boilerplate in views.
- **Soft delete**: `DELETE /api/products/{id}/` sets `is_active=false` instead of removing the row.
- **Correlation IDs**: `CorrelationIdMiddleware` stamps every request/response with a UUID and logs structured JSON to stdout.
- **Token storage**: access token is stored in `localStorage` for simplicity. In production consider `httpOnly` cookies to reduce XSS exposure; this would require a thin token-proxy endpoint on the backend.

---

## Running Locally (without Docker)

### Prerequisites
- Python 3.11+
- Node 20+
- PostgreSQL running locally

### Backend

```bash
cd backend

# 1. Create and activate venv
python -m venv .venv && source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env: set DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, SECRET_KEY

# 4. Create the database (psql)
createdb hired_expert

# 5. Run migrations
python manage.py migrate

# 6. Create a superuser (used to log in)
python manage.py createsuperuser

# 7. Start the server
python manage.py runserver
# API available at http://localhost:8000
```

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# VITE_API_URL=http://localhost:8000 (default)

# 3. Start dev server
npm run dev
# App available at http://localhost:5173
```

---

## Running with Docker Compose

```bash
# 1. Create backend env file
cp backend/.env.example backend/.env
# DB_HOST is overridden to "db" automatically by docker-compose.yml

# 2. Build and start all services
docker compose up --build

# 3. Create a superuser (first time)
docker compose exec backend python manage.py createsuperuser
```

Services:
- Frontend → http://localhost:5173
- Backend API → http://localhost:8000
- PostgreSQL → localhost:5432

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                      | Default          | Description                   |
|-------------------------------|------------------|-------------------------------|
| `SECRET_KEY`                  | (insecure dev key) | Django secret key           |
| `DEBUG`                       | `True`           | Debug mode                    |
| `DB_NAME`                     | `hired_expert`   | Postgres database name        |
| `DB_USER`                     | `postgres`       | Postgres user                 |
| `DB_PASSWORD`                 | `postgres`       | Postgres password             |
| `DB_HOST`                     | `localhost`      | Postgres host                 |
| `DB_PORT`                     | `5432`           | Postgres port                 |
| `CORS_ALLOWED_ORIGINS`        | `http://localhost:5173,...` | Comma-separated allowed origins |
| `ACCESS_TOKEN_LIFETIME_MINUTES` | `60`           | JWT access token TTL          |
| `REFRESH_TOKEN_LIFETIME_DAYS` | `7`              | JWT refresh token TTL         |

### Frontend (`frontend/.env`)

| Variable       | Default                   | Description       |
|----------------|---------------------------|-------------------|
| `VITE_API_URL` | `http://localhost:8000`   | Backend base URL  |

---

## API Reference

All responses follow this envelope:

```json
// success
{ "success": true, "data": { ... }, "error": null }

// error
{ "success": false, "data": null, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { "field": ["msg"] } } }
```

### Auth

| Method | Endpoint             | Auth | Description        |
|--------|----------------------|------|--------------------|
| POST   | `/api/auth/login/`   | No   | Obtain JWT tokens  |
| POST   | `/api/auth/refresh/` | No   | Refresh access token |

**Login request:**
```json
{ "username": "admin", "password": "secret" }
```
**Login response data:**
```json
{ "access": "<token>", "refresh": "<token>" }
```

### Products

All endpoints require `Authorization: Bearer <access_token>`.

| Method | Endpoint                  | Description                      |
|--------|---------------------------|----------------------------------|
| GET    | `/api/products/`          | List (paginated + filtered)      |
| POST   | `/api/products/`          | Create                           |
| GET    | `/api/products/{id}/`     | Retrieve                         |
| PUT    | `/api/products/{id}/`     | Full update                      |
| PATCH  | `/api/products/{id}/`     | Partial update                   |
| DELETE | `/api/products/{id}/`     | Soft-delete (`is_active=false`)  |

**Query params for list:**

| Param       | Example          | Description                   |
|-------------|------------------|-------------------------------|
| `page`      | `?page=2`        | Page number (default: 1)      |
| `limit`     | `?limit=20`      | Page size (default: 10, max: 100) |
| `category`  | `?category=electronics` | Case-insensitive filter |
| `is_active` | `?is_active=true` | Filter by active status      |

**Product object:**
```json
{
  "id": "uuid",
  "name": "Widget Pro",
  "description": "A great widget.",
  "price": "29.99",
  "category": "electronics",
  "stock": 100,
  "created_at": "2026-04-18T10:00:00Z",
  "updated_at": "2026-04-18T10:00:00Z",
  "is_active": true
}
```

**Paginated list response data:**
```json
{
  "results": [ ... ],
  "count": 42,
  "page": 1,
  "total_pages": 5
}
```

---

## Trade-offs & Notes

- **No raw SQL** — Django ORM used exclusively.
- **Minimal middleware stack** — no sessions, no CSRF (JWT is CSRF-safe by design).
- **Single superuser model** — no custom User model; Django's built-in `auth.User` is enough for this scope.
- **localStorage vs cookies** — localStorage is used for simplicity; httpOnly cookies would require a same-origin proxy or CORS credential setup.
