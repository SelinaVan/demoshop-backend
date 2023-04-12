const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const Brand = new Schema({
    name: { type: String, required: true, unique: true },

}, { timestamps: true })

Brand.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' })
module.exports = mongoose.model('Brand', Brand)