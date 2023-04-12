const express = require('express');
const productController = require('../app/controllers/productController');
const router = express.Router();

router.get('/', productController.getAllProducts)
router.get('/product_type', productController.getProductByType)
router.get('/:id', productController.getProductById)
router.post('/', productController.createNewProduct)
router.put('/:id', productController.updateProduct)
router.delete('/:id', productController.deleteAProduct)
router.post('/filter', productController.getAllProductsByFilter)

module.exports = router