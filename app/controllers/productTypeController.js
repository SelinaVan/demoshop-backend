const ProductType = require('../models/ProductType')
const mongoose = require('mongoose')
//[GET] /product-type
const getAllProductType = async (req, res) => {
    try {
        const { productTypeName } = req.query
        let productType;
        const query = productTypeName && typeof productTypeName === 'string' && productTypeName?.trim().length
            ? { name: new RegExp(productTypeName.trim(), 'i') } : {};

        productType = await ProductType.find(query).sort({createdAt: -1}).exec()

        res.status(200).json(productType)
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//[GET] /product-type/:id
const getProductTypeByID = async (req, res) => {
    try {
        const { id } = req.params
        const validId = mongoose.Types.ObjectId.isValid(id)
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' })
        }
        const productType = await ProductType.findById(id).select('-deleted')
        if (!productType) {
            return res.status(404).json({ message: 'There is no product type' })
        }
        res.status(200).json(productType)
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// [POST] /product-type
const createProductType = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name || !(typeof name === 'string' && name.trim().length > 0)) {
            return res.status(400).json({ status: 400, message: 'Name is required and must be string' })
        }
        if (description !== undefined && !(typeof description === 'string' && description.trim().length > 0)) {
            return res.status(400).json({ status: 400, message: 'Description must be a string!!!' })
        }

        const productType = new ProductType(req.body)
        await productType.save()
        res.status(200).json(productType)

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// [PUT] /product-type/:id
const updateProductType = async (req, res) => {

    try {
        const { id } = req.params
        const validId = mongoose.Types.ObjectId.isValid(id)
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' })
        }
        const { name, description } = req.body;

        if (name !== undefined && !(typeof name === 'string' && name.trim().length > 0)) {
            return res.status(400).json({ status: 400, message: 'Name must be a string!!!' })
        }
        if (description !== undefined && !(typeof description === 'string' && description.trim().length > 0)) {
            return res.status(400).json({ status: 400, message: 'Description must be a string!!!' })
        }
        const updatedProduct = await ProductType.findByIdAndUpdate(id, req.body, { new: true }).exec()
        res.status(200).json(updatedProduct)
    }
    catch (error) {
        res.status(500).json({ error: err.message })
    }
}

// [DELETE] /product-type/:id
const deleteProductType = async (req, res) => {
    try {
        const { id } = req.params
        const validId = mongoose.Types.ObjectId.isValid(id)
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' })
        }
        const productType = await ProductType.findById(id)
        if (!productType) {
            return res.status(404).json({ message: 'Product type not existed in the system' })
        }
        const result = await ProductType.delete({ _id: req.params.id }).exec()
        res.status(200).json({ message: 'Deleted successfully' })
    }
    catch (error) {
        res.status(500).json({ error: err.message })
    }
}


module.exports = { deleteProductType, updateProductType, createProductType, getAllProductType, getProductTypeByID }