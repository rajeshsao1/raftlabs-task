# Deploy FoodHub on Vercel (Frontend + Backend)

This repository is configured to deploy both apps in one Vercel project:

- Frontend: static build from `frontend/`
- Backend: serverless Express function via `api/index.ts` and `api/[...path].ts`

## What is already configured

- `vercel.json` uses:
  - `installCommand` for both `frontend` and `backend`
  - `buildCommand` for frontend
  - `outputDirectory` as `frontend/dist`
- `/api/*` is served by Vercel Functions in the root `api/` folder.
- Backend server startup is disabled on Vercel (`process.env.VERCEL === '1'`).
- Frontend API default is `/api` in production.

## Deploy Steps (Vercel Dashboard)

1. Push this repo to GitHub.
2. In Vercel, click **Add New Project** and import the repo.
3. Keep project root as repository root (do not set to `frontend` or `backend`).
4. In Project Settings, clear any manual Build/Output overrides so `vercel.json` is used.
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
