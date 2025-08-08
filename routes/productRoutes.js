const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

// Routes cho người dùng
router.get('/', ProductController.getProducts);
router.get('/search', ProductController.searchProducts);
router.get('/category/:category', ProductController.getProductsByCategory);
router.get('/best-selling', ProductController.getBestSellingProducts);
router.get('/:id', ProductController.getProductDetail);

// API routes cho AJAX
router.get('/api/products', ProductController.apiGetProducts);
router.get('/api/products/:id', ProductController.apiGetProductById);
router.get('/api/best-selling', ProductController.apiGetBestSellingProducts);
router.post('/api/update-quantity', ProductController.apiUpdateQuantity);
router.post('/api/decrease-quantity', ProductController.apiDecreaseQuantity);
router.post('/api/increase-quantity', ProductController.apiIncreaseQuantity);

module.exports = router; 