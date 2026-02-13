import { Router } from 'express';
import {
  getAllOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  getStatusUpdates,
  deleteOrder
} from '../controllers/orderController';

const router = Router();

// GET /api/orders - Get all orders
router.get('/', getAllOrders);

// GET /api/orders/:id - Get order by ID
router.get('/:id', getOrder);

// POST /api/orders - Create new order
router.post('/', createOrder);

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', updateOrderStatus);

// GET /api/orders/:id/status-updates - Get status updates for an order
router.get('/:id/status-updates', getStatusUpdates);

// DELETE /api/orders/:id - Delete an order (for testing/admin)
router.delete('/:id', deleteOrder);

export default router;
