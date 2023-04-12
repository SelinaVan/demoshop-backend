
const Category = require('../models/Category')

const getAllCategories = async(req, res) => {
    try{
        const { categoryName } = req.query
        let categories
        const query = categoryName && typeof categoryName === 'string' && categoryName?.trim().length
            ? { name: new RegExp(categoryName.trim(), 'i') } : {}
        
        categories = await Category.find(query).sort({createdAt: -1}).select('-deleted')
        res.status(200).json(categories)
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}
const createNewCategory = async(req, res) => {
    try {
        const category = new Category(req.body)
        await category.save()

        res.status(200).json(category)
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}
const updateCategory = async(req, res) => {
    try {
        const { id } = req.params
        const category = await Category.findById(id)
        if (!category) {
            return res.status(404).json({message: 'Category not found'})
        }
        const response = await Category.findByIdAndUpdate(id, req.body, {new: true}).exec()
        res.status(200).json(response)
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}
const deleteCategory = async(req, res) => {
    try{
        const { id } = req.params
        const category = await Category.findById(id)
        if (!category) {
            return res.status(404).json({ message: 'Category not found' })
        }
        await category.delete()
        res.status(200).json({message: 'Deleted succeffully'})
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}

module.exports = { getAllCategories, createNewCategory, updateCategory, deleteCategory }