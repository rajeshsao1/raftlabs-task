import { create } from 'zustand';
import { CartItem, Order, StatusUpdate, MenuItem } from '@/types';
import { getMenuItems, getCategories } from '@/services/api';

interface StoreState {
  // Menu (from backend)
  menuItems: MenuItem[];
  categories: string[];
  selectedCategory: string;
  isMenuLoading: boolean;
  menuError: string | null;
  fetchMenu: (opts?: { category?: string; search?: string }) => Promise<void>;
  fetchCategories: () => Promise<void>;
  setSelectedCategory: (category: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;

  // Order (backend-driven)
  currentOrderId: string | null;
  currentOrder: Order | null;
  statusUpdates: StatusUpdate[];
  orderHistory: Order[];
  setCurrentOrderId: (orderId: string | null) => void;
  setCurrentOrder: (order: Order | null) => void;
  setStatusUpdates: (updates: StatusUpdate[]) => void;
  addOrderToHistory: (order: Order) => void;

  // UI State
  currentView: 'menu' | 'cart' | 'checkout' | 'tracking';
  setCurrentView: (view: 'menu' | 'cart' | 'checkout' | 'tracking') => void;
}

export const useStore = create<StoreState>((set, get) => ({
  // Menu (from backend)
  menuItems: [],
  categories: ['All'],
  selectedCategory: 'All',
  isMenuLoading: false,
  menuError: null,

  fetchMenu: async (opts) => {
    set({ isMenuLoading: true, menuError: null });

    const res = await getMenuItems(opts?.category, opts?.search);

    // Option A fallback: if backend is unavailable OR returns an error, load local menu
    if (!res.success) {
      const { getFallbackMenuItems } = await import('@/data/fallbackMenu');
      const localItems = getFallbackMenuItems(opts?.category, opts?.search);
      set({ isMenuLoading: false, menuItems: localItems, menuError: null });
      return;
    }

    // If backend is up but returns empty list, show empty (don’t fallback)
    set({ isMenuLoading: false, menuItems: res.data || [] });
  },

  fetchCategories: async () => {
    const res = await getCategories();

    // Option A fallback: if backend is unavailable OR returns an error
    if (!res.success) {
      const { fallbackCategories } = await import('@/data/fallbackMenu');
      set({ categories: fallbackCategories });
      return;
    }

    // Backend up: use its categories (even if empty)
    set({ categories: res.data && res.data.length ? res.data : ['All'] });
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  
  // Cart
  cart: [],
  
  addToCart: (itemId) => {
    const { cart, menuItems } = get();
    const existingItem = cart.find((item) => item.id === itemId);

    if (existingItem) {
      set({
        cart: cart.map((item) =>
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        ),
      });
      return;
    }

    const menuItem = menuItems.find((item) => item.id === itemId);
    if (menuItem) {
      set({ cart: [...cart, { ...menuItem, quantity: 1 }] });
    }
  },
  
  removeFromCart: (itemId) => {
    set({ cart: get().cart.filter(item => item.id !== itemId) });
  },
  
  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(itemId);
      return;
    }
    set({
      cart: get().cart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    });
  },
  
  clearCart: () => set({ cart: [] }),
  
  getCartTotal: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  
  getCartCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },
  
  // Order (backend-driven)
  currentOrderId: null,
  currentOrder: null,
  statusUpdates: [],
  orderHistory: [],
  setCurrentOrderId: (orderId) => set({ currentOrderId: orderId }),
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setStatusUpdates: (updates) => set({ statusUpdates: updates }),
  addOrderToHistory: (order) =>
    set({ orderHistory: [order, ...get().orderHistory] }),

  // UI State
  currentView: 'menu',
  setCurrentView: (view) => set({ currentView: view }),
  
}));
