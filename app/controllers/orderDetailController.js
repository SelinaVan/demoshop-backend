const OrderDetail = require('../models/OrderDetailModel')
const Order = require('../models/OrderModel');
const mongoose = require('mongoose');

// [GET] GET ALL ORDER DETAIL
const getAllOrderDetail = async (req, res) => {
    try {
        const orderDetail = await OrderDetail.find().select('-deleted').populate({
            path: 'product',
            populate:{path: 'type'}
        })
        if (!orderDetail?.length) {
            return res.status(404).json({ message: 'No order detail found'})
        }
        res.status(200).json(orderDetail)
    }catch(error){
        res.status(500).json({error: error.message})
    }
}
//[GET] /:id
const getOrderDetailById = async (req, res) => {
    try {
        const ids = req.body
        const validId = ids.filter(id => mongoose.Types.ObjectId.isValid(id))
        if (validId.length !== ids.length) {
            return res.status(400).json({ message: 'Id not valid' })
        }

        const orderDetail = await OrderDetail.find({ _id: { $in: ids } }).populate('product')
        if(orderDetail.length !== validId.length){
            return res.status(404).json({message: 'Order detail not found'})
        }
        res.status(200).json(orderDetail)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// [PUT] /:id
const updateOrderDetail = async (req, res) =>  {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        const validId = mongoose.Types.ObjectId.isValid(id)
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' })
        }

        const orderDetail = await OrderDetail.findById(id)
        if (!orderDetail) {
            return res.status(404).json({ message: 'Order detail not found' })
        }
        if (quantity !== undefined && !(Number.isInteger(quantity) && quantity > 0)) {
            return res.status(400).json({ status: 400, message: 'Quantity  must be number' })
        }
        const updatedOrder = await OrderDetail.findByIdAndUpdate(id, req.body, { new: true }).exec()
        
        res.status(200).json(updatedOrder)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
//[GET] order/:orderId/
const getAllOrderDetailOfOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const validId = mongoose.Types.ObjectId.isValid(orderId)
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' })
        }

        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: 'Order not found' })
        }

        const allOrderDetailOfOrder = await Order.findById(orderId).populate('orderDetails', '_id').exec()
        if (!allOrderDetailOfOrder || !allOrderDetailOfOrder.orderDetails.length) {
            return res.status(404).json({ message: 'No order detail found' })
        }

        res.status(200).json(allOrderDetailOfOrder)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
// [POST] create order detail directly in order controller

// [DELETE] order/:orderId/order-detail/:id
const deleteOrderDetail = async (req, res) => {
    try {
        const { orderId , id} = req.params;

        const validId = mongoose.Types.ObjectId.isValid(orderId)
        const validOrderId = mongoose.Types.ObjectId.isValid(id)
        if (!validId || !validOrderId) {
            return res.status(400).json({ message: 'Order id not valid' })
        }
        const isValidOrder = await Order.findOne({ _id: orderId, orderDetails: { $in: id } }).exec()
        if(!isValidOrder) {
            return res.status(404).json({ message: 'Order detail not belong order'})
        }
        const deletedOrder = await Order.findByIdAndUpdate(orderId, { $pull: { orderDetails: id } }).exec()
        const deletedOrderDetail = await OrderDetail.delete({ _id: id }).exec()

        res.status(200).json({ message: 'Deleted successfully'})

    }
    catch(error){
        res.status(500).json({error: error.message});
    }

}


module.exports = { deleteOrderDetail, getOrderDetailById, updateOrderDetail, getAllOrderDetailOfOrder, getAllOrderDetail };