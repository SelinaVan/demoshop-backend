const express = require('express');
const router = express.Router()
const orderController = require('../app/controllers/orderController')


// [GET] orders/
router.get('/', orderController.getAllOrder)
// get by day or month
router.get('/sales', orderController.getOrderSaleByQuery)
//[GET] orders/:id
router.get('/:id', orderController.getOrderById)
// [PUT] orders/:id
router.put('/:id', orderController.updateOrder)
//[GET] /customer/:customerId/order
router.get('/customer/:customerId', orderController.getAllOrderOfCustomer)
// [POST] /customer/:customerId/order
router.post('/', orderController.createOrderOfCustomer)
// [DELETE] /customer/:customerId/order/:id
router.delete('/:id', orderController.deleteOrder)


module.exports = router;