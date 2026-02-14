import { Order, OrderStatus, StatusUpdate } from '../types';
declare class OrderStore {
    private orders;
    private statusUpdates;
    private statusTimers;
    createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order;
    getOrder(id: string): Order | undefined;
    getAllOrders(): Order[];
    updateOrderStatus(id: string, status: OrderStatus): Order | undefined;
    private initializeStatusUpdates;
    private addStatusUpdate;
    getStatusUpdates(orderId: string): StatusUpdate[];
    clearAll(): void;
    deleteOrder(id: string): boolean;
}
export declare const orderStore: OrderStore;
export {};
//# sourceMappingURL=orderStore.d.ts.map