const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');


const Schema = mongoose.Schema;

const User = new Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: {
        type: String, required: true, unique: true, lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({ error: 'Invalid email' })
            }
        }
    },
    phone: { type: String, required: true, unique: true, sparse: true, },
    birthday: { type: Date },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    password: { type: String, required: true, minLength: 7 },
    roles: [{ type: String, default: 'user' }],
    confirmation: {type: String, default: 'pending'},
    access_token: String,
    refresh_token: String
}, { timestamps: true })

User.plugin(mongooseDelete, {
    deletedAt: true,
    deletedBy: true,
    overrideMethods: 'all'
})
// index unique and deleted is false
User.index({ phone: 1, deleted: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
User.index({ email: 1, deleted: 1 }, { unique: true, partialFilterExpression: { deleted: false } });

User.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
});

User.methods.generateUserAccessToken = async function () {
    const user = this;
    const access_token = jwt.sign(
        { _id: user._id, roles: user.roles },
        process.env.SECRET_KEY_ADMIN,
        { expiresIn: '1d' }
    );
    user.access_token = access_token;
    await user.save();
    return access_token;
};
User.methods.generateUserRefreshToken = async function () {
    const user = this;
    const refresh_token = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_ADMIN, { expiresIn: '1w' });
    user.refresh_token = refresh_token;
    await user.save();
    return refresh_token;
};
module.exports = mongoose.model('User', User)