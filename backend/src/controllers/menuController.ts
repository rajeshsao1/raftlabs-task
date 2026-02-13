import { Request, Response } from 'express';
import { menuItems, categories } from '../data/menuItems';
import { ApiResponse, MenuItem } from '../types';

// GET /api/menu - Get all menu items
export const getMenuItems = (req: Request, res: Response) => {
  const { category, search } = req.query;

  let filteredItems = [...menuItems];

  // Filter by category
  if (category && category !== 'All') {
    filteredItems = filteredItems.filter(
      item => item.category.toLowerCase() === (category as string).toLowerCase()
    );
  }

  // Search by name or description
  if (search) {
    const searchLower = (search as string).toLowerCase();
    filteredItems = filteredItems.filter(
      item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
    );
  }

  const response: ApiResponse<MenuItem[]> = {
    success: true,
    data: filteredItems
  };

  res.json(response);
};

// GET /api/menu/categories - Get all categories
export const getCategories = (req: Request, res: Response) => {
  res.json({
    success: true,
    data: categories
  });
};

// GET /api/menu/:id - Get single menu item
export const getMenuItem = (req: Request, res: Response) => {
  const { id } = req.params;
  const item = menuItems.find(i => i.id === id);

  if (!item) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Menu item not found'
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<MenuItem> = {
    success: true,
    data: item
  };

  res.json(response);
};
