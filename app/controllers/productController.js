const Product = require('../models/Product');
const ProductType = require('../models/ProductType');
const Brand = require('../models/Brand');
const Color = require('../models/Color');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Status = require('../models/Status');
const { default: mongoose } = require('mongoose');

const getAllProducts = async (req, res) => {
    try {
        const { page, pageSize, productName } = req.query;
        let products, total
        const query = productName && typeof productName === 'string' && productName?.trim().length
            ? { name: new RegExp(productName.trim(), 'i')} : {}
        total = await Product.countDocuments(query)
        // populate nessesary field 
        products = await Product.find(query)
            .populate('type', 'name ')
            .populate('color', 'name ')
            .populate('category', 'name ')
            .populate('status', 'name ')
            .populate('brand', 'name ')
            .populate('reviews', 'note rating')
            .sort({createdAt: -1})
            .skip(page  * pageSize)
            .limit(pageSize)
            .lean();
        // products.map(prod => {
        //     prod.type = prod.type.name
        //     //         prod.color = prod.color.map(col => col.name),
        //     //         prod.category = prod.category.map(cat => cat.name),
        //     //         prod.status = prod.status.map(stat => stat.name),
        //     //         prod.brand = prod.brand.name,
        //     //         prod.reviews = prod.reviews.map(review => ({
        //     //             note: review.note,
        //     //             rating: review.rating
        //     //         }))
        //     return prod
        // })

        res.status(200).json({ total, products })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
//[GET]/filter
const getAllProductsByFilter = async (req, res) => {

    try {
        const { brand, category, color, rating, status, price, page, pageSize } = req.body

        // find products before query follow each field
        let productsQuery = Product.find()
            .populate('type', 'name ')
            .populate('color', 'name ')
            .populate('category', 'name ')
            .populate('status', 'name ')
            .populate('brand', 'name ')
            .populate('reviews', 'note rating');
        // make condition to query
        if (price && Number(price)) {
            productsQuery = productsQuery.where('buyPrice').lte(price);
        }

        if (category?.length) {
            const categories = await Category.aggregate([
                { $project: { name: { $toLower: '$name' } } },
                { $match: { name: { $in: category } } }
            ]).exec()
            const categoryId = categories.map(c => c._id)
            productsQuery = productsQuery.where('category').in(categoryId);
        }

        if (color?.length) {
            const colors = await Color.aggregate([
                { $project: { name: { $toLower: "$name" } } },
                { $match: { name: { $in: color } } }
            ]).exec()
            const colorId = colors.map(c => c._id)
            productsQuery = productsQuery.where('color').in(colorId);
        }

        if (status?.length) {
            const statuses = await Status.aggregate([
                { $project: { name: { $toLower: "$name" } } },
                { $match: { name: { $in: status } } }
            ]).exec()
            const statusId = statuses.map(s => s._id)
            productsQuery = productsQuery.where('status').in(statusId);
        }

        if (brand?.length) {
            const brands = await Brand.aggregate([
                { $project: { name_lower: { $toLower: "$name" } } },
                { $match: { name_lower: { $in: brand } } },
            ]).exec();
            const brandId = brands.map((b) => b._id);
            productsQuery = productsQuery.where('brand').in(brandId);
        }

        if (rating?.length) {
            const reviewId = await Review.find({ rating: { $in: rating } }).distinct('_id')
            productsQuery = productsQuery.where('reviews').in(reviewId);
        }
        const total = await productsQuery.clone().countDocuments()
        // skip page and limit pageSize
        const products = await productsQuery
            .skip(page  * pageSize)
            .limit(pageSize)
            .lean();

        // map to return object follow format
        products.map(prod => {
            prod.type = prod.type.name,
                prod.color = prod.color.map(col => col.name),
                prod.category = prod.category.map(cat => cat.name),
                prod.status = prod.status.map(stat => stat.name),
                prod.brand = prod.brand.name,
                prod.reviews = prod.reviews.map(review => ({
                    note: review.note,
                    rating: review.rating
                }))
            return prod
        })

        // console.log('products: ', products);
        res.status(200).json({ total, products })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
//[GET]/:id
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id)
            .populate('type', 'name ')
            .populate('color', 'name ')
            .populate('category', 'name ')
            .populate('status', 'name ')
            .populate('brand', 'name ')
            .populate('reviews', 'note rating')
            .lean()
        // const responseProd = {
        //     ...product,
        //     type: product.type.name,
        //     color: product.color.map(col => col.name),
        //     category: product.category.map(cat => cat.name),
        //     status: product.status.map(stat => stat.name),
        //     brand: product.brand.name,
        //     reviews: product.reviews.map(review => ({
        //         note: review.note,
        //         rating: review.rating
        //     }))

        // }
        res.status(200).json(product)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// [GET]/product-type?type
const getProductByType = async (req, res) => {
    try {
        const { type } = req.query;
        const typeObj = await ProductType.findOne({ name: { $regex: new RegExp(`^${type}$`, 'i') } }).exec();
        const products = await Product.find({ type: typeObj._id })
            .populate('type', 'name ')
            .populate('color', 'name ')
            .populate('category', 'name ')
            .populate('status', 'name ')
            .populate('brand', 'name ')
            .populate('reviews', 'note rating')
            .lean()
        if (!products) {
            return res.status(404).json({ error: 'Type not found' });
        }
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// [POST]
const createNewProduct = async (req, res) => {
    try {
        const { description, name, type, imageUrl, buyPrice, promotionPrice, amount, color, category, status, brand, reviews } = req.body
        if (!description?.length || !name?.length || !type?.length || !imageUrl?.length || !color?.length
            || !category?.length || !status?.length || !brand?.length) {
            return res.status(400).json({ message: 'All field are required' })
        }
        if (isNaN(buyPrice) || isNaN(promotionPrice)) {
            return res.status(400).json({ message: 'Price must be a number' })
        }
        if (amount !== undefined && !(Number.isInteger(amount) && amount > 0)) {
            return res.status(400).json({ status: 400, message: 'Amount  must be number' })
        }
        const newProduct = new Product(req.body)
        await newProduct.save()

        res.status(200).json(newProduct)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}

const updateProduct = async (req, res) => {
    try {
        const { description, name, type, imageUrl, buyPrice, promotionPrice, amount, color,
            category, status, brand, reviews } = req.body;
        const { id } = req.params;

        const validId = mongoose.Types.ObjectId.isValid(id);
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (description !== undefined && description.trim().length === 0) {
            delete req.body.description;
        }
        if (imageUrl !== undefined && imageUrl.trim().length === 0) {
            delete req.body.imageUrl;
        }

        if (name !== undefined && name.trim().length === 0) {
            delete req.body.name;
        }

        if (buyPrice !== undefined && (isNaN(buyPrice) || buyPrice <= 0)) {
            return res.status(400).json({ message: 'Price must be number and greater than 0' });
        }

        if (promotionPrice !== undefined && (isNaN(promotionPrice) || promotionPrice <= 0)) {
            return res.status(400).json({ message: 'Promotion price must be number and greater than 0' });
        }

        
        if (amount !== undefined && !(Number.isInteger(amount) || Number(amount) >= 0)) {
            return res.status(400).json({ message: 'Amount must be number and positive number' });
        }
        const isValidType = await ProductType.findById(type)
        if (!isValidType) {
            return res.status(404).json({ message: 'Type not found' });

        }
        const isValidColorIds = color.filter(c => mongoose.Types.ObjectId.isValid(c));
        if (isValidColorIds.length !== color.length) {
            return res.status(400).json({ message: 'Invalid color id' });
        }
        const isValidColor = await Color.find({ _id: { $in: isValidColorIds } });
        if (isValidColor.length !== isValidColorIds.length) {
            return res.status(404).json({ message: 'Color not found' });
        }
        const isValidBrand = await Brand.findById(brand)
        if (!isValidBrand) {
            return res.status(404).json({ message: 'Brand not found' });

        }
        const isValidCategory = await Category.findById(category)
        if (!isValidCategory) {
            return res.status(404).json({ message: 'Category not found' });

        }
        const isStatusValid = await Status.find({ _id: { $in: status, $nin: [null] } });
        if (isStatusValid.length !== status.length) {
            return res.status(404).json({ message: 'Status not found' });
        }
        const isReviewValid = await Review.find({ _id: { $in: reviews, $nin: [null] } });
        if (isReviewValid.length !== reviews.length) {
            return res.status(404).json({ message: 'Review not found' });
        }
        const updateProduct = await Product.findByIdAndUpdate(id, req.body, { new: true }).exec();
        res.status(200).json(updateProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteAProduct = async (req, res) => {
    try {
        const { id } = req.params
        const validId = mongoose.Types.ObjectId.isValid(id)
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' })
        }
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const result = await Product.delete({ _id: id }).exec()
        res.status(200).json({ message: 'Deleted successfully' })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
module.exports = { getAllProducts, getProductById, getAllProductsByFilter, getProductByType, createNewProduct, updateProduct, deleteAProduct }

