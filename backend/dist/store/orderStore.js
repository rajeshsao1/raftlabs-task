"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderStore = void 0;
const uuid_1 = require("uuid");
const ORDERS_INDEX_KEY = 'orders:index';
function hasKvConfig() {
    return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}
function kvUrl() {
    return process.env.KV_REST_API_URL || '';
}
function kvToken() {
    return process.env.KV_REST_API_TOKEN || '';
}
async function kvGet(key) {
    const res = await fetch(`${kvUrl()}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${kvToken()}` },
    });
    if (!res.ok)
        return null;
    const body = (await res.json());
    return (body.result ?? null);
}
async function kvSet(key, value) {
    await fetch(`${kvUrl()}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}`, {
        headers: { Authorization: `Bearer ${kvToken()}` },
    });
}
async function kvDel(key) {
    await fetch(`${kvUrl()}/del/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${kvToken()}` },
    });
}
function toOrder(raw) {
    return {
        ...raw,
        createdAt: new Date(raw.createdAt),
    };
}
function toStatusUpdates(raw) {
    return (raw || []).map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp),
    }));
}
class OrderStore {
    constructor() {
        this.orders = new Map();
        this.statusUpdates = new Map();
        this.statusTimers = new Map();
    }
    async getOrderIds() {
        if (!hasKvConfig()) {
            return Array.from(this.orders.keys());
        }
        const ids = await kvGet(ORDERS_INDEX_KEY);
        return ids || [];
    }
    async setOrderIds(ids) {
        if (!hasKvConfig())
            return;
        await kvSet(ORDERS_INDEX_KEY, ids);
    }
    async saveOrder(order) {
        if (!hasKvConfig()) {
            this.orders.set(order.id, order);
            return;
        }
        await kvSet(`order:${order.id}`, {
            ...order,
            createdAt: order.createdAt.toISOString(),
        });
    }
    async saveUpdates(orderId, updates) {
        if (!hasKvConfig()) {
            this.statusUpdates.set(orderId, updates);
            return;
        }
        await kvSet(`order:${orderId}:updates`, updates.map((u) => ({ ...u, timestamp: u.timestamp.toISOString() })));
    }
    async getStoredOrder(orderId) {
        if (!hasKvConfig()) {
            return this.orders.get(orderId);
        }
        const raw = await kvGet(`order:${orderId}`);
        return raw ? toOrder(raw) : undefined;
    }
    async getStoredUpdates(orderId) {
        if (!hasKvConfig()) {
            return this.statusUpdates.get(orderId) || [];
        }
        const raw = await kvGet(`order:${orderId}:updates`);
        return toStatusUpdates(raw || []);
    }
    async createOrder(orderData) {
        const id = `ORD-${Date.now()}-${(0, uuid_1.v4)().substring(0, 8)}`;
        const order = {
            ...orderData,
            id,
            status: 'pending',
            createdAt: new Date(),
        };
        await this.saveOrder(order);
        const ids = await this.getOrderIds();
        await this.setOrderIds([id, ...ids.filter((item) => item !== id)]);
        await this.initializeStatusUpdates(id);
        return order;
    }
    async getOrder(id) {
        return this.getStoredOrder(id);
    }
    async getAllOrders() {
        if (!hasKvConfig()) {
            return Array.from(this.orders.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        const ids = await this.getOrderIds();
        const rawOrders = await Promise.all(ids.map((id) => this.getStoredOrder(id)));
        return rawOrders
            .filter((item) => !!item)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async updateOrderStatus(id, status) {
        const order = await this.getOrder(id);
        if (!order)
            return undefined;
        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
        const currentIndex = validStatuses.indexOf(order.status);
        const newIndex = validStatuses.indexOf(status);
        if (newIndex !== currentIndex + 1 && newIndex !== currentIndex) {
            return undefined;
        }
        const updatedOrder = { ...order, status };
        await this.saveOrder(updatedOrder);
        await this.addStatusUpdate(id, status);
        return updatedOrder;
    }
    async initializeStatusUpdates(orderId) {
        const statuses = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
        const delays = [5000, 10000, 15000, 20000];
        await this.addStatusUpdate(orderId, 'pending');
        statuses.forEach((status, index) => {
            const timer = setTimeout(() => {
                void this.updateOrderStatus(orderId, status);
            }, delays[index]);
            const existingTimers = this.statusTimers.get(orderId) || [];
            this.statusTimers.set(orderId, [...existingTimers, timer]);
        });
    }
    async addStatusUpdate(orderId, status) {
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
        const updates = await this.getStoredUpdates(orderId);
        updates.push(update);
        await this.saveUpdates(orderId, updates);
    }
    async getStatusUpdates(orderId) {
        return this.getStoredUpdates(orderId);
    }
    async clearAll() {
        if (hasKvConfig()) {
            const ids = await this.getOrderIds();
            await Promise.all([
                ...ids.map((id) => kvDel(`order:${id}`)),
                ...ids.map((id) => kvDel(`order:${id}:updates`)),
            ]);
            await kvDel(ORDERS_INDEX_KEY);
        }
        this.orders.clear();
        this.statusUpdates.clear();
        this.statusTimers.forEach((timers) => {
            timers.forEach((timer) => clearTimeout(timer));
        });
        this.statusTimers.clear();
    }
    async deleteOrder(id) {
        const exists = !!(await this.getOrder(id));
        if (!exists)
            return false;
        if (hasKvConfig()) {
            await kvDel(`order:${id}`);
            await kvDel(`order:${id}:updates`);
            const ids = await this.getOrderIds();
            await this.setOrderIds(ids.filter((item) => item !== id));
        }
        else {
            this.orders.delete(id);
            this.statusUpdates.delete(id);
        }
        const timers = this.statusTimers.get(id);
        if (timers) {
            timers.forEach((timer) => clearTimeout(timer));
            this.statusTimers.delete(id);
        }
        return true;
    }
}
exports.orderStore = new OrderStore();
//# sourceMappingURL=orderStore.js.map