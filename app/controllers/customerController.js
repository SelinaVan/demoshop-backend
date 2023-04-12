const Customer = require('../models/CustomerModel');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//[GET] /customers
const getAllCustomer = async (req, res) => {
    try {
        const { page, pageSize, customerName } = req.query
        let customers, total

        const query = customerName && typeof customerName === 'string' && customerName?.trim().length
            ? { username: new RegExp(customerName.trim(), 'i') } : {}
        
        total = await Customer.countDocuments(query)

        customers = await Customer.find(query)
            .sort({ createdAt: -1 })
            .skip(page * pageSize)
            .limit(pageSize)
            .select('-password -deleted')

        if (!customers?.length) {
            return res.status(404).json({ message: 'Customer not found' })
        }
       
        res.status(200).json({ customers, total })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// [GET] // only total of customer
const getTotalCustomer = async (req, res) => {
    try {
        const total = await Customer.countDocuments()
        res.status(200).json(total)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//[GET] /customers/:id
const getCustomerByID = async (req, res) => {
    try {
        const { id } = req.params;
        const validId = mongoose.Types.ObjectId.isValid(id)
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' })
        }
        const customer = await Customer.findById(id).select('-password')
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' })
        }
        res.status(200).json(customer)
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// [GET] /customer/phone
const getCustomerByPhone = async (req, res) => {
    try {
        const { phone } = req.body;
        const customer = await Customer.findOne({phone}).select('-password')
        if (!customer) {
            return res.status(404).json({ message: "This phone haven't register yet" })
        }
        res.status(200).json(customer)
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// [GET] /customers/me
const getPersitCustomerLogin = async (req, res) => {
    try {
        const { customer } = req;
        const newCustomer = customer.toObject()
        delete newCustomer.password;
        delete newCustomer.deleted;
        return res.status(200).json(newCustomer);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
// [POST] customers/me/login
const getAuthCustomerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const customer = await Customer.findOne({ email })
        if (!customer) {
            return res.status(404).json({ message: 'Customer not existed in the system' })
        }

        const isValidPwd = await bcrypt.compare(password, customer.password)
        if (!isValidPwd) {
            return res.status(401).json({ message: 'Wrong password' })
        }
        const access_token = await customer.generateAccessToken()
        const refresh_token = await customer.generateRefreshToken()
        const data = customer.toObject()
        delete data.password;
        delete data.deleted;

        res.status(200).json({ data })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// [POST] /customers
const createCustomer = async (req, res) => {
    try {
        const { username, phone, email, password, address, city, country, roles } = req.body;

        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            return res.status(400).json({ message: "Username is required and must be a non-empty string" });
        }
        if (!phone || !(typeof phone === 'string' && phone.trim().length > 0)) {
            return res.status(400).json({ status: 400, message: 'Phone is required and must be string' })
        }
        if (!email || !(typeof email === 'string' && email.trim().length > 0)) {
            return res.status(400).json({ status: 400, message: 'Email is required and must be string' })
        }
        if (!password || !( password.trim().length > 0)) {
            return res.status(400).json({ status: 400, message: 'Password is required ' })
        }
        if (address !== undefined && !(typeof address === 'string' && address.trim().length > 0)) {
            return res.status(400).json({ status: 400, message: 'Address must be string' })
        }
        if (city !== undefined && !(typeof city === 'string' && city.trim().length > 0)) {
            return res.status(400).json({ status: 400, message: 'Country must be string' })
        }
        if (country !== undefined && !(typeof country === 'string' && country.trim().length > 0)) {
            return res.status(400).json({ status: 400, message: 'City must be string' })
        }
        const isCustomerDuplicated = await Customer.findOne({ email, deleted: false })

        if (isCustomerDuplicated) {
            return res.status(409).json({ message: 'Duplicated customer email' })
        }
        const isPhoneDuplicated = await Customer.findOne({ phone, deleted: false })
        console.log('isPhoneDuplicated: ', isPhoneDuplicated);

        if (isPhoneDuplicated) {
            return res.status(409).json({ message: 'Duplicated customer phone' })
        }
        const customer = new Customer({ ...req.body, roles: roles || ['user'] })
        const access_token = await customer.generateAccessToken()
        const refresh_token = await customer.generateRefreshToken()
        await customer.save()
        
        const newCustomer = customer.toObject()
        delete newCustomer.password;
        delete newCustomer.deleted;
        res.status(201).json( newCustomer )

    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({ error: error.message });
    }
}

// [PUT] /customers/:id
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params
        const { email, phone } = req.body;
        const validId = mongoose.Types.ObjectId.isValid(id)
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' })
        }
        for (let props in req.body) {
            let prop = req.body[props]
            if (prop !== undefined && !(typeof prop === 'string' && prop.trim().length > 0)) {
                delete req.body[props]
            }
            if (props === 'roles') {
                if (!Array.isArray(prop)) {
                    prop = [prop] // convert to array if it's a string
                }
                req.body[props] = prop
            }
        }
        let updatedCustomer = await Customer.findById(id)
        if (!updatedCustomer) {
            return res.status(404).json({ message: 'Customer not found' })
        }
        if (email && email !== updatedCustomer.email) {
            const isCustomerDuplicated = await Customer.findOne({ email })
            if (isCustomerDuplicated) {
                return res.status(409).json({ message: 'Duplicated customer email' })
            }
        }
        if (phone && phone !== updatedCustomer.phone) {
            const isPhoneDuplicated = await Customer.findOne({ phone })
            if (isPhoneDuplicated) {
                return res.status(409).json({ message: 'Duplicated customer phone' })
            }
        }
        updatedCustomer = await Customer.findByIdAndUpdate(id, req.body, { new: true }).select('-password').exec()
        res.status(200).json(updatedCustomer);


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// [DELETE] /customers/:id
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params
        const validId = mongoose.Types.ObjectId.isValid(id)
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' })
        }

        let deletedCustomer = await Customer.findById(id)
        if (!deletedCustomer) {
            return res.status(404).json({ message: 'Customer not found' })
        }
        deletedCustomer = await Customer.delete({ _id: id }).exec()
        res.status(200).json({ message: 'Deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// [POST] /me/logout
const logoutCustomerFromOneDevice = async (req, res) => {
    try {
        req.customer.access_token = null;
        req.customer.refresh_token = null;
        await req.customer.save()
        res.status(200).json({ message: 'Logout successfully' })
    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}

module.exports = {
    deleteCustomer, getAllCustomer, getCustomerByID, createCustomer, updateCustomer, getCustomerByPhone,
    getPersitCustomerLogin, getAuthCustomerLogin, logoutCustomerFromOneDevice,
    getTotalCustomer
};