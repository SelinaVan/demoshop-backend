const Brand = require('../models/Brand')

const getAllBrands = async(req, res) => {
    try{
        const { brandName } = req.query
        let brands
        const query = brandName && typeof brandName === 'string' && brandName?.trim().length
            ? { name: new RegExp(brandName.trim(), 'i') } : {}
        
        brands = await Brand.find(query).sort({createdAt: -1}).select('-deleted')
        res.status(200).json(brands)
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}
const createNewBrand = async(req, res) => {
    try {
        const brand = new Brand(req.body)
        await brand.save()

        res.status(200).json(brand)
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}
const updateBrand = async(req, res) => {
    try {
        const { id } = req.params
        const brand = await Brand.findById(id)
        if (!brand) {
            return res.status(404).json({message: 'Brand not found'})
        }
       const reponse = await Brand.findByIdAndUpdate(id, req.body, {new: true}).exec()
        res.status(200).json(reponse)
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}
const deleteBrand = async(req, res) => {
    try{
        const { id } = req.params
        const brand = await Brand.findById(id)
        if (!brand) {
            return res.status(404).json({ message: 'Brand not found' })
        }
        await brand.delete()
        res.status(200).json({message: 'Deleted succeffully'})
    }catch(err) {
        res.status(500).json({error: err.message})
    }
}

module.exports = { getAllBrands, createNewBrand, updateBrand, deleteBrand }