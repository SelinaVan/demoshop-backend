const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const Status = new Schema({
    name: { type: String, required: true, unique: true },

}, { timestamps: true })

Status.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' })
module.exports = mongoose.model('Status', Status)