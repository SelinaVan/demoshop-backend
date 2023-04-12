const express = require('express');
const categoryController = require('../app/controllers/categoryController');
const router = express.Router();

router.get('/', categoryController.getAllCategories)
router.post('/', categoryController.createNewCategory)
router.put('/:id', categoryController.updateCategory)
router.delete('/:id', categoryController.deleteCategory)

module.exports = router