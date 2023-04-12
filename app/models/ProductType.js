const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const ProductType = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String }

}, { timestamps: true })

ProductType.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' })
module.exports = mongoose.model('ProductType', ProductType)