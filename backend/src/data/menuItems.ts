import { MenuItem } from '../types';

export const menuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    description: 'Fresh tomatoes, mozzarella cheese, basil, and olive oil on a crispy thin crust',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500&h=500&fit=crop',
    category: 'Pizza',
    rating: 4.8,
    prepTime: '20-25 min'
  },
  {
    id: '2',
    name: 'Pepperoni Supreme',
    description: 'Loaded with pepperoni, mozzarella, and our signature tomato sauce',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&h=500&fit=crop',
    category: 'Pizza',
    rating: 4.9,
    prepTime: '20-25 min'
  },
  {
    id: '3',
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheddar cheese, lettuce, tomato, and special sauce',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop',
    category: 'Burgers',
    rating: 4.7,
    prepTime: '15-20 min'
  },
  {
    id: '4',
    name: 'Bacon BBQ Burger',
    description: 'Smoky bacon, BBQ sauce, crispy onions, and melted cheddar',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500&h=500&fit=crop',
    category: 'Burgers',
    rating: 4.8,
    prepTime: '15-20 min'
  },
  {
    id: '5',
    name: 'Caesar Salad',
    description: 'Crisp romaine, parmesan, croutons with creamy Caesar dressing',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&h=500&fit=crop',
    category: 'Salads',
    rating: 4.5,
    prepTime: '10-15 min'
  },
  {
    id: '6',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon herb butter, served with seasonal vegetables',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&h=500&fit=crop',
    category: 'Seafood',
    rating: 4.9,
    prepTime: '25-30 min'
  },
  {
    id: '7',
    name: 'Spaghetti Carbonara',
    description: 'Classic Italian pasta with pancetta, egg, and parmesan cheese',
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&h=500&fit=crop',
    category: 'Pasta',
    rating: 4.7,
    prepTime: '20-25 min'
  },

  {
    id: '9',
    name: 'Beef Tacos',
    description: 'Three soft tacos with seasoned beef, fresh salsa, and sour cream',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&h=500&fit=crop',
    category: 'Mexican',
    rating: 4.6,
    prepTime: '15-20 min'
  },
  {
    id: '10',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center, served with vanilla ice cream',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=500&h=500&fit=crop',
    category: 'Desserts',
    rating: 4.9,
    prepTime: '10-15 min'
  },
  {
    id: '11',
    name: 'Sushi Platter',
    description: 'Assorted fresh sushi rolls with wasabi, ginger, and soy sauce',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&h=500&fit=crop',
    category: 'Japanese',
    rating: 4.8,
    prepTime: '25-30 min'
  },
  {
    id: '12',
    name: 'Veggie Buddha Bowl',
    description: 'Quinoa, roasted vegetables, chickpeas, and tahini dressing',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&h=500&fit=crop',
    category: 'Healthy',
    rating: 4.7,
    prepTime: '15-20 min'
  }
];

export const categories = [
  'All',
  'Pizza',
  'Burgers',
  'Salads',
  'Seafood',
  'Pasta',
  'Appetizers',
  'Mexican',
  'Japanese',
  'Healthy',
  'Desserts'
];
