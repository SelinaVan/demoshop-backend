const express = require('express');
const shippingController = require('../app/controllers/shippingController');
const router = express.Router();

router.get('/', shippingController.getAllShipping)
router.post('/', shippingController.createNewShipping)
router.put('/:id', shippingController.updateShipping)
router.delete('/:id', shippingController.deleteShipping)

module.exports = router