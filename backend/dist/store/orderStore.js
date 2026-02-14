"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderStore = void 0;
const uuid_1 = require("uuid");
class OrderStore {
    constructor() {
        this.orders = new Map();
        this.statusUpdates = new Map();
        this.statusTimers = new Map();
    }
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
    getOrder(id) {
        return this.orders.get(id);
    }
    getAllOrders() {
        return Array.from(this.orders.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    updateOrderStatus(id, status) {
        const order = this.orders.get(id);
        if (!order)
            return undefined;
        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
        const currentIndex = validStatuses.indexOf(order.status);
        const newIndex = validStatuses.indexOf(status);
        if (newIndex !== currentIndex + 1 && newIndex !== currentIndex) {
            return undefined;
        }
        const updatedOrder = { ...order, status };
        this.orders.set(id, updatedOrder);
        this.addStatusUpdate(id, status);
        return updatedOrder;
    }
    initializeStatusUpdates(orderId) {
        const statuses = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
        const delays = [5000, 10000, 15000, 20000];
        this.addStatusUpdate(orderId, 'pending');
        statuses.forEach((status, index) => {
            const timer = setTimeout(() => {
                this.updateOrderStatus(orderId, status);
            }, delays[index]);
            const existingTimers = this.statusTimers.get(orderId) || [];
            this.statusTimers.set(orderId, [...existingTimers, timer]);
        });
    }
    addStatusUpdate(orderId, status) {
        const messages = {
            pending: 'Order received and waiting for confirmation',
            confirmed: 'Order confirmed! Restaurant is preparing your food',
            preparing: 'Your delicious food is being prepared with care',
            out_for_delivery: 'Your order is on the way! Expect delivery soon',
            delivered: 'Enjoy your meal! Order successfully delivered',
        };
        const update = {
            orderId,
            status,
            message: messages[status],
            timestamp: new Date(),
        };
        const updates = this.statusUpdates.get(orderId) || [];
        updates.push(update);
        this.statusUpdates.set(orderId, updates);
    }
    getStatusUpdates(orderId) {
        return this.statusUpdates.get(orderId) || [];
    }
    clearAll() {
        this.orders.clear();
        this.statusUpdates.clear();
        this.statusTimers.forEach((timers) => {
            timers.forEach((timer) => clearTimeout(timer));
        });
        this.statusTimers.clear();
    }
    deleteOrder(id) {
        const exists = this.orders.has(id);
        this.orders.delete(id);
        this.statusUpdates.delete(id);
        const timers = this.statusTimers.get(id);
        if (timers) {
            timers.forEach((timer) => clearTimeout(timer));
            this.statusTimers.delete(id);
        }
        return exists;
    }
}
exports.orderStore = new OrderStore();
//# sourceMappingURL=orderStore.js.map