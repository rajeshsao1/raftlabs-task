# FoodHub Order Management — Delivery Notes

This document summarizes the assessment requirements, my understanding, task breakdown, architecture, project structure, testing approach, and deployment plan. It is intended to support the Loom walkthrough and final submission.

## Assessment Understanding
Goal: Build a simple order management feature for a food delivery app. Users should be able to browse a menu, add items to a cart, place an order with delivery details, and track order status. The backend should provide REST APIs, store data in-memory or a simple DB, and simulate real-time status updates. Tests are required for backend APIs and key UI components, covering CRUD, validation, and status updates. The app should be hosted (Vercel/Netlify) with a Loom video walkthrough.

## Task Breakdown
1. Requirements analysis
2. Data model and API design
3. Backend implementation
4. Frontend UI implementation
5. Real-time status simulation
6. Tests (API + UI components)
7. Deployment setup (Vercel)
8. Documentation and Loom walkthrough prep

## Architecture
Split front-end and back-end:
- Frontend: React + Vite + Tailwind (UI, state, API calls)
- Backend: Node.js + Express + TypeScript (REST APIs)
- Database: MongoDB for persistence (optional in-memory fallback possible)

### Backend API
- Menu: `GET /api/menu`, `GET /api/menu/:id`, `GET /api/menu/categories`
- Orders: `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`,
  `PUT /api/orders/:id/status`, `GET /api/orders/:id/status-updates`,
  `DELETE /api/orders/:id`
- Status flow: `pending -> confirmed -> preparing -> out_for_delivery -> delivered`
- Status updates are simulated based on `createdAt` timestamps and a timed sequence.

### Frontend UI
Screens/components:
- Menu list with category filter
- Cart view (quantity adjustments and totals)
- Checkout form (name, address, phone)
- Order tracking view (status progression)

## Project Structure
```
backend/
  src/
    controllers/
    routes/
    store/
    data/
    tests/
    types/
  package.json
  tsconfig.json
  vitest.config.ts

frontend/
  src/
    components/
    services/
    store/
    tests/
    types/
    data/
  package.json
  vite.config.ts
```

## Testing
### Backend (Vitest + Supertest)
Test coverage includes:
- Menu endpoints
- Order CRUD
- Input validation (empty cart, missing delivery details, phone format)
- Status update transitions
- Status history retrieval

Run backend tests:
```
cd backend
npm test
```

### Frontend (Vitest + Testing Library)
Test coverage includes:
- Key UI components (MenuCard, Header, CategoryFilter)
- Cart totals and item count
- Status flow logic
- Validation checks for delivery details

Run frontend tests:
```
cd frontend
npm test
```

## Deployment (Vercel)
### Backend
- Deploy as a Node server
- Set environment variables:
  - `MONGODB_URI`
  - `PORT` (optional, Vercel manages)

### Frontend
- Deploy Vite build
- Set API base URL if needed (e.g., Vercel backend URL)

## Loom Walkthrough Outline (12–15 min)
1. Assessment understanding and task breakdown
2. Architecture overview and folder structure
3. Backend API walkthrough (controllers, store, validation)
4. Frontend UI walkthrough (components and flow)
5. Real-time status simulation
6. Tests (API + UI)
7. Deployment notes
8. AI usage summary (code generation, test fixes, debugging)

## AI Usage
Used AI assistance to:
- Generate and refine tests
- Debug configuration issues (Vitest setup, mocking store)
- Review API validation logic
- Document the deliverables and walkthrough steps

