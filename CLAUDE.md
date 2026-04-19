# Product Catalog Manager — CLAUDE.md

Senior fullstack technical assessment. Build a production-ready REST API with a React SPA frontend for managing a paginated, filterable product catalog. Authenticated users can create, view, update, and delete products.

Duration estimate: 3–4 hours. Senior level.

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Backend  | Python, Django, Django REST Framework |
| Database | PostgreSQL (via Django ORM only — no raw SQL) |
| Frontend | React (SPA), TypeScript preferred   |
| Auth     | JWT (SimpleJWT or equivalent)       |
| Bonus    | Docker Compose, pytest, rate limiting |

---

## Repository Layout

```
hired-expert/
├── backend/          # Django project
│   ├── config/       # settings, urls, wsgi
│   ├── products/     # products app (models, views, serializers, services)
│   ├── users/        # auth app (login endpoint)
│   ├── requirements.txt
│   └── manage.py
├── frontend/         # React SPA
│   ├── src/
│   │   ├── api/      # Axios instance + endpoint calls
│   │   ├── components/
│   │   ├── pages/    # Login, ProductList, ProductForm
│   │   └── store/    # State management (Context, Zustand, or Redux Toolkit)
│   └── package.json
├── docker-compose.yml  # bonus
└── README.md
```

---

## Data Model — Product

| Field       | Type          | Notes                        |
|-------------|---------------|------------------------------|
| id          | UUID          | Primary key, auto-generated  |
| name        | string        | Required                     |
| description | text          | Optional                     |
| price       | decimal       | Required, positive           |
| category    | string        | Required, used for filtering |
| stock       | integer       | Required, non-negative       |
| created_at  | datetime      | Auto                         |
| updated_at  | datetime      | Auto                         |
| is_active   | boolean       | Default true; soft-delete flag |

---

## Backend Specs

### Authentication
- `POST /api/auth/login/` — returns `access` and `refresh` JWT tokens.
- All `/api/products/` endpoints require `Authorization: Bearer <token>`.
- Use `djangorestframework-simplejwt`. No session auth on API routes.

### Product Endpoints

| Method | URL                    | Description              |
|--------|------------------------|--------------------------|
| GET    | `/api/products/`       | List (paginated, filtered) |
| POST   | `/api/products/`       | Create                   |
| GET    | `/api/products/{id}/`  | Retrieve                 |
| PUT    | `/api/products/{id}/`  | Full update              |
| PATCH  | `/api/products/{id}/`  | Partial update           |
| DELETE | `/api/products/{id}/`  | Soft-delete (set `is_active=false`) |

### Query Parameters (list endpoint)
- `?page=1` — page number
- `?limit=10` — page size
- `?category=electronics` — filter by category (case-insensitive)
- `?is_active=true|false` — filter by active status

### Consistent Response Shape

All responses (success and error) must follow this envelope:

```json
// success list
{
  "success": true,
  "data": { "results": [...], "count": 42, "page": 1, "total_pages": 5 },
  "error": null
}

// success single
{
  "success": true,
  "data": { ...product },
  "error": null
}

// error
{
  "success": false,
  "data": null,
  "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { "field": ["msg"] } }
}
```

Use a custom DRF exception handler to enforce this shape globally — never let Django's default HTML error pages or raw exceptions leak through.

### Logging
- Attach a `correlation_id` (UUID) to every request via middleware.
- Log structured JSON: `{ "correlation_id": "...", "method": "GET", "path": "...", "status": 200, "duration_ms": 45 }`.
- Use Python's `logging` module; configure in Django settings.

### Validation
- Use DRF serializers for all input validation.
- Return structured 400 errors (see response shape above) — never raise unhandled exceptions.

### Architecture — Backend
- Keep business logic in a `services.py` layer per app; views/serializers must stay thin.
- No raw SQL — use the Django ORM exclusively.
- Use Django migrations for all schema changes.
- Store secrets in environment variables; never hardcode them.

---

## Frontend Specs

### Pages / Views
1. **Login page** — form with email/password, client-side validation, error display from API.
2. **Product list page** — paginated table/grid, filter controls (category, is_active), loading/error/empty states.
3. **Product form** — create and edit, client-side validation, API error display per field.

### Auth & Token Handling
- Store JWT in `httpOnly` cookie or `localStorage` with XSS awareness (document tradeoffs in README).
- Attach `Authorization: Bearer <token>` to all API requests via an Axios interceptor.
- On 401 response, clear token and redirect to login.

### State Management
- Loading, error, and empty states must be explicitly handled — no silent failures.
- Pick one approach (React Query, Zustand + Axios, or Redux Toolkit) and be consistent.

### API Layer
- Centralize all API calls in `src/api/`.
- Use a single Axios instance with base URL from env var (`VITE_API_URL` or `REACT_APP_API_URL`).

---

## Evaluation Criteria (priority order)

1. **Architecture & separation of concerns** — High weight. Backend: model / serializer / service / view layers. Frontend: pages / components / api / state.
2. **API design** — High weight. Consistent response shape, correct HTTP status codes, proper error structure.
3. **Auth implementation** — High weight. JWT protected routes, no obvious security holes, token lifecycle handled.
4. **Code quality** — Medium weight. Readable, well-named, no dead code.
5. **Error & edge-case handling** — Medium weight. Invalid input, missing records, DB errors all return structured responses.
6. **Frontend UX** — Medium weight. Loading spinners, empty states, field-level errors visible.

---

## Bonus (implement if time allows)

- [ ] Unit tests for at least 2 `services.py` functions (use `pytest-django`).
- [ ] `docker-compose.yml` running backend + frontend + postgres together.
- [ ] Rate limiting on product endpoints (e.g., `django-ratelimit` or DRF throttling).
- [ ] Soft delete already specified above — implement `DELETE` as `is_active=false`, not a hard DB delete.

---

## Deliverables

- This GitHub repo with a clear `README.md`:
  - How to run locally (backend, frontend, with/without Docker).
  - Required environment variables.
  - Architecture note: main design decisions and trade-offs.
- Postman collection (or Bruno / HTTP file) covering all API endpoints.

---

## Environment Variables

### Backend (`.env`)
```
SECRET_KEY=
DEBUG=True
DATABASE_URL=postgres://user:pass@localhost:5432/hired_expert
ALLOWED_HOSTS=localhost,127.0.0.1
ACCESS_TOKEN_LIFETIME_MINUTES=60
REFRESH_TOKEN_LIFETIME_DAYS=7
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:8000
```

---

## Non-Negotiables

- No raw SQL — ORM only.
- All product endpoints require authentication.
- Every response (success or error) uses the envelope shape above.
- No unhandled exceptions reaching the client.
- No secrets committed to the repo.
