const express = require('express');
const router = express.Router()
const orderDetailController = require('../app/controllers/OrderDetailController')

// [GET] /
router.get('/', orderDetailController.getAllOrderDetail)
// [GET] /:id
router.post('/ids', orderDetailController.getOrderDetailById)
// [PUT] /:id
router.put('/:id', orderDetailController.updateOrderDetail)
// [GET] order/:orderId
router.get('/order/:orderId/', orderDetailController.getAllOrderDetailOfOrder)
// [POST] - create order detait at order controller
// [DELETE] /:id
router.delete('/:id/order/:orderId', orderDetailController.deleteOrderDetail)

module.exports = router;