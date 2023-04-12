const express = require('express');
const router = express.Router()
const customerController = require('../app/controllers/customerController')
const { customerAuth, verifyAdmin, verifySuperAdmin } = require('../app/middleware/customerAuthMiddleware')
const authMiddleware = require('../app/middleware/authMiddleware')

// [GET]
router.get('/', authMiddleware.verifySuperAdmin, customerController.getAllCustomer)
// [GET] /customers/me
router.get('/me', customerAuth, customerController.getPersitCustomerLogin)
// [POST] /customers/phone
router.post('/phone', authMiddleware.verifySuperAdmin, customerController.getCustomerByPhone)
// [GET] /customers/me
router.get('/total',  customerController.getTotalCustomer)
//[GET] /:id
router.get('/:id', authMiddleware.verifySuperAdmin, customerController.getCustomerByID)
// [PUT] /:id
router.put('/:id', authMiddleware.verifySuperAdmin, customerController.updateCustomer)
// [DELETE] /:id
router.delete('/:id', authMiddleware.verifySuperAdmin, customerController.deleteCustomer)

// [POST]
router.post('/me/register', customerController.createCustomer)
// [POST] /me/login
router.post('/me/login', customerController.getAuthCustomerLogin)

// [POST] /me/logout
router.post('/me/logout', customerAuth, customerController.logoutCustomerFromOneDevice)

module.exports = router;