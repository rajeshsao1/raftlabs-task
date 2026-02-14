import type { MenuItem } from '@/types';

// Option A: frontend fallback data (used only if backend API is unavailable)
const FALLBACK_MENU: MenuItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Fresh tomatoes, mozzarella cheese, basil, and olive oil on a crispy thin crust',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=1200&h=800&fit=crop',
    category: 'Pizza',
  },
  {
    id: '2',
    name: 'Pepperoni Supreme',
    description: 'Loaded with pepperoni, mozzarella, and our signature tomato sauce',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=1200&h=800&fit=crop',
    category: 'Pizza',
  },
  {
    id: '3',
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=800&fit=crop',
    category: 'Burgers',
  },
  {
    id: '5',
    name: 'Caesar Salad',
    description: 'Crisp romaine, parmesan, croutons with creamy Caesar dressing',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=1200&h=800&fit=crop',
    category: 'Salads',
  },
  {
    id: '10',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=1200&h=800&fit=crop',
    category: 'Desserts',
  },
];

export function getFallbackMenuItems(category?: string, search?: string): MenuItem[] {
  let items = [...FALLBACK_MENU];
  if (category && category !== 'All') {
    items = items.filter((i) => i.category.toLowerCase() === category.toLowerCase());
  }
  if (search && search.trim()) {
    const q = search.toLowerCase();
    items = items.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
  }
  return items;
}

export const fallbackCategories = ['All', 'Pizza', 'Burgers', 'Salads', 'Desserts'];
