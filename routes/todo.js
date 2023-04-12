const express = require('express');
const todoController = require('../app/controllers/todoController');
const router = express.Router();

router.get('/', todoController.getAllTodos)
router.get('/deleted', todoController.getAllDeletedTodo)
router.post('/', todoController.createNewTodo)
router.put('/restore', todoController.restoreTodo)
router.put('/title', todoController.updateTitle)
router.put('/:id', todoController.updateTodo)
router.delete('/:id', todoController.deleteTodo)

module.exports = router