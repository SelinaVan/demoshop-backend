const Color = require('../models/Color')

const getAllColor = async(req, res) => {
    try{
        const { colorName } = req.query
        let colors;
        const query = colorName && typeof colorName === 'string' && colorName?.trim().length
            ? { name: new RegExp(colorName.trim(), 'i') } : {}
        
        colors = await Color.find(query).sort({createdAt: -1}).select('-deleted')
        res.status(200).json(colors)
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}
const createNewColor = async(req, res) => {
    try {
        const color = new Color(req.body)
        await color.save()

        res.status(200).json(color)
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}
const updateColor = async(req, res) => {
    try {
        const { id } = req.params
        const color = await Color.findById(id)
        if (!color) {
            return res.status(404).json({message: 'Color not found'})
        }
        const response = await Color.findByIdAndUpdate(id, req.body, { new: true }).exec()
        res.status(200).json(response)
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}
const deleteColor = async(req, res) => {
    try{
        const { id } = req.params
        const color = await Color.findById(id)
        if (!color) {
            return res.status(404).json({ message: 'Color not found' })
        }
        await color.delete()
        res.status(200).json({message: 'Deleted succeffully'})
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}

module.exports = { getAllColor, createNewColor, updateColor, deleteColor }