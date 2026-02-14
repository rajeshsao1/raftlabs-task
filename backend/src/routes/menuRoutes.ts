import { Router } from 'express';
import { getMenuItems, getMenuItem, getCategories } from '../controllers/menuController';

const router = Router();

// GET /api/menu - Get all menu items
router.get('/', getMenuItems);

// GET /api/menu/categories - Get all categories
router.get('/categories', getCategories);

// GET /api/menu/:id - Get single menu item
router.get('/:id', getMenuItem);

export default router;
