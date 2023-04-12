const express = require('express');
const statusController = require('../app/controllers/statusController');
const router = express.Router();

router.get('/', statusController.getAllStatus)
router.post('/', statusController.createNewStatus)
router.put('/:id', statusController.updateStatus)
router.delete('/:id', statusController.deleteStatus)

module.exports = router