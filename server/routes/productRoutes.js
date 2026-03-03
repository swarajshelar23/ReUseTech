const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

/**
 * Product Routes
 * All routes start with /api/products
 */

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/user/:userId', getUserProducts);

// Protected routes (require authentication)
router.post('/', protect, createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
