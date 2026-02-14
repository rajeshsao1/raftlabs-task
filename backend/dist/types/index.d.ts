export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    prepTime: string;
}
export interface CartItem extends MenuItem {
    quantity: number;
}
export interface DeliveryDetails {
    name: string;
    address: string;
    phone: string;
}
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';
export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    deliveryDetails: DeliveryDetails;
    status: OrderStatus;
    createdAt: Date;
    estimatedDelivery: string;
}
export interface StatusUpdate {
    orderId: string;
    status: OrderStatus;
    message: string;
    timestamp: Date;
}
export interface CreateOrderRequest {
    items: CartItem[];
    deliveryDetails: DeliveryDetails;
}
export interface UpdateOrderStatusRequest {
    status: OrderStatus;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
//# sourceMappingURL=index.d.ts.map