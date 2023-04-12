const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const Review = new Schema({
    note: { type: String},
    rating: { type: Number, default: 5 }

}, { timestamps: true })

Review.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' })
module.exports = mongoose.model('Review', Review)