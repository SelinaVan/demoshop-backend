const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const Color = new Schema({
    name: { type: String, required: true, unique: true },

}, { timestamps: true })

Color.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' })
module.exports = mongoose.model('Color', Color)