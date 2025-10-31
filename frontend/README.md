# School-OS — UI Integration (ui branch)

## Status
**Progress:** Admin page and Login page implemented and wired to the backend for development testing.  
**Scope completed:** Login flow, token storage, protected admin routes, dashboard student count, Students CRUD (GET / POST / PUT / DELETE).  
**In progress / planned:** Attendance, Classes, Reports modules, token refresh / production auth hardening, RBAC.

---

## Quick start (local development)

### Backend
1. Create `.env` in the `backend/` folder with at least:
   ```
   TEST_TEACHER_TOKEN=<a valid JWT or sample token for dev>
   SECRET_KEY=<your_secret_key>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   ```
2. Install and run:
   ```bash
   cd backend
   poetry install
   poetry run uvicorn app.main:app --reload
   ```
3. API docs: `http://127.0.0.1:8000/docs`  
   v1 base: `http://127.0.0.1:8000/v1`

### Frontend — Admin page
1. Create `frontend/admin-page/.env`:
```
VITE_API_URL=http://127.0.0.1:8000/v1
```
2. Install & run:
```bash
cd frontend/admin-page
npm install
npm run dev
```
3. Open: `http://localhost:5173/admin-page/`  
   If not logged in, the app will redirect to the login page.

### Frontend — Login page
1. Create `frontend/login-page/.env`:
```
VITE_API_URL=http://127.0.0.1:8000/v1
```
2. Install & run:
```bash
cd frontend/login-page
npm install
npm run dev
```
3. Open: `http://localhost:5173/login-page/`  
   Use any credentials for local testing — the dev login endpoint returns `TEST_TEACHER_TOKEN`. On success the token is stored in `localStorage` as `auth_token` and you are redirected to the admin page.

---

## Quick verification checklist
- Backend running and docs reachable at `/docs`.
- `POST /v1/auth/login` returns `TEST_TEACHER_TOKEN`.
- Login page stores `auth_token` in localStorage and redirects to `/admin-page/`.
- Admin dashboard shows Total Students from `GET /v1/students`.
- Students panel: list, add, edit, delete work and reflect network calls.

---

## Notes & troubleshooting
- If `POST /v1/auth/login` returns 501 → set `TEST_TEACHER_TOKEN` in backend `.env`.
- If CORS errors appear → ensure backend allows origin `http://localhost:5173`.
- If endpoints or payload shapes differ from expected → update API paths in the frontend axios client (`frontend/*/src/utils/api.js`) accordingly.
- Dev auth currently issues a static test token. Replace with production auth & refresh flow before deploying.

---

## Next steps (recommended)
- Promote AuthGuard to a full AuthProvider (React context) exposing user and role info.
- Implement token refresh or httpOnly cookie sessions for production.
- Implement Attendance, Classes, Reports modules using the same API client pattern.
- Add role-based UI and server-side RBAC checks.
- Add pagination and tests for large datasets.

---

## Suggested short commit message
```
feat(ui): integrate login + admin pages with backend (students CRUD + auth)
```
