const Order = require('../models/OrderModel');
const Customer = require('../models/CustomerModel');
const OrderDetail = require('../models/OrderDetailModel');
const Product = require('../models/Product');
const Shipping = require('../models/Shipping');
const mongoose = require('mongoose');

//[GET] /orders

const getAllOrder = async (req, res) => {
    try {
        const { page, pageSize, customerName, confirmation } = req.query;

        let orders, total;

        const query = customerName && typeof customerName === "string" && customerName.trim() !== ""
            ? { customerId: { $in: (await Customer.find({ username: new RegExp(customerName.trim(), "i") })).map(item => item._id) } }
            : typeof confirmation === 'string' && confirmation.trim() !== '' ? { confirmation: confirmation } : {}
        // viet tuong minh
        // const regex = new RegExp(customerName.trim(), "i");
        // const customer = await Customer.find({ username: regex });
        // const customerIds = customer.map(item => item._id)
        total = await Order.countDocuments(query);

        orders = await Order.find(query)
            .populate("customerId", "username")
            .sort({ createdAt: -1 })
            .skip(page * pageSize)
            .limit(pageSize)
            .lean();

        if (!orders?.length) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({ data: orders, total });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// get order by day and month
const getOrderSaleByQuery = async (req, res) => {
    try {
        const { startDate, endDate, month } = req.query
   

        const startDayQuery = new Date(startDate)
        startDayQuery.setHours(0, 0, 0, 0)

        const endDateQuery = endDate === '' ? new Date(startDate) : new Date(endDate)
        endDateQuery.setHours(23, 59, 59, 999)

        const orders = await Order.find({
            createdAt: { $gte: startDayQuery, $lt: endDateQuery }
        }).exec()

        const total = orders.length

        res.status(200).json({ total, data: orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}

//[GET] /orders/:id
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params
        const validId = mongoose.Types.ObjectId.isValid(id)
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' })
        }
        const order = await Order.findById(id).populate('customerId', 'username').populate('orderDetails')
        if (!order) {
            return res.status(404).json({ message: 'Id not valid' })
        }
        res.status(200).json(order);

    }
    catch (error) {
        res.status(500).json({ error: error.message });

    }
}
// [PUT] /orders/:id
const updateOrder = async (req, res) => {
    try {
        const { id } = req.params
        const validId = mongoose.Types.ObjectId.isValid(id)
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' })
        }
        const order = await Order.findById(id)
        if (!order) {
            return res.status(404).json({ message: 'Id not valid' })
        }
        const updatedOrder = await Order.findByIdAndUpdate(id, req.body, { new: true }).populate('customerId', 'username').exec()
        res.status(200).json(updatedOrder);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//[GET] /customer/:customerId
const getAllOrderOfCustomer = async (req, res) => {
    try {
        const { customerId } = req.params
        const {page, pageSize, confirmation} = req.query
        const validId = mongoose.Types.ObjectId.isValid(customerId)
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' })
        }
        
        const query = typeof confirmation === 'string' && confirmation.trim().length !== '' ? { confirmation: confirmation } : {}
        const total = await Order.find({ customerId: customerId, ...query }).countDocuments()
        const orderOfCustomer = await Order.find({ customerId: customerId, ...query }).populate({
            path: 'orderDetails',
            populate: {
                path: 'product',
                populate: {
                    path: 'color',
                },
            },
        }).sort({ createdAt: -1 }).skip(page * pageSize).limit(pageSize)
        
        // const orders = orderOfCustomer.orders
        if (!orderOfCustomer) {
            return res.status(404).json({ message: 'Customer not found' })
        }
        res.status(200).json({ data: orderOfCustomer, total })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// [POST] /orders
const createOrderOfCustomer = async (req, res) => {
    try {
        const { shippingType, note, cost, username, phone, email, birthday, address, city, country,  receiver = {}, orderDetails = [] } = req.body;

        let query = {};
        // if (email && phone) {
        //     query = { $or: [{ email: email }, { phone: phone }] };
        // }
        if (email) {
            query.email = email;
        } else if (phone) {
            query.phone = phone;
        } else {
            return res.status(400).json({ message: 'Email or phone is required' });
        }
        let customerInfo = { username, phone, email, address, city, country, birthday, roles:['user'] };  

        // Find the existing customer
        let existingCustomer = await Customer.findOne(query).exec();
        if (existingCustomer && existingCustomer.username !== username) {
            return res.status(400).json({ message: `Customer with email ${email} already existed` })
        }
        if (!existingCustomer) {
            // If the customer does not exist, create a new customer
            existingCustomer = await Customer.create(customerInfo);
        }
        
        // if (existingCustomer &&  existingCustomer.phone !== phone) {
        //     return res.status(400).json({ message: `Customer with phone number: ${phone} already existed` })
        // }
        // remove auto update customer information, just update shipping infomation
        // const { email: removedEmail, ...updatedCustomerInfo } = customerInfo;
        // else {
        //     // If the customer already exists, update the customer info
        //     // const validPwd = await bcrypt.compare(password, existingCustomer.password )
        //     await Customer.updateOne(query, { $set: updatedCustomerInfo }).exec();
        // }

        // const shippedDateFormat = new Date(Date.parse(shippedDate));
        if (cost !== undefined && !(typeof cost === 'number' && cost > 0)) {
            return res.status(400).json({ message: 'Cost must be number and greater than 0' })
        }
        if (!shippingType) {
            return res.status(400).json({ message: 'Shipping type is request' })

        }
        let isValidShippingId = mongoose.Types.ObjectId.isValid(shippingType)
        if (!isValidShippingId) {
            return res.status(400).json({ message: 'Id of shipping not valid' })
        }
        const shippingTypeObj = await Shipping.findById(shippingType).select('day').exec();

        if (!shippingTypeObj) {
            return res.status(404).json({ message: 'Shipping type not found' });
        }

        // Calculate the estimated delivery date based on the selected shipping type
        const today = new Date();
        const estimatedDeliveryDate = new Date(today.getTime() + (shippingTypeObj.day * 24 * 60 * 60 * 1000));
        // priority of query is email then phone

       
        // order detail is array, check if don't exist return 400
        if (!orderDetails?.length) {
            return res.status(400).json({ message: "Missing order detail" })
        }
       
        // Create an array of order detail objects with product and quantity properties
        const createOrderDetail = orderDetails.map(async (order) => {
            // Check if the product exists
            const product = await Product.findById(order.product);
            if (!product) {
                throw new Error(`Product with ID ${order.product} does not exist`);
            }
            if (product.amount < order.quantity) {
                throw new Error(`Not enough stock, stock: ${product.amount}`);
            }
            let deductProdStock = await Product.findByIdAndUpdate(order.product, { $inc: { amount: -order.quantity } }, { new: true }).exec()
            if (deductProdStock.amount < 0) {
                deductProdStock.amount = 0
                await deductProdStock.save()
            }
            // Create the order detail object
            return { product, quantity: order.quantity };
            
        });
        // Wait for all the order detail objects to be created
        const orderDetailObjects = await Promise.all(createOrderDetail);

        // Create an array of promises to create the order details
        const orderDetailPromises = orderDetailObjects.map(orderDetail => OrderDetail.create(orderDetail));

        // Wait for all the order details to be created
        const orderDetailSaved = await Promise.all(orderDetailPromises);
      
        const order = new Order({ shippedDate: estimatedDeliveryDate, note, cost, orderDetails: orderDetailSaved, receiver, customerId: existingCustomer._id });
        await Order.populate(order, { path: 'orderDetails', select: 'product._id quantity' });
        await order.save();
        existingCustomer.orders.push(order._id);
        await existingCustomer.save();

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// [DELETE] /:id
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Provide email to delete order' })

        }
        const customer = await Customer.findOne({ email })
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })

        }
        const validOrderId = mongoose.Types.ObjectId.isValid(id)
        if (!validOrderId) {
            return res.status(400).json({ message: 'Order id not valid' })
        }

        const order = await Order.findById(id)
        const orderDetailIds = order.orderDetails.map(orderDetail => orderDetail._id)

        if (!order) {
            return res.status(404).json({ message: 'Order not found' })
        }
        const customerDeleted = await Customer.findByIdAndUpdate(customer._id, { $pull: { orders: id } }).exec()
        const orderDeleted = await Order.delete({ _id: id }).exec()
        const orderDetailsDeleted = await OrderDetail.deleteMany({ _id: { $in: orderDetailIds } }).exec()
        res.status(200).json({ message: 'Deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getAllOrder, getOrderById, updateOrder, deleteOrder, getAllOrderOfCustomer, createOrderOfCustomer, getOrderSaleByQuery };
