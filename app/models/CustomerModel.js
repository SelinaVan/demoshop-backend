const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;

const Customer = new Schema({
    username: { type: String, required: true },
    phone: { type: String, required: true, unique: true, sparse: true, },
    email: { type: String, required: true, unique: true, sparse: true },
    birthday: { type: Date},
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    roles: [{ type: String, default: 'user' }],
    password: String,
    access_token: String,
    refresh_token: String
}, { timestamps: true })

Customer.plugin(mongooseDelete, {
    deletedAt: true,
    deletedBy: true,
    overrideMethods: 'all'
})
// index unique and deleted is false
Customer.index({ phone: 1, deleted: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
Customer.index({ email: 1, deleted: 1 }, { unique: true, partialFilterExpression: { deleted: false } });

Customer.pre('save', async function (next) {
    // Hash the password before saving the customer model
    const customer = this;
    if (customer.isModified('password')) {
        customer.password = await bcrypt.hash(customer.password, 10);
    }
    next();
});

Customer.methods.generateAccessToken = async function () {
    const customer = this;
    const access_token = jwt.sign(
        { _id: customer._id, roles: customer.roles },
        process.env.SECRET_KEY,
        { expiresIn: '1d' }
    );
    customer.access_token = access_token;
    await customer.save();
    return access_token;
};
Customer.methods.generateRefreshToken = async function () {
    const customer = this;
    const refresh_token = jwt.sign({ _id: customer._id }, process.env.REFRESH_TOKEN, { expiresIn: '1w' });
    customer.refresh_token = refresh_token;
    await customer.save();
    return refresh_token;
};
module.exports = mongoose.model('Customer', Customer)