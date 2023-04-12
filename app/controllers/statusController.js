const Status = require('../models/Status')

const getAllStatus = async (req, res) => {
    try {
        const { statusName } = req.query
        let statuses;
        const query = statusName && typeof statusName === 'string' && statusName?.trim().length
            ? { name: new RegExp(statusName.trim(), 'i') } : {}

        statuses = await Status.find(query).sort({createdAt: -1}).select('-deleted')
        res.status(200).json(statuses)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
const createNewStatus = async (req, res) => {
    try {
        const status = new Status(req.body)
        await status.save()

        res.status(200).json(status)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params

        const status = await Status.findById(id)
        if (!status) {
            return res.status(404).json({ message: 'Status not found' })
        }
        const response = await Status.findByIdAndUpdate(id, req.body, { new: true }).exec()

        res.status(200).json(response)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
const deleteStatus = async (req, res) => {
    try {
        const { id } = req.params
        const status = await Status.findById(id)
        if (!status) {
            return res.status(404).json({ message: 'Status not found' })
        }
        await status.delete()
        res.status(200).json({ message: 'Deleted succeffully' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

module.exports = { getAllStatus, createNewStatus, updateStatus, deleteStatus }