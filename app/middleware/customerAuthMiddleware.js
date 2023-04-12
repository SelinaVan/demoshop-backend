const jwt = require('jsonwebtoken');
const Customer = require('../models/CustomerModel');
const ip = require('ip');

const customerAuth = async (req, res, next) => {
    console.log('IP', ip.address())
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Access token is required' });
    }
    const access_token = authHeader.replace('Bearer ', '')
    try {
        const data = jwt.verify(access_token, process.env.SECRET_KEY);
        
        const customer = await Customer.findById(data._id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        req.customer = customer;
        req.access_token = access_token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Failed to authenticate token' });
    }
};
const verifyAdmin = async (req, res, next) => {
    console.log('IP', ip.address())
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Access token is required' });
    }
    const access_token = authHeader.replace('Bearer ', '')
    try {
        const data = jwt.verify(access_token, process.env.SECRET_KEY);

        if (!data.roles.includes('admin') && !data.roles.includes('super admin')) {
            return res.status(403).json({ error: "You don't have permission to access" });
        }
        const customer = await Customer.findById(data._id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        req.customer = customer;
        req.access_token = access_token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Failed to authenticate token' });
    }
};
const verifySuperAdmin = async (req, res, next) => {
    console.log('IP', ip.address())
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Access token is required' });
    }
    const access_token = authHeader.replace('Bearer ', '')
    try {
        const data = jwt.verify(access_token, process.env.SECRET_KEY);

        if (!data.roles.includes('super admin')) {
            return res.status(403).json({ error: "You don't have permission to access" });
        }
        const customer = await Customer.findById(data._id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        req.customer = customer;
        req.access_token = access_token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Failed to authenticate token' });
    }
};
module.exports = { customerAuth, verifyAdmin, verifySuperAdmin };
