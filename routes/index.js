const productRouter = require('./product');
const productTypeRouter = require('./productType');
const usersRouter = require('./users');
const brandRouter = require('./brand');
const categoryRouter = require('./category');
const colorRouter = require('./color');
const statusRouter = require('./status');
const shippingRouter = require('./shipping');``
// const orderRouter = require('./order');
const customerRouter = require('./customerRouter');
// const orderDetailRouter = require('./orderDetailRouter');
const orderRouter = require('./orderRouter');
const uploadRouter = require('./upload');
const todoRouter = require('./todo');


function router(app) {
    app.use('/api/products', productRouter)
    app.use('/api/users', usersRouter)
    app.use('/api/brands', brandRouter)
    app.use('/api/categories', categoryRouter)
    app.use('/api/colors', colorRouter)
    app.use('/api/statuses', statusRouter)
    app.use('/api/shipping', shippingRouter)
    app.use('/api/orders', orderRouter)
    app.use('/api/product_type', productTypeRouter)
    app.use('/api/customers', customerRouter)

    app.use('/api/upload', uploadRouter)
    app.use('/api/todos', todoRouter)

}
// app.use('/api/order_detail', orderDetailRouter)
module.exports = router