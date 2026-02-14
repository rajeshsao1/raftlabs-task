"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const router = (0, express_1.Router)();
// GET /api/orders - Get all orders
router.get('/', orderController_1.getAllOrders);
// GET /api/orders/:id - Get order by ID
router.get('/:id', orderController_1.getOrder);
// POST /api/orders - Create new order
router.post('/', orderController_1.createOrder);
// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', orderController_1.updateOrderStatus);
// GET /api/orders/:id/status-updates - Get status updates for an order
router.get('/:id/status-updates', orderController_1.getStatusUpdates);
// DELETE /api/orders/:id - Delete an order (for testing/admin)
router.delete('/:id', orderController_1.deleteOrder);
exports.default = router;
//# sourceMappingURL=orderRoutes.js.map