import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import menuRoutes from './routes/menuRoutes';
import orderRoutes from './routes/orderRoutes';

const app: Application = express();
const PORT = process.env.PORT || 3001;

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'];

app.use(cors({
  origin: (origin, callback) => {
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

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'FoodHub API is running',
    timestamp: new Date().toISOString(),
  });
});

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

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`\n  FoodHub API Server is running!\n\n  Local:    http://localhost:${PORT}\n  Health:   http://localhost:${PORT}/api/health\n  API Docs: http://localhost:${PORT}/\n\n  Ready to accept requests...\n  `);
});

export default app;
