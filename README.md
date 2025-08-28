# Node + Express + MySQL (Sequelize) Starter

A teaching-friendly backend with JWT auth and Task CRUD.

## Quick start
1) Install deps:
   ```bash
   npm i
   ```
2) Copy `.env.example` to `.env` and set your values.
3) Start MySQL and create the database from `.env` (default: `my_app_db`).
4) Run:
   ```bash
   npm run dev
   ```
5) Health check: http://localhost:5000/api/health

## API
- POST   /api/auth/register
- POST   /api/auth/login
- GET    /api/auth/me               (auth)
- POST   /api/tasks                 (auth)
- GET    /api/tasks                 (auth)
- PATCH  /api/tasks/:id             (auth)
- DELETE /api/tasks/:id             (auth)

## Notes
- In development, `sequelize.sync({ alter: true })` auto-syncs models.
  Prefer migrations for production.
