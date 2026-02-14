import { Order, OrderStatus, StatusUpdate } from '../types';
import { v4 as uuidv4 } from 'uuid';

class OrderStore {
  private orders: Map<string, Order> = new Map();
  private statusUpdates: Map<string, StatusUpdate[]> = new Map();
  private statusTimers: Map<string, NodeJS.Timeout[]> = new Map();

  createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order {
    const id = `ORD-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const order: Order = {
      ...orderData,
      id,
      status: 'pending',
      createdAt: new Date(),
    };

    this.orders.set(id, order);
    this.initializeStatusUpdates(id);

    return order;
  }

  getOrder(id: string): Order | undefined {
    return this.orders.get(id);
  }

  getAllOrders(): Order[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
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

  private initializeStatusUpdates(orderId: string): void {
    const statuses: OrderStatus[] = ['confirmed', 'preparing', 'out_for_delivery', 'delivered'];
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

  private addStatusUpdate(orderId: string, status: OrderStatus): void {
    const messages: Record<OrderStatus, string> = {
      pending: 'Order received and waiting for confirmation',
      confirmed: 'Order confirmed! Restaurant is preparing your food',
      preparing: 'Your delicious food is being prepared with care',
      out_for_delivery: 'Your order is on the way! Expect delivery soon',
      delivered: 'Enjoy your meal! Order successfully delivered',
    };

    const update: StatusUpdate = {
      orderId,
      status,
      message: messages[status],
      timestamp: new Date(),
    };

    const updates = this.statusUpdates.get(orderId) || [];
    updates.push(update);
    this.statusUpdates.set(orderId, updates);
  }

  getStatusUpdates(orderId: string): StatusUpdate[] {
    return this.statusUpdates.get(orderId) || [];
  }

  clearAll(): void {
    this.orders.clear();
    this.statusUpdates.clear();
    this.statusTimers.forEach((timers) => {
      timers.forEach((timer) => clearTimeout(timer));
    });
    this.statusTimers.clear();
  }

  deleteOrder(id: string): boolean {
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

export const orderStore = new OrderStore();
