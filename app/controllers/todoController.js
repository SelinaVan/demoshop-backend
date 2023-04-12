const Todo = require('../models/Todo');
const mongoose = require('mongoose');

const getAllTodos = async (req, res) => {
    try {

        const todos = await Todo.find().sort({ createdAt: -1 }).exec()

        res.status(200).json(todos)
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
const getAllDeletedTodo = async (req, res) => {
    try {
        const todos = await Todo.findDeleted().sort({ createdAt: -1 }).exec()

        res.status(200).json(todos)
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
const createNewTodo = async (req, res) => {
    try {
        const { title, content, priority, deadline } = req.body
        if (!title?.trim().length || !content?.trim().length || !priority?.trim().length) {
            return res.status(400).json({ message: 'Title, content, priority are required' })
        }
        const todo = new Todo(req.body)
        await todo.save()
        res.status(200).json(todo)

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
const updateTodo = async (req, res) => {
    try {
        const { id } = req.params
        const { title, content, priority, deadline, completed } = req.body
        let isValidId = mongoose.Types.ObjectId.isValid(id)
        if (!isValidId) {
            return res.status(400).json({ message: 'Invalid Id' })
        }
        isValidId = await Todo.findById(id)
        if (!isValidId) {
            return res.status(404).json({ message: 'Not found' })
        }
        for (let props in req.body) {
            const value = req.body[props]
            if (value !== undefined && value !== completed && !value?.trim().length) {
                delete req.body[props]
            }
        }
        const todo = await Todo.findByIdAndUpdate(id, req.body, { new: true }).exec()
        res.status(200).json(todo)
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
const updateTitle = async (req, res) => {
    try {
        const { title } = req.body
        console.log('title: ', title);
        if (title !== undefined && !title.trim().length) {
            delete title
            return
        }
        const todo = await Todo.updateMany({}, { $set: { title } }, { new: true }).exec()
        res.status(200).json(todo)
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
const deleteTodo = async (req, res) => {
    try {
        const { id } = req.params
        let isValidId = mongoose.Types.ObjectId.isValid(id)
        if (!isValidId) {
            return res.status(400).json({ message: 'Invalid Id' })
        }
        isValidId = await Todo.findById(id)
        if (!isValidId) {
            return res.status(404).json({ message: 'Not found' })
        }
        const result = await Todo.delete({ _id: id }).exec()
        res.status(200).send('Deleted successfully')
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
const restoreTodo = async (req, res) => {
    try {
        const { ids } = req.body
        const isValidId = ids.filter(id => mongoose.Types.ObjectId.isValid(id))
        if (ids.length !== isValidId.length) {
            return res.status(400).json({ message: 'Invalid id' })
        }
        const todos = await Todo.restore({ _id: { $in: ids } })
        if (!todos?.length) {
            return res.status(404).json({ message: 'Not found' })
        }
        res.status(200).json(todos)
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
module.exports = { getAllTodos, createNewTodo, updateTodo, deleteTodo, restoreTodo, updateTitle, getAllDeletedTodo }