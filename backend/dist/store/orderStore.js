"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderStore = void 0;
const uuid_1 = require("uuid");
// In-memory store for orders
class OrderStore {
    constructor() {
        this.orders = new Map();
        this.statusUpdates = new Map();
        this.statusTimers = new Map();
    }
    // Create a new order
    createOrder(orderData) {
        const id = `ORD-${Date.now()}-${(0, uuid_1.v4)().substring(0, 8)}`;
        const order = {
            ...orderData,
            id,
            status: 'pending',
            createdAt: new Date(),
        };
        this.orders.set(id, order);
        this.initializeStatusUpdates(id);
        return order;
    }
    // Get order by ID
    getOrder(id) {
        return this.orders.get(id);
    }
    // Get all orders
    getAllOrders() {
        return Array.from(this.orders.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    // Update order status
    updateOrderStatus(id, status) {
        const order = this.orders.get(id);
        if (!order)
            return undefined;
        // Validate status transition
        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
        const currentIndex = validStatuses.indexOf(order.status);
        const newIndex = validStatuses.indexOf(status);
        // Allow only sequential transitions or same status
        if (newIndex !== currentIndex + 1 && newIndex !== currentIndex) {
            return undefined;
        }
        const updatedOrder = { ...order, status };
        this.orders.set(id, updatedOrder);
        // Add status update
        this.addStatusUpdate(id, status);
        return updatedOrder;
    }
    // Initialize automatic status updates simulation
    initializeStatusUpdates(orderId) {
        const statuses = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
        const delays = [5000, 10000, 15000, 20000]; // 5s, 10s, 15s, 20s for demo
        // Add initial pending status
        this.addStatusUpdate(orderId, 'pending');
        statuses.forEach((status, index) => {
            const timer = setTimeout(() => {
                this.updateOrderStatus(orderId, status);
            }, delays[index]);
            // Store timer for potential cleanup
            const existingTimers = this.statusTimers.get(orderId) || [];
            this.statusTimers.set(orderId, [...existingTimers, timer]);
        });
    }
    // Add status update to history
    addStatusUpdate(orderId, status) {
        const messages = {
            pending: 'Order received and waiting for confirmation',
            confirmed: 'Order confirmed! Restaurant is preparing your food',
            preparing: 'Your delicious food is being prepared with care',
            out_for_delivery: 'Your order is on the way! Expect delivery soon',
            delivered: 'Enjoy your meal! Order successfully delivered'
        };
        const update = {
            orderId,
            status,
            message: messages[status],
            timestamp: new Date()
        };
        const updates = this.statusUpdates.get(orderId) || [];
        updates.push(update);
        this.statusUpdates.set(orderId, updates);
    }
    // Get status updates for an order
    getStatusUpdates(orderId) {
        return this.statusUpdates.get(orderId) || [];
    }
    // Clear all orders (for testing)
    clearAll() {
        this.orders.clear();
        this.statusUpdates.clear();
        this.statusTimers.forEach(timers => {
            timers.forEach(timer => clearTimeout(timer));
        });
        this.statusTimers.clear();
    }
    // Delete an order
    deleteOrder(id) {
        const exists = this.orders.has(id);
        this.orders.delete(id);
        this.statusUpdates.delete(id);
        const timers = this.statusTimers.get(id);
        if (timers) {
            timers.forEach(timer => clearTimeout(timer));
            this.statusTimers.delete(id);
        }
        return exists;
    }
}
// Export singleton instance
exports.orderStore = new OrderStore();
//# sourceMappingURL=orderStore.js.map