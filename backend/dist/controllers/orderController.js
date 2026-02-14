"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.getStatusUpdates = exports.updateOrderStatus = exports.createOrder = exports.getOrder = exports.getAllOrders = void 0;
const orderStore_1 = require("../store/orderStore");
// Validation helper
function validateDeliveryDetails(details) {
    const errors = [];
    if (!details?.name?.trim()) {
        errors.push('Name is required');
    }
    if (!details?.address?.trim()) {
        errors.push('Address is required');
    }
    if (!details?.phone?.trim()) {
        errors.push('Phone number is required');
    }
    else {
        const phoneDigits = details.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            errors.push('Phone number must be exactly 10 digits');
        }
    }
    // Email is intentionally not collected in this assessment flow
    return { valid: errors.length === 0, errors };
}
function validateCartItems(items) {
    const errors = [];
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
const getAllOrders = async (req, res) => {
    const orders = await orderStore_1.orderStore.getAllOrders();
    const response = {
        success: true,
        data: orders
    };
    res.json(response);
};
exports.getAllOrders = getAllOrders;
// GET /api/orders/:id - Get order by ID
const getOrder = async (req, res) => {
    const { id } = req.params;
    const order = await orderStore_1.orderStore.getOrder(id);
    if (!order) {
        const response = {
            success: false,
            error: 'Order not found'
        };
        return res.status(404).json(response);
    }
    const response = {
        success: true,
        data: order
    };
    res.json(response);
};
exports.getOrder = getOrder;
// POST /api/orders - Create new order
const createOrder = async (req, res) => {
    const { items, deliveryDetails } = req.body;
    // Validate cart items
    const itemsValidation = validateCartItems(items);
    if (!itemsValidation.valid) {
        const response = {
            success: false,
            error: itemsValidation.errors.join(', ')
        };
        return res.status(400).json(response);
    }
    // Validate delivery details
    const deliveryValidation = validateDeliveryDetails(deliveryDetails);
    if (!deliveryValidation.valid) {
        const response = {
            success: false,
            error: deliveryValidation.errors.join(', ')
        };
        return res.status(400).json(response);
    }
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Create order
    const order = await orderStore_1.orderStore.createOrder({
        items,
        total,
        deliveryDetails,
        estimatedDelivery: '30-45 min'
    });
    const response = {
        success: true,
        data: order,
        message: 'Order placed successfully'
    };
    res.status(201).json(response);
};
exports.createOrder = createOrder;
// PUT /api/orders/:id/status - Update order status
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    if (!status || !validStatuses.includes(status)) {
        const response = {
            success: false,
            error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        };
        return res.status(400).json(response);
    }
    // Update status
    const updatedOrder = await orderStore_1.orderStore.updateOrderStatus(id, status);
    if (!updatedOrder) {
        const response = {
            success: false,
            error: 'Order not found or invalid status transition'
        };
        return res.status(400).json(response);
    }
    const response = {
        success: true,
        data: updatedOrder,
        message: 'Order status updated'
    };
    res.json(response);
};
exports.updateOrderStatus = updateOrderStatus;
// GET /api/orders/:id/status-updates - Get status updates for an order
const getStatusUpdates = async (req, res) => {
    const { id } = req.params;
    const order = await orderStore_1.orderStore.getOrder(id);
    if (!order) {
        const response = {
            success: false,
            error: 'Order not found'
        };
        return res.status(404).json(response);
    }
    const updates = await orderStore_1.orderStore.getStatusUpdates(id);
    const response = {
        success: true,
        data: updates
    };
    res.json(response);
};
exports.getStatusUpdates = getStatusUpdates;
// DELETE /api/orders/:id - Delete an order (for testing/admin)
const deleteOrder = async (req, res) => {
    const { id } = req.params;
    const deleted = await orderStore_1.orderStore.deleteOrder(id);
    if (!deleted) {
        const response = {
            success: false,
            error: 'Order not found'
        };
        return res.status(404).json(response);
    }
    const response = {
        success: true,
        message: 'Order deleted successfully'
    };
    res.json(response);
};
exports.deleteOrder = deleteOrder;
//# sourceMappingURL=orderController.js.map