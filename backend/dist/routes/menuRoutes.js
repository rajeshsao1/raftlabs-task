"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menuController_1 = require("../controllers/menuController");
const router = (0, express_1.Router)();
// GET /api/menu - Get all menu items
router.get('/', menuController_1.getMenuItems);
// GET /api/menu/categories - Get all categories
router.get('/categories', menuController_1.getCategories);
// GET /api/menu/:id - Get single menu item
router.get('/:id(\\d+)', menuController_1.getMenuItem);
exports.default = router;
//# sourceMappingURL=menuRoutes.js.map