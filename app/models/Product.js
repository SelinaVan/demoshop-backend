const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const Product = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: Schema.Types.ObjectId, ref: 'ProductType', required: true },
    imageUrl: { type: String, required: true },
    buyPrice: { type: Number, required: true },
    promotionPrice: { type: Number },
    amount: { type: Number, default: 0 },
    color: [{type: Schema.Types.ObjectId, ref: 'Color', required: true}],
    category: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true}],
    status: [{ type: Schema.Types.ObjectId, ref: 'Status', required: true }],
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true},
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }]


}, { timestamps: true })

Product.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' })
module.exports = mongoose.model('Product', Product)