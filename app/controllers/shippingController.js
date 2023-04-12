const Shipping = require('../models/Shipping')

const getAllShipping = async(req, res) => {
    try{
        const { shippingName } = req.query
        let shippings;
        const query =  shippingName && typeof shippingName === 'string' && shippingName?.trim().length
            ? { name: new RegExp(shippingName.trim(), 'i') } : {};
        
        shippings = await Shipping.find(query).sort({createdAt: -1}).select('-deleted')
        if (!shippings?.length) {
            return res.status(200).json(null)
        }
        res.status(200).json(shippings)
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}
const createNewShipping = async(req, res) => {
    try {
        const { name, price, note } = req.body
        if (!name?.trim().length ) {
            return res.status(400).json({message: 'name are required'})
        }
        if (isNaN(price) || Number(price) < 0) {
            return res.status(400).json({ message: 'Price is a number and greater than 0' })
        }
        
        const shipping = new Shipping(req.body)
        await shipping.save()

        res.status(200).json(shipping)
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}
const updateShipping = async(req, res) => {
    try {
        const { id } = req.params
        const { name, price, note } = req.body
        console.log('name, price: ', name, price);
        if (name && !name?.trim().length || typeof name !== 'string')  {
            return res.status(400).json({ message: 'name must be a string' })
        }
        if (price && isNaN(price) || Number(price) < 0) {
            return res.status(400).json({ message: 'Price is a number and greater than 0' })
        }
        const shipping = await Shipping.findById(id)
        if (!shipping) {
            return res.status(404).json({message: 'Shipping not found'})
        }
        const response = await Shipping.findByIdAndUpdate(id, req.body, { new: true }).exec()
        res.status(200).json(response)
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}
const deleteShipping = async(req, res) => {
    try{
        const { id } = req.params
        const shipping = await Shipping.findById(id)
        if (!shipping) {
            return res.status(404).json({ message: 'Shipping not found' })
        }
        await shipping.delete()
        res.status(200).json({message: 'Deleted succeffully'})
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}

module.exports = { getAllShipping, createNewShipping, updateShipping, deleteShipping }