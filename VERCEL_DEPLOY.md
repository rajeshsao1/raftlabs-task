# Deploy FoodHub on Vercel (Frontend + Backend)

This repository is configured to deploy both apps in one Vercel project:

- Frontend: static build from `frontend/`
- Backend: serverless Express function from `backend/src/server.ts`

## What is already configured

- `vercel.json` routes `/api/*` to backend and all other routes to frontend app.
- Backend server startup is disabled on Vercel (`process.env.VERCEL === '1'`).
- Frontend API default is `/api` in production.

## Deploy Steps (Vercel Dashboard)

1. Push this repo to GitHub.
2. In Vercel, click **Add New Project** and import the repo.
3. Keep project root as repository root (do not set to `frontend` or `backend`).
4. Build settings can remain default because `vercel.json` controls builds/routes.
5. Add environment variable (optional, for strict CORS):
   - `CORS_ORIGIN=https://your-vercel-domain.vercel.app`
   - For multiple domains, use comma-separated values.
6. Click **Deploy**.

## Verify after deployment

- Frontend: `https://your-domain.vercel.app`
- Backend health: `https://your-domain.vercel.app/api/health`
- Menu endpoint: `https://your-domain.vercel.app/api/menu`

## Local development

- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:3001`
- Frontend automatically uses local backend URL in dev mode.
