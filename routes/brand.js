const express = require('express');
const brandController = require('../app/controllers/brandController');
const router = express.Router();

router.get('/', brandController.getAllBrands)
router.post('/', brandController.createNewBrand)
router.put('/:id', brandController.updateBrand)
router.delete('/:id', brandController.deleteBrand)

module.exports = router