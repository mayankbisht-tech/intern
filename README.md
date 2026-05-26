# AcademiaLink

College discovery and comparison platform.

**Stack:** Next.js | Express | Prisma + SQLite | JWT

**Setup:**
```bash
npm install && npm run prisma:generate && npm run prisma:seed && npm run dev
```

**URLs:** Frontend: http://localhost:3000 | Backend: http://localhost:8787/api

**Admin:** `admin@academialink.com` / `AdminPassword123`

Student-protected endpoints:

```text
GET    /auth/me
GET    /user/saved
POST   /user/saved
DELETE /user/saved/:collegeId
GET    /user/comparisons
POST   /user/comparisons
POST   /colleges/:id/reviews
```

Admin-protected endpoints:

```text
GET    /admin/colleges
POST   /admin/colleges
PUT    /admin/colleges/:id
DELETE /admin/colleges/:id
```

## Quality Notes

- Request validation lives in `backend/src/validation.ts`.
- API errors use one shape from `backend/src/errors.ts`.
- Route protection is enforced by the backend and mirrored in `frontend/middleware.ts`.
- Local generated artifacts, logs, environment files, and database files are ignored by `.gitignore`.
