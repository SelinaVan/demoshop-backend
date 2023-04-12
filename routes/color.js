const express = require('express');
const colorController = require('../app/controllers/colorController');
const router = express.Router();

router.get('/', colorController.getAllColor)
router.post('/', colorController.createNewColor)
router.put('/:id', colorController.updateColor)
router.delete('/:id', colorController.deleteColor)

module.exports = router