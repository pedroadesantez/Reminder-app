const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoriesController');

// GET /api/categories - Get all categories
router.get('/', getAllCategories);

// GET /api/categories/:id - Get specific category
router.get('/:id', getCategoryById);

// POST /api/categories - Create new category
router.post('/', createCategory);

// PUT /api/categories/:id - Update category
router.put('/:id', updateCategory);

// DELETE /api/categories/:id - Delete category
router.delete('/:id', deleteCategory);

module.exports = router;