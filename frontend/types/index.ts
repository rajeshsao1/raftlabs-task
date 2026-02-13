export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
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
  createdAt: string; // ISO string from backend
  estimatedDelivery: string;
}

export interface StatusUpdate {
  orderId?: string;
  status: OrderStatus;
  message: string;
  timestamp: string; // ISO string from backend
}
