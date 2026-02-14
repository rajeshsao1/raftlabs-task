import { Collection } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/mongo';
import { Order, OrderStatus, StatusUpdate } from '../types';

type OrderDocument = Order & { statusUpdates: StatusUpdate[] };

const STATUS_SEQUENCE: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
const STATUS_DELAYS_MS = [0, 5000, 10000, 15000, 20000];
const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: 'Order received and waiting for confirmation',
  confirmed: 'Order confirmed! Restaurant is preparing your food',
  preparing: 'Your delicious food is being prepared with care',
  out_for_delivery: 'Your order is on the way! Expect delivery soon',
  delivered: 'Enjoy your meal! Order successfully delivered',
};

let indexesReady = false;

async function getOrderCollection(): Promise<Collection<OrderDocument>> {
  const db = await getDb();
  const collection = db.collection<OrderDocument>('orders');

  if (!indexesReady) {
    await collection.createIndex({ id: 1 }, { unique: true });
    indexesReady = true;
  }

  return collection;
}

function normalizeDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function computeTargetIndex(createdAt: Date, now: Date): number {
  const elapsed = now.getTime() - createdAt.getTime();
  let targetIndex = 0;
  for (let i = 0; i < STATUS_DELAYS_MS.length; i += 1) {
    if (elapsed >= STATUS_DELAYS_MS[i]) {
      targetIndex = i;
    }
  }
  return targetIndex;
}

function syncOrderProgress(order: OrderDocument, now: Date): { order: OrderDocument; changed: boolean } {
  const createdAt = normalizeDate(order.createdAt);
  const existingUpdates = (order.statusUpdates || []).map((update) => ({
    ...update,
    timestamp: normalizeDate(update.timestamp),
  }));

  const seenStatuses = new Set(existingUpdates.map((update) => update.status));

  let changed = false;
  if (!seenStatuses.has('pending')) {
    existingUpdates.push({
      orderId: order.id,
      status: 'pending',
      message: STATUS_MESSAGES.pending,
      timestamp: createdAt,
    });
    seenStatuses.add('pending');
    changed = true;
  }

  const currentIndex = Math.max(0, STATUS_SEQUENCE.indexOf(order.status));
  const targetIndex = Math.max(currentIndex, computeTargetIndex(createdAt, now));

  for (let i = 1; i <= targetIndex; i += 1) {
    const status = STATUS_SEQUENCE[i];
    if (!seenStatuses.has(status)) {
      existingUpdates.push({
        orderId: order.id,
        status,
        message: STATUS_MESSAGES[status],
        timestamp: new Date(createdAt.getTime() + STATUS_DELAYS_MS[i]),
      });
      seenStatuses.add(status);
      changed = true;
    }
  }

  existingUpdates.sort((a, b) => {
    const diff = a.timestamp.getTime() - b.timestamp.getTime();
    if (diff !== 0) return diff;
    return STATUS_SEQUENCE.indexOf(a.status) - STATUS_SEQUENCE.indexOf(b.status);
  });

  const nextStatus = STATUS_SEQUENCE[targetIndex];
  if (order.status !== nextStatus) {
    changed = true;
  }

  return {
    order: {
      ...order,
      createdAt,
      status: nextStatus,
      statusUpdates: existingUpdates,
    },
    changed,
  };
}

function toOrder(order: OrderDocument): Order {
  const { statusUpdates: _statusUpdates, ...rest } = order;
  return rest;
}

class OrderStore {
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order> {
    const id = `ORD-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const createdAt = new Date();
    const order: OrderDocument = {
      ...orderData,
      id,
      status: 'pending',
      createdAt,
      statusUpdates: [
        {
          orderId: id,
          status: 'pending',
          message: STATUS_MESSAGES.pending,
          timestamp: createdAt,
        },
      ],
    };

    const collection = await getOrderCollection();
    await collection.insertOne(order);

    return toOrder(order);
  }

  private async getOrderDocument(id: string): Promise<OrderDocument | undefined> {
    const collection = await getOrderCollection();
    const order = await collection.findOne({ id });
    return order ?? undefined;
  }

  private async persistSync(order: OrderDocument): Promise<OrderDocument> {
    const collection = await getOrderCollection();
    await collection.updateOne(
      { id: order.id },
      {
        $set: {
          status: order.status,
          statusUpdates: order.statusUpdates,
          createdAt: order.createdAt,
        },
      }
    );
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const order = await this.getOrderDocument(id);
    if (!order) return undefined;

    const synced = syncOrderProgress(order, new Date());
    if (synced.changed) {
      await this.persistSync(synced.order);
    }

    return toOrder(synced.order);
  }

  async getAllOrders(): Promise<Order[]> {
    const collection = await getOrderCollection();
    const orders = await collection.find().sort({ createdAt: -1 }).toArray();

    const now = new Date();
    const syncedOrders = await Promise.all(
      orders.map(async (order) => {
        const synced = syncOrderProgress(order, now);
        if (synced.changed) {
          await this.persistSync(synced.order);
        }
        return synced.order;
      })
    );

    return syncedOrders.map(toOrder);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined> {
    const order = await this.getOrderDocument(id);
    if (!order) return undefined;

    const synced = syncOrderProgress(order, new Date());
    if (synced.changed) {
      await this.persistSync(synced.order);
    }

    const currentIndex = STATUS_SEQUENCE.indexOf(synced.order.status);
    const newIndex = STATUS_SEQUENCE.indexOf(status);

    if (newIndex !== currentIndex + 1 && newIndex !== currentIndex) {
      return undefined;
    }

    const updatedOrder: OrderDocument = {
      ...synced.order,
      status,
      statusUpdates: [
        ...synced.order.statusUpdates,
        {
          orderId: id,
          status,
          message: STATUS_MESSAGES[status],
          timestamp: new Date(),
        },
      ],
    };

    const collection = await getOrderCollection();
    await collection.updateOne(
      { id },
      {
        $set: {
          status: updatedOrder.status,
          statusUpdates: updatedOrder.statusUpdates,
        },
      }
    );

    return toOrder(updatedOrder);
  }

  async getStatusUpdates(orderId: string): Promise<StatusUpdate[] | undefined> {
    const order = await this.getOrderDocument(orderId);
    if (!order) return undefined;

    const synced = syncOrderProgress(order, new Date());
    if (synced.changed) {
      await this.persistSync(synced.order);
    }

    return synced.order.statusUpdates;
  }

  async clearAll(): Promise<void> {
    const collection = await getOrderCollection();
    await collection.deleteMany({});
  }

  async deleteOrder(id: string): Promise<boolean> {
    const collection = await getOrderCollection();
    const result = await collection.deleteOne({ id });
    return result.deletedCount === 1;
  }
}

export const orderStore = new OrderStore();
