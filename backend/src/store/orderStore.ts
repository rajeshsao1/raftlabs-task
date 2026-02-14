import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus, StatusUpdate } from '../types';

const ORDERS_INDEX_KEY = 'orders:index';

function hasKvConfig(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function kvUrl(): string {
  return process.env.KV_REST_API_URL || '';
}

function kvToken(): string {
  return process.env.KV_REST_API_TOKEN || '';
}

async function kvGet<T>(key: string): Promise<T | null> {
  const res = await fetch(`${kvUrl()}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${kvToken()}` },
  });

  if (!res.ok) return null;
  const body = (await res.json()) as { result?: T | null };
  return (body.result ?? null) as T | null;
}

async function kvSet(key: string, value: unknown): Promise<void> {
  await fetch(`${kvUrl()}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}`, {
    headers: { Authorization: `Bearer ${kvToken()}` },
  });
}

async function kvDel(key: string): Promise<void> {
  await fetch(`${kvUrl()}/del/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${kvToken()}` },
  });
}

function toOrder(raw: any): Order {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
  } as Order;
}

function toStatusUpdates(raw: any[]): StatusUpdate[] {
  return (raw || []).map((item) => ({
    ...item,
    timestamp: new Date(item.timestamp),
  }));
}

class OrderStore {
  private orders: Map<string, Order> = new Map();
  private statusUpdates: Map<string, StatusUpdate[]> = new Map();
  private statusTimers: Map<string, NodeJS.Timeout[]> = new Map();

  private async getOrderIds(): Promise<string[]> {
    if (!hasKvConfig()) {
      return Array.from(this.orders.keys());
    }

    const ids = await kvGet<string[]>(ORDERS_INDEX_KEY);
    return ids || [];
  }

  private async setOrderIds(ids: string[]): Promise<void> {
    if (!hasKvConfig()) return;
    await kvSet(ORDERS_INDEX_KEY, ids);
  }

  private async saveOrder(order: Order): Promise<void> {
    if (!hasKvConfig()) {
      this.orders.set(order.id, order);
      return;
    }

    await kvSet(`order:${order.id}`, {
      ...order,
      createdAt: order.createdAt.toISOString(),
    });
  }

  private async saveUpdates(orderId: string, updates: StatusUpdate[]): Promise<void> {
    if (!hasKvConfig()) {
      this.statusUpdates.set(orderId, updates);
      return;
    }

    await kvSet(
      `order:${orderId}:updates`,
      updates.map((u) => ({ ...u, timestamp: u.timestamp.toISOString() }))
    );
  }

  private async getStoredOrder(orderId: string): Promise<Order | undefined> {
    if (!hasKvConfig()) {
      return this.orders.get(orderId);
    }

    const raw = await kvGet<any>(`order:${orderId}`);
    return raw ? toOrder(raw) : undefined;
  }

  private async getStoredUpdates(orderId: string): Promise<StatusUpdate[]> {
    if (!hasKvConfig()) {
      return this.statusUpdates.get(orderId) || [];
    }

    const raw = await kvGet<any[]>(`order:${orderId}:updates`);
    return toStatusUpdates(raw || []);
  }

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
    const id = `ORD-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const order: Order = {
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

  async getOrder(id: string): Promise<Order | undefined> {
    return this.getStoredOrder(id);
  }

  async getAllOrders(): Promise<Order[]> {
    if (!hasKvConfig()) {
      return Array.from(this.orders.values()).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    }

    const ids = await this.getOrderIds();
    const rawOrders = await Promise.all(ids.map((id) => this.getStoredOrder(id)));

    return rawOrders
      .filter((item): item is Order => !!item)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;

    const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
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

  private async initializeStatusUpdates(orderId: string): Promise<void> {
    const statuses: OrderStatus[] = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
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

  private async addStatusUpdate(orderId: string, status: OrderStatus): Promise<void> {
    const messages: Record<OrderStatus, string> = {
      pending: 'Order received and waiting for confirmation',
      confirmed: 'Order confirmed! Restaurant is preparing your food',
      preparing: 'Your delicious food is being prepared with care',
      out_for_delivery: 'Your order is on the way! Expect delivery soon',
      delivered: 'Enjoy your meal! Order successfully delivered'
    };

    const update: StatusUpdate = {
      orderId,
      status,
      message: messages[status],
      timestamp: new Date()
    };

    const updates = await this.getStoredUpdates(orderId);
    updates.push(update);
    await this.saveUpdates(orderId, updates);
  }

  async getStatusUpdates(orderId: string): Promise<StatusUpdate[]> {
    return this.getStoredUpdates(orderId);
  }

  async clearAll(): Promise<void> {
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

  async deleteOrder(id: string): Promise<boolean> {
    const exists = !!(await this.getOrder(id));

    if (!exists) return false;

    if (hasKvConfig()) {
      await kvDel(`order:${id}`);
      await kvDel(`order:${id}:updates`);
      const ids = await this.getOrderIds();
      await this.setOrderIds(ids.filter((item) => item !== id));
    } else {
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

export const orderStore = new OrderStore();
