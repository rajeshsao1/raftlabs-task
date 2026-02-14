# FoodHub Frontend

A React + TypeScript frontend for the FoodHub food delivery application, built with Vite and Tailwind CSS.

## Features

- Browse menu items by category
- Search menu items
- Add/remove items from cart
- Checkout flow with delivery details
- Live order tracking
- Automatic fallback to local menu data when backend is unavailable

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Testing**: Vitest + Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will start at `http://localhost:5173`.

## Build and Preview

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

## API Configuration

The frontend calls the backend using:

- `VITE_API_BASE_URL`
  - Default in development: `http://localhost:3001/api`
  - Default in production: `/api` (same domain on Vercel)

Create a `.env` file in `frontend/` to override it:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## Backend Integration

- Expected backend: `http://localhost:3001`
- Health endpoint: `http://localhost:3001/api/health`
- If backend requests fail or time out, the app loads local fallback menu data from `src/data/fallbackMenu.ts`.

## Testing

No dedicated npm test script is currently defined in `package.json`.

Run tests with:

```bash
npx vitest
```

## Project Structure

```text
frontend/
|-- src/
|   |-- components/         # UI views and reusable components
|   |-- services/api.ts     # Backend API service
|   |-- store/useStore.ts   # Zustand state management
|   |-- data/               # Local fallback menu data
|   |-- tests/              # Vitest + Testing Library tests
|   |-- types/              # Shared TypeScript types
|   `-- App.tsx             # Main app shell and routing by view state
|-- index.html
|-- vite.config.ts
|-- tsconfig.json
`-- package.json
```

## Notes

- `vite-plugin-singlefile` is enabled in `vite.config.ts`, so the production build is bundled for single-file delivery.
