/**
 * API Service for FoodHub
 * Real API calls to Express backend (no frontend mock data)
 */

import type { MenuItem, Order, OrderStatus, DeliveryDetails, CartItem, StatusUpdate } from '@/types';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  ((import.meta as any).env?.DEV ? 'http://localhost:3001/api' : '/api');

// In a downloaded frontend-only setup, backend won't exist. We keep Option A working
// by timing out quickly and letting the store fallback menu kick in.
const DEFAULT_TIMEOUT_MS = 1200;

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      signal: controller.signal,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const data = (await res.json().catch(() => null)) as ApiResponse<T> | null;

    if (!res.ok) {
      clearTimeout(timeout);
      return {
        success: false,
        error: (data as any)?.error || `HTTP ${res.status}`,
      };
    }

    // backend already returns {success,data,message}
    clearTimeout(timeout);
    return (data || { success: true }) as ApiResponse<T>;
  } catch (e: any) {
    clearTimeout(timeout);
    const msg = e?.name === 'AbortError' ? 'API timeout/unavailable' : (e?.message || 'Network error');
    return { success: false, error: msg };
  }
}

// Menu
export function getMenuItems(category?: string, search?: string) {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.set('category', category);
  if (search) params.set('search', search);
  const qs = params.toString();
  return apiRequest<MenuItem[]>(`/menu${qs ? `?${qs}` : ''}`);
}

export function getMenuItem(id: string) {
  return apiRequest<MenuItem>(`/menu/${id}`);
}

export function getCategories() {
  return apiRequest<string[]>(`/menu/categories`);
}

// Orders
export function createOrder(items: CartItem[], deliveryDetails: DeliveryDetails) {
  return apiRequest<Order>(`/orders`, {
    method: 'POST',
    body: JSON.stringify({ items, deliveryDetails }),
  });
}

export function getOrder(id: string) {
  return apiRequest<Order>(`/orders/${id}`);
}

export function getAllOrders() {
  return apiRequest<Order[]>(`/orders`);
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  return apiRequest<Order>(`/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export function getStatusUpdates(orderId: string) {
  return apiRequest<StatusUpdate[]>(`/orders/${orderId}/status-updates`);
}

// Polling helper
export function subscribeToOrderStatus(
  orderId: string,
  onUpdate: (order: Order, updates: StatusUpdate[]) => void,
  intervalMs = 2000
) {
  let disposed = false;

  const tick = async () => {
    const [oRes, uRes] = await Promise.all([getOrder(orderId), getStatusUpdates(orderId)]);
    if (disposed) return;
    if (oRes.success && oRes.data) onUpdate(oRes.data, uRes.data || []);
  };

  void tick();
  const timer = setInterval(() => void tick(), intervalMs);

  return () => {
    disposed = true;
    clearInterval(timer);
  };
}
