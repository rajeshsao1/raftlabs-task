"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenuItem = exports.getCategories = exports.getMenuItems = void 0;
const menuItems_1 = require("../data/menuItems");
// GET /api/menu - Get all menu items
const getMenuItems = (req, res) => {
    const { category, search } = req.query;
    let filteredItems = [...menuItems_1.menuItems];
    // Filter by category
    if (category && category !== 'All') {
        filteredItems = filteredItems.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }
    // Search by name or description
    if (search) {
        const searchLower = search.toLowerCase();
        filteredItems = filteredItems.filter(item => item.name.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower));
    }
    const response = {
        success: true,
        data: filteredItems
    };
    res.json(response);
};
exports.getMenuItems = getMenuItems;
// GET /api/menu/categories - Get all categories
const getCategories = (req, res) => {
    res.json({
        success: true,
        data: menuItems_1.categories
    });
};
exports.getCategories = getCategories;
// GET /api/menu/:id - Get single menu item
const getMenuItem = (req, res) => {
    const { id } = req.params;
    const item = menuItems_1.menuItems.find(i => i.id === id);
    if (!item) {
        const response = {
            success: false,
            error: 'Menu item not found'
        };
        return res.status(404).json(response);
    }
    const response = {
        success: true,
        data: item
    };
    res.json(response);
};
exports.getMenuItem = getMenuItem;
//# sourceMappingURL=menuController.js.map