# Vercel Deployment

This repo is a monorepo with two apps:

- `backend` (Express API)
- `frontend` (Vite + React)

Deploy them as two separate Vercel projects.

## Backend (Express API)

1. Create a new Vercel project and point it to `backend/`.
2. Framework can stay as "Other" (the repo includes `backend/vercel.json`).
3. Root directory: `backend`
4. Environment variables:
   - `MONGODB_URI` = your MongoDB connection string
   - `CORS_ORIGIN` = comma-separated list of frontend domains
5. Deploy.

After deploy, note the backend URL:

```
https://your-backend.vercel.app
```

## Frontend (Vite + React)

1. Create another Vercel project and point it to `frontend/`.
2. Framework preset: Vite.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Root directory: `frontend`
6. Environment variables:
   - `VITE_API_BASE_URL` = `https://your-backend.vercel.app/api`
7. Deploy.

## Local Development

Backend:

```bash
cd backend
npm install
MONGODB_URI="your-connection-string" npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```
