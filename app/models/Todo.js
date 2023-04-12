const mongoose = require('mongoose')
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema

const Todo = new Schema({
    title: String,
    content: String,
    priority: String,
    completed: { type: Boolean, defaul: false },
    deadline: { type: Date, default: Date.now() }
    
}, {timestamps: true})

Todo.plugin(mongooseDelete, {
    deletedAt: true,
    deletedBy: true,
    overrideMethods: true
})
module.exports = mongoose.model('Todo', Todo)