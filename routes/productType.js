const express = require('express');
const router = express.Router()
const productTypeController = require('../app/controllers/productTypeController')

// [GET]
router.get('/', productTypeController.getAllProductType)
//[GET] /:id
router.get('/:id', productTypeController.getProductTypeByID)
// [POST]
router.post('/', productTypeController.createProductType)
// [PUT] /:id
router.put('/:id', productTypeController.updateProductType)
// [DELETE] /:id
router.delete('/:id', productTypeController.deleteProductType)

module.exports = router;