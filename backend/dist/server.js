"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const menuRoutes_1 = __importDefault(require("./routes/menuRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const menuController_1 = require("./controllers/menuController");
const orderController_1 = require("./controllers/orderController");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
    : null;
function getHostname(value) {
    if (!value)
        return null;
    try {
        return new URL(value).hostname.toLowerCase();
    }
    catch {
        return null;
    }
}
// Middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!corsOrigins) {
            callback(null, true);
            return;
        }
        const allowedHostnames = corsOrigins.map((item) => getHostname(item)).filter(Boolean);
        const originHostname = getHostname(origin);
        const isAllowedVercelOrigin = !!originHostname && originHostname.endsWith('.vercel.app');
        const isAllowedConfiguredOrigin = (!!origin && corsOrigins.includes(origin)) ||
            (!!originHostname && allowedHostnames.includes(originHostname));
        if (!origin || isAllowedConfiguredOrigin || isAllowedVercelOrigin) {
            callback(null, true);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// API Routes
app.get('/api/menu/categories', menuController_1.getCategories);
app.get('/menu/categories', menuController_1.getCategories);
app.get('/api/orders', orderController_1.getAllOrders);
app.post('/api/orders', orderController_1.createOrder);
app.get('/api/orders/:id', orderController_1.getOrder);
app.put('/api/orders/:id/status', orderController_1.updateOrderStatus);
app.get('/api/orders/:id/status-updates', orderController_1.getStatusUpdates);
app.delete('/api/orders/:id', orderController_1.deleteOrder);
app.get('/orders', orderController_1.getAllOrders);
app.post('/orders', orderController_1.createOrder);
app.get('/orders/:id', orderController_1.getOrder);
app.put('/orders/:id/status', orderController_1.updateOrderStatus);
app.get('/orders/:id/status-updates', orderController_1.getStatusUpdates);
app.delete('/orders/:id', orderController_1.deleteOrder);
app.use('/api/menu', menuRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.use('/menu', menuRoutes_1.default);
app.use('/orders', orderRoutes_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'FoodHub API is running',
        timestamp: new Date().toISOString(),
    });
});
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'FoodHub API is running',
        timestamp: new Date().toISOString(),
    });
});
// Root endpoint
app.get('/', (req, res) => {
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
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
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
exports.default = app;
//# sourceMappingURL=server.js.map