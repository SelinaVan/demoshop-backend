const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const Shipping = new Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    day: Number,
    note: String

}, { timestamps: true })

Shipping.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' })
module.exports = mongoose.model('Shipping', Shipping)
