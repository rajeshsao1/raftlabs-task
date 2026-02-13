// Menu Item type
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

// Cart Item extends MenuItem with quantity
export interface CartItem extends MenuItem {
  quantity: number;
}

// Delivery Details for order
export interface DeliveryDetails {
  name: string;
  address: string;
  phone: string;
}

// Order Status types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered';

// Order type
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  deliveryDetails: DeliveryDetails;
  status: OrderStatus;
  createdAt: Date;
  estimatedDelivery: string;
}

// Status Update for real-time tracking
export interface StatusUpdate {
  orderId: string;
  status: OrderStatus;
  message: string;
  timestamp: Date;
}

// API Request types
export interface CreateOrderRequest {
  items: CartItem[];
  deliveryDetails: DeliveryDetails;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
