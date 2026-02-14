"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const menuRoutes_1 = __importDefault(require("./routes/menuRoutes"));
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || corsOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
app.use('/api/menu', menuRoutes_1.default);
app.use('/api/orders', orderRoutes_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'FoodHub API is running',
        timestamp: new Date().toISOString(),
    });
});
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
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
    });
});
app.use((err, req, res, next) => {
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
exports.default = app;
//# sourceMappingURL=server.js.map