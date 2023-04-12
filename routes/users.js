const express = require('express');
const userController = require('../app/controllers/userController');
const router = express.Router();
const { verifyUserAuth, verifyAdmin, verifySuperAdmin } = require('../app/middleware/authMiddleware')

router.get('/', verifySuperAdmin, userController.getAllUsers)
router.get('/me', verifyUserAuth, userController.getPersitUserLogin)
//[GET] /:id
router.get('/:id', verifySuperAdmin, userController.getUserByID)
router.post('/me/login', userController.getAuthUserLogin)
router.post('/me/register', userController.createUser)
router.post('/phone', verifyAdmin, userController.getUserByPhone)
router.put('/:id', verifySuperAdmin, userController.updateUser)
router.delete('/:id',verifySuperAdmin, userController.deleteUser)
router.post('/me/logout', verifyUserAuth, userController.logoutUserFromOneDevice)
// router.post('/me/logoutall', auth, userController.logoutUserFromAllDevice)
// router.post('/me/refresh_token', auth, userController.refeshToken)

module.exports = router