import { Request, Response } from 'express';
import { orderStore } from '../store/orderStore';
import { ApiResponse, Order, CreateOrderRequest, UpdateOrderStatusRequest, StatusUpdate, CartItem } from '../types';

// Validation helper
function validateDeliveryDetails(details: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!details?.name?.trim()) {
    errors.push('Name is required');
  }
  if (!details?.address?.trim()) {
    errors.push('Address is required');
  }
  if (!details?.phone?.trim()) {
    errors.push('Phone number is required');
  } else {
    const phoneDigits = details.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      errors.push('Phone number must be exactly 10 digits');
    }
  }
  // Email is intentionally not collected in this assessment flow

  return { valid: errors.length === 0, errors };
}

function validateCartItems(items: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one item');
    return { valid: false, errors };
  }

  items.forEach((item, index) => {
    if (!item.id || !item.name || !item.price) {
      errors.push(`Item at index ${index} is missing required fields`);
    }
    if (!item.quantity || item.quantity < 1) {
      errors.push(`Item at index ${index} has invalid quantity`);
    }
  });

  return { valid: errors.length === 0, errors };
}

// GET /api/orders - Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  const orders = await orderStore.getAllOrders();

  const response: ApiResponse<Order[]> = {
    success: true,
    data: orders
  };

  res.json(response);
};

// GET /api/orders/:id - Get order by ID
export const getOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await orderStore.getOrder(id);

  if (!order) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Order not found'
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Order> = {
    success: true,
    data: order
  };

  res.json(response);
};

// POST /api/orders - Create new order
export const createOrder = async (req: Request, res: Response) => {
  const { items, deliveryDetails } = req.body as CreateOrderRequest;

  // Validate cart items
  const itemsValidation = validateCartItems(items);
  if (!itemsValidation.valid) {
    const response: ApiResponse<null> = {
      success: false,
      error: itemsValidation.errors.join(', ')
    };
    return res.status(400).json(response);
  }

  // Validate delivery details
  const deliveryValidation = validateDeliveryDetails(deliveryDetails);
  if (!deliveryValidation.valid) {
    const response: ApiResponse<null> = {
      success: false,
      error: deliveryValidation.errors.join(', ')
    };
    return res.status(400).json(response);
  }

  // Calculate total
  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Create order
  const order = await orderStore.createOrder({
    items,
    total,
    deliveryDetails,
    estimatedDelivery: '30-45 min'
  });

  const response: ApiResponse<Order> = {
    success: true,
    data: order,
    message: 'Order placed successfully'
  };

  res.status(201).json(response);
};

// PUT /api/orders/:id/status - Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as UpdateOrderStatusRequest;

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
  if (!status || !validStatuses.includes(status)) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
    };
    return res.status(400).json(response);
  }

  // Update status
  const updatedOrder = await orderStore.updateOrderStatus(id, status);

  if (!updatedOrder) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Order not found or invalid status transition'
    };
    return res.status(400).json(response);
  }

  const response: ApiResponse<Order> = {
    success: true,
    data: updatedOrder,
    message: 'Order status updated'
  };

  res.json(response);
};

// GET /api/orders/:id/status-updates - Get status updates for an order
export const getStatusUpdates = async (req: Request, res: Response) => {
  const { id } = req.params;
  const order = await orderStore.getOrder(id);

  if (!order) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Order not found'
    };
    return res.status(404).json(response);
  }

  const updates = await orderStore.getStatusUpdates(id);

  const response: ApiResponse<StatusUpdate[]> = {
    success: true,
    data: updates
  };

  res.json(response);
};

// DELETE /api/orders/:id - Delete an order (for testing/admin)
export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await orderStore.deleteOrder(id);

  if (!deleted) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Order not found'
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<null> = {
    success: true,
    message: 'Order deleted successfully'
  };

  res.json(response);
};
