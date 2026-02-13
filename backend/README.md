# FoodHub Backend API

A RESTful API for the FoodHub food delivery application built with Node.js and Express.js.

## Features

- 🍕 Menu management with categories
- 📦 Order placement and tracking
- 🚚 Real-time order status simulation
- ✅ Input validation
- 🧪 Comprehensive test coverage

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Testing**: Vitest + Supertest

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Development

```bash
# Run in development mode with hot reload
npm run dev
```

The server will start at `http://localhost:3001`

### Production

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## API Endpoints

### Menu

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | Get all menu items |
| GET | `/api/menu?category=Pizza` | Filter by category |
| GET | `/api/menu?search=pizza` | Search items |
| GET | `/api/menu/categories` | Get all categories |
| GET | `/api/menu/:id` | Get single item |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/:id` | Get order by ID |
| POST | `/api/orders` | Create new order |
| PUT | `/api/orders/:id/status` | Update order status |
| GET | `/api/orders/:id/status-updates` | Get status history |
| DELETE | `/api/orders/:id` | Delete order |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

## Order Status Flow

Orders follow a sequential status progression:

1. `pending` → Order received
2. `confirmed` → Restaurant confirmed
3. `preparing` → Food being prepared
4. `out_for_delivery` → On the way
5. `delivered` → Order completed

## Request/Response Examples

### Create Order

**POST** `/api/orders`

```json
{
  "items": [
    {
      "id": "1",
      "name": "Margherita Pizza",
      "description": "Fresh tomatoes, mozzarella cheese, basil",
      "price": 14.99,
      "image": "https://example.com/pizza.jpg",
      "category": "Pizza",
      "rating": 4.8,
      "prepTime": "20-25 min",
      "quantity": 2
    }
  ],
  "deliveryDetails": {
    "name": "John Doe",
    "address": "123 Main St, City, State 12345",
    "phone": "+1 234 567 8900",
    "email": "john@example.com"
  }
}
```

**Response** (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "ORD-1701234567890-abc12345",
    "items": [...],
    "total": 29.98,
    "deliveryDetails": {...},
    "status": "pending",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "estimatedDelivery": "30-45 min"
  },
  "message": "Order placed successfully"
}
```

### Update Order Status

**PUT** `/api/orders/:id/status`

```json
{
  "status": "confirmed"
}
```

## Real-time Status Updates

The backend automatically simulates order status progression:

- Order created → `pending`
- +5 seconds → `confirmed`
- +10 seconds → `preparing`
- +15 seconds → `out_for_delivery`
- +20 seconds → `delivered`

Poll the `/api/orders/:id/status-updates` endpoint to get the update history.

## Project Structure

```
backend/
├── src/
│   ├── data/
│   │   └── menuItems.ts      # Menu data
│   ├── routes/
│   │   ├── menuRoutes.ts     # Menu endpoints
│   │   └── orderRoutes.ts    # Order endpoints
│   ├── store/
│   │   └── orderStore.ts     # In-memory order storage
│   ├── tests/
│   │   └── api.test.ts       # API tests
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── server.ts             # Express server
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3001 | Server port |
| NODE_ENV | development | Environment |

## License

MIT
