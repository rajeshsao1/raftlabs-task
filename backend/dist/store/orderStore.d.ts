import { Order, OrderStatus, StatusUpdate } from '../types';
declare class OrderStore {
    private orders;
    private statusUpdates;
    private statusTimers;
    private getOrderIds;
    private setOrderIds;
    private saveOrder;
    private saveUpdates;
    private getStoredOrder;
    private getStoredUpdates;
    createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Promise<Order>;
    getOrder(id: string): Promise<Order | undefined>;
    getAllOrders(): Promise<Order[]>;
    updateOrderStatus(id: string, status: OrderStatus): Promise<Order | undefined>;
    private initializeStatusUpdates;
    private addStatusUpdate;
    getStatusUpdates(orderId: string): Promise<StatusUpdate[]>;
    clearAll(): Promise<void>;
    deleteOrder(id: string): Promise<boolean>;
}
export declare const orderStore: OrderStore;
export {};
//# sourceMappingURL=orderStore.d.ts.map