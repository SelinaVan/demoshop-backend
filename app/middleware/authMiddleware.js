const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ip = require('ip');

const verifyUserAuth = async (req, res, next) => {
    // console.log('IP', ip.address())
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Access token is required' });
    }
    const access_token = authHeader.replace('Bearer ', '')
    try {
        const data = jwt.verify(access_token, process.env.SECRET_KEY_ADMIN);
        console.log('data: ', data);
        if (!data.roles.includes('user') && !data.roles.includes('admin') && !data.roles.includes('super admin')) {
            return res.status(403).json({ error: "You don't have permission to access" });
        }
        const user = await User.findById(data._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        req.user = user;
        req.access_token = access_token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Failed to authenticate token' });
    }
};
const verifyAdmin = async (req, res, next) => {
    // console.log('IP', ip.address())
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Access token is required' });
    }
    const access_token = authHeader.replace('Bearer ', '')
    try {
        const data = jwt.verify(access_token, process.env.SECRET_KEY_ADMIN);
        console.log('data: ', data);

        if (!data.roles.includes('admin') && !data.roles.includes('super admin')) {
            return res.status(403).json({ error: "You don't have permission to access" });
        }
        const user = await User.findById(data._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        req.user = user;
        req.access_token = access_token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Failed to authenticate token' });
    }
};
const verifySuperAdmin = async (req, res, next) => {
    // console.log('IP', ip.address())
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ error: 'Access token is required' });
    }
    const access_token = authHeader.replace('Bearer ', '')
    try {
        const data = jwt.verify(access_token, process.env.SECRET_KEY_ADMIN);
        console.log('data: ', data);
        console.log('role', data.roles.includes('super admin'))
        if (!data.roles.includes('super admin')) {
            return res.status(403).json({ error: "You don't have permission to access" });
        }
        const user = await User.findById(data._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        req.user = user;
        req.access_token = access_token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Failed to authenticate token' });
    }
};
module.exports = { verifyUserAuth, verifyAdmin, verifySuperAdmin };
