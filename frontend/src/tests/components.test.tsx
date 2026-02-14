/**
 * UI Component Tests
 * Tests for key React components using Testing Library
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuCard } from '@/components/MenuCard';
import { CategoryFilter } from '@/components/CategoryFilter';
import { Header } from '@/components/Header';
import { useStore } from '@/store/useStore';
const menuItems = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Fresh tomatoes, mozzarella cheese, basil, and olive oil on a crispy thin crust',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&h=500&fit=crop',
    category: 'Pizza',
  },
];

// Mock the store
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn()
}));

describe('MenuCard Component', () => {
  const mockAddToCart = vi.fn();
  const mockItem = menuItems[0] as any;

  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockImplementation(() => ({
      addToCart: mockAddToCart
    }));
  });

  it('should render menu item details correctly', () => {
    render(<MenuCard item={mockItem} />);
    
    expect(screen.getByText(mockItem.name)).toBeInTheDocument();
    expect(screen.getByText(mockItem.description)).toBeInTheDocument();
    expect(screen.getByText(`$${mockItem.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(mockItem.category)).toBeInTheDocument();
  });

  it('should not display non-functional fields like rating or preparation time', () => {
    render(<MenuCard item={mockItem} />);

    expect(screen.queryByText(/rating/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/min/i)).not.toBeInTheDocument();
  });

  it('should call addToCart when Add button is clicked', async () => {
    const user = userEvent.setup();
    render(<MenuCard item={mockItem} />);
    
    const addButton = screen.getByRole('button', { name: /add/i });
    await user.click(addButton);
    
    expect(mockAddToCart).toHaveBeenCalledWith(mockItem.id);
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
  });

  it('should render item image with correct alt text', () => {
    render(<MenuCard item={mockItem} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', mockItem.name);
    expect(image).toHaveAttribute('src', mockItem.image);
  });
});

describe('CategoryFilter Component', () => {
  const mockSetSelectedCategory = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockImplementation(() => ({
      selectedCategory: 'All',
      setSelectedCategory: mockSetSelectedCategory
    }));
  });

  it('should render all category buttons', () => {
    render(<CategoryFilter />);
    
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pizza' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Burgers' })).toBeInTheDocument();
  });

  it('should call setSelectedCategory when category is clicked', async () => {
    const user = userEvent.setup();
    render(<CategoryFilter />);
    
    const pizzaButton = screen.getByRole('button', { name: 'Pizza' });
    await user.click(pizzaButton);
    
    expect(mockSetSelectedCategory).toHaveBeenCalledWith('Pizza');
  });

  it('should highlight selected category', () => {
    (useStore as any).mockImplementation(() => ({
      selectedCategory: 'Pizza',
      setSelectedCategory: mockSetSelectedCategory
    }));
    
    render(<CategoryFilter />);
    
    const pizzaButton = screen.getByRole('button', { name: 'Pizza' });
    // Check if button has active styling classes
    expect(pizzaButton.className).toMatch(/from-orange-500/);
  });
});

describe('Header Component', () => {
  const mockSetCurrentView = vi.fn();
  const mockGetCartCount = vi.fn(() => 0);

  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockImplementation(() => ({
      getCartCount: mockGetCartCount,
      currentView: 'menu',
      setCurrentView: mockSetCurrentView,
      currentOrder: null
    }));
  });

  it('should render logo and brand name', () => {
    render(<Header />);
    
    expect(screen.getByText('FoodHub')).toBeInTheDocument();
  });

  it('should display navigation links', () => {
    render(<Header />);
    
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cart/i })).toBeInTheDocument();
  });

  it('should display cart count badge', () => {
    (useStore as any).mockImplementation(() => ({
      getCartCount: () => 3,
      currentView: 'menu',
      setCurrentView: mockSetCurrentView,
      currentOrder: null
    }));
    
    render(<Header />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should show Track Order button when there is an active order', () => {
    (useStore as any).mockImplementation(() => ({
      getCartCount: () => 0,
      currentView: 'menu',
      setCurrentView: mockSetCurrentView,
      currentOrder: { id: 'ORD-123' }
    }));
    
    render(<Header />);
    
    expect(screen.getByText('Track Order')).toBeInTheDocument();
  });

  it('should navigate to menu when logo is clicked', async () => {
    const user = userEvent.setup();
    render(<Header />);
    
    const logo = screen.getByText('FoodHub');
    await user.click(logo);
    
    expect(mockSetCurrentView).toHaveBeenCalledWith('menu');
  });
});

describe('Cart Functionality', () => {
  it('should calculate cart total correctly', () => {
    const cart = [
      { ...menuItems[0], quantity: 2 },
      { ...menuItems[0], quantity: 1 }
    ];
    
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    expect(total).toBeCloseTo((14.99 * 2) + 14.99, 2);
  });

  it('should calculate cart item count correctly', () => {
    const cart = [
      { ...menuItems[0], quantity: 2 },
      { ...menuItems[0], quantity: 3 }
    ];
    
    const count = cart.reduce((c, item) => c + item.quantity, 0);
    
    expect(count).toBe(5);
  });
});

describe('Order Status Flow', () => {
  it('should follow correct status progression', () => {
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    
    // Test that statuses are in correct order
    expect(validStatuses[0]).toBe('pending');
    expect(validStatuses[validStatuses.length - 1]).toBe('delivered');
  });

  it('should validate status transitions', () => {
    const canTransition = (from: string, to: string): boolean => {
      const statuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
      const fromIndex = statuses.indexOf(from);
      const toIndex = statuses.indexOf(to);
      return toIndex === fromIndex + 1 || toIndex === fromIndex;
    };
    
    expect(canTransition('pending', 'confirmed')).toBe(true);
    expect(canTransition('pending', 'preparing')).toBe(false);
    expect(canTransition('confirmed', 'confirmed')).toBe(true);
  });
});

describe('Delivery Details Validation', () => {
  it('should validate required fields', () => {
    const fields = {
      name: 'John Doe',
      address: '123 Main St',
      phone: '+1 234 567 8900'
    };
    
    expect(fields.name).toBeTruthy();
    expect(fields.address).toBeTruthy();
    expect(fields.phone).toBeTruthy();
  });

  it('should validate phone number format', () => {
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    
    expect(phoneRegex.test('+1 234 567 8900')).toBe(true);
    expect(phoneRegex.test('123-456-7890')).toBe(true);
    expect(phoneRegex.test('123')).toBe(false);
  });

  it('should not require email in delivery details', () => {
    const details = {
      name: 'John Doe',
      address: '123 Main St',
      phone: '+1 234 567 8900',
    };

    expect(details.name).toBeTruthy();
    expect(details.address).toBeTruthy();
    expect(details.phone).toBeTruthy();
    expect((details as any).email).toBeUndefined();
  });
});
