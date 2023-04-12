const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const Order = new Schema({
    orderId: {type: Number, unique: true, default: () => Math.floor(Math.random() * 10000 + 90000)},
    orderDate: { type: Date, default: Date.now() },
    shippedDate: { type: String},
    note: { type: String },
    cost: { type: Number },
    orderDetails: [{ type: Schema.Types.ObjectId, ref: 'OrderDetail' }],
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    confirmation: { type: String, default: 'pending' },
    receiver: {
        username: String,
        phone: String,
        country: String,
        city: String,
        address: String
    }

}, { timestamps: true })

Order.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all'
})
module.exports = mongoose.model('Order', Order)