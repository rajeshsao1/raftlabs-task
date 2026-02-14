import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';
import { getCategories } from './controllers/menuController';

const app: Application = express();
const PORT = process.env.PORT || 3001;

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!corsOrigins) {
      callback(null, true);
      return;
    }

    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.get('/api/menu/categories', getCategories);
app.get('/menu/categories', getCategories);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/menu', menuRoutes);
app.use('/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'FoodHub API is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'FoodHub API is running',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to FoodHub API',
    version: '1.0.0',
    endpoints: {
      menu: {
        'GET /api/menu': 'Get all menu items',
        'GET /api/menu/categories': 'Get all categories',
        'GET /api/menu/:id': 'Get menu item by ID',
      },
      orders: {
        'GET /api/orders': 'Get all orders',
        'GET /api/orders/:id': 'Get order by ID',
        'POST /api/orders': 'Create new order',
        'PUT /api/orders/:id/status': 'Update order status',
        'GET /api/orders/:id/status-updates': 'Get order status updates',
        'DELETE /api/orders/:id': 'Delete order',
      },
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`
  FoodHub API Server is running!

  Local:    http://localhost:${PORT}
  Health:   http://localhost:${PORT}/api/health
  API Docs: http://localhost:${PORT}/

  Ready to accept requests...
  `);
  });
}

export default app;
