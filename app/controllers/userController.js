// const User = require('../models/User');
// const mongoose = require('mongoose')
// const bcrypt = require('bcrypt');

// const getAllUsers = async (req, res) => {
//     try {
//         const users = await User.find({}).select('-password -deleted').lean()
//         if (!users?.length) {
//             return res.status(404).json({ message: "No user found" })
//         }
//         return res.status(200).json(users)
//     } catch (err) {
//         res.status(500).json(err.message)
//     }
// }

// const getUserLogin = async (req, res) => {
//     try {
//         const { user } = req;
//         const newUser = user.toObject()
//         delete newUser.password;
//         delete newUser.deleted;
//         delete newUser.tokens;
//         return res.status(200).json(newUser);
//     } catch (err) {
//         return res.status(500).json({ error: err.message });
//     }
// }
// const getAuthUserLogin = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email })
//         if (!user) {
//             return res.status(404).json({ message: 'User not existed in the system' })
//         }

//         const isValidPwd = await bcrypt.compare(password, user.password)
//         if (!isValidPwd) {
//             return res.status(401).json({ message: 'Wrong password' })
//         }
//         const token = await user.generateAuthToken()
//         const newUser = user.toObject()
//         delete newUser.password;
//         delete newUser.deleted;
//         delete newUser.tokens;
//         res.status(200).json({ newUser, token })
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// }

// const createNewUser = async (req, res) => {
//     try {
//         const { username, email, password, roles } = req.body;
//         if (!username?.trim().length || !email?.trim().length || !password?.trim().length) {
//             return res.status(400).json({ message: 'All field are required' })
//         }
//         const duplicateUserName = await User.findOne({ username })
//         if (duplicateUserName) {
//             return res.status(409).json({ message: 'Duplicate username' })
//         }
//         const duplicateEmail = await User.findOne({ email })
//         if (duplicateEmail) {
//             return res.status(409).json({ message: 'Duplicate email' })

//         }
//         const user = new User({ ...req.body, roles: roles || ['user'] })
//         const token = await user.generateAuthToken()
//         await user.save()

//         const newUser = user.toObject()
//         delete newUser.password;
//         delete newUser.deleted;
//         delete newUser.tokens;
//         res.status(201).json({ newUser, token })

//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// }

// const updatedUser = async (req, res) => {
//     try {
//         const { id } = req.params
//         const { username, password, newPassword } = req.body

//         const validId = mongoose.Types.ObjectId.isValid(id)
//         if (!validId) {
//             return res.status(400).json({ message: 'Id not valid' })
//         }
//         if (!id?.length || !password?.trim().length) {
//             return res.status(400).json({ message: 'All field are required' })
//         }
//         const user = await User.findById(id)
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' })
//         }

//         const isValidPwd = await bcrypt.compare(password, user.password)
//         if (!isValidPwd) {
//             return res.status(401).json({ message: 'Wrong password' })
//         }
//         // allow update to original username
//         const duplicate = await User.findOne({ username }).lean().exec()
//         if (duplicate && duplicate?._id.toString() !== id) {
//             return res.status(409).json({ message: 'Duplicated username' })
//         }
//         user.username = username;
//         if (newPassword) {
//             user.password = await bcrypt.hash(newPassword, 10)
//         }
//         const updateUser = await user.save()
//         const updateUserObj = updateUser.toObject()
//         delete updateUserObj.password
//         delete updateUserObj.deleted

//         res.status(200).json(updateUserObj)
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// }

// const deleteUser = async (req, res) => {
//     try {
//         const { id } = req.params
//         if (!id) {
//             return res.status(400).json({ message: 'Id is required' })
//         }
//         const validId = mongoose.Types.ObjectId.isValid(id)
//         if (!validId) {
//             return res.status(400).json({ message: 'Id not valid' })
//         }
//         const user = await User.findById(id)
//         if (!user) {
//             return res.status(404).json({ message: 'User not existed in the system' })
//         }
//         const deletedUser = await User.delete({ _id: id }).exec()
//         res.status(200).json({ message: `User id ${id} already deleted` })
//     }
//     catch (err) {
//         res.status(500).json({ error: err.message })
//     }
// }

// const logoutUserFromOneDevice = async (req, res) => {
//     try {
//         req.user.tokens = req.user.tokens.filter(token => {
//             return token.token != req.token
//         })
//         await req.user.save()
//         res.status(200).json({ message: 'Logout successfully' })
//     }
//     catch (err) {
//         res.status(500).json({ error: err.message })
//     }
// }
// const logoutUserFromAllDevice = async (req, res) => {
//     try {
//         req.user.tokens.splice(0, req.user.tokens.length)
//         await req.user.save()
//         res.status(200).json({ message: 'Logout successfully' })
//     }
//     catch (err) {
//         res.status(500).json({ error: err.message })
//     }
// }
// const refeshToken = async (req, res) => {
//     try {
//         const token = req.token;
//         console.log('token: ', token);
//         const user = req.user;
//         const newToken = await user.generateAuthToken();
//         user.tokens = user.tokens.filter(t => t.token !== token)
//         user.tokens.push({ token: newToken });

//         await user.save();

//         res.status(200).json({ token: newToken });
//     } catch (err) {
//         res.status(500).json({ error: err.message })
//     }
// }
// module.exports = {
//     createNewUser, getAuthUserLogin, updatedUser, deleteUser, getAllUsers,
//     logoutUserFromOneDevice, logoutUserFromAllDevice, refeshToken, getUserLogin
// }
const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//[GET] /Users
const getAllUsers = async (req, res) => {
    try {
        const { page, pageSize, username, confirmation } = req.query
        console.log('req.query: ', req.query);
        let users, total

        const query = username && typeof username === 'string' && username?.trim().length
            ? { username: new RegExp(username.trim(), 'i') }
            : typeof confirmation === 'string' && confirmation.trim() !== ''
                ? { confirmation: confirmation }
                : {}

        total = await User.countDocuments(query)

        users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(page * pageSize)
            .limit(pageSize)
            .select('-password -deleted')

        if (!users?.length) {
            return res.status(404).json({ message: 'User not found' })
        }

        res.status(200).json({ users, total })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//[GET] /Users/:id
const getUserByID = async (req, res) => {
    try {
        const { id } = req.params;
        const validId = mongoose.Types.ObjectId.isValid(id)
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' })
        }
        const user = await User.findById(id).select('-password')
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
        res.status(200).json(user)
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// [GET] /User/phone
const getUserByPhone = async (req, res) => {
    try {
        const { phone } = req.body;
        const user = await User.findOne({ phone }).select('-password')
        if (!user) {
            return res.status(404).json({ message: "This phone haven't register yet" })
        }
        res.status(200).json(user)
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// [GET] /Users/me
const getPersitUserLogin = async (req, res) => {
    try {
        const { user } = req;
        const newUser = user.toObject()
        delete newUser.password;
        delete newUser.deleted;
        return res.status(200).json(newUser);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
// [POST] Users/me/login
const getAuthUserLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: 'User not existed in the system' })
        }

        const isValidPwd = await bcrypt.compare(password, user.password)
        if (!isValidPwd) {
            return res.status(401).json({ message: 'Wrong password' })
        }
        const access_token = await user.generateUserAccessToken()
        const refresh_token = await user.generateUserRefreshToken()
        const data = user.toObject()
        delete data.password;
        delete data.deleted;

        res.status(200).json(data)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// [POST] /Users
const createUser = async (req, res) => {
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
        if (!password || !(password.trim().length > 0)) {
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
        const isUserDuplicated = await User.findOne({ email, deleted: false })

        if (isUserDuplicated) {
            return res.status(409).json({ message: 'Duplicated User email' })
        }
        const isPhoneDuplicated = await User.findOne({ phone, deleted: false })
        if (isPhoneDuplicated) {
            return res.status(409).json({ message: 'Duplicated User phone' })
        }
        const isUsernameDuplicated = await User.findOne({ username, deleted: false })
        if (isUsernameDuplicated) {
            return res.status(409).json({ message: 'Duplicated username' })
        }
        const user = new User({ ...req.body, roles: roles || ['user'] })
        const access_token = await user.generateUserAccessToken()
        const refresh_token = await user.generateUserRefreshToken()
        await user.save()

        const newUser = user.toObject()
        delete newUser.password;
        delete newUser.deleted;
        res.status(201).json(newUser)

    } catch (error) {
        console.log('error: ', error);
        res.status(500).json({ error: error.message });
    }
}

// [PUT] /Users/:id
const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const { email, phone } = req.body;
        console.log('req.body: ', req.body);
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
        let updatedUser = await User.findById(id)
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' })
        }
        if (email && email !== updatedUser.email) {
            const isUserDuplicated = await User.findOne({ email })
            if (isUserDuplicated) {
                return res.status(409).json({ message: 'Duplicated User email' })
            }
        }
        if (phone && phone !== updatedUser.phone) {
            const isPhoneDuplicated = await User.findOne({ phone })
            if (isPhoneDuplicated) {
                return res.status(409).json({ message: 'Duplicated User phone' })
            }
        }
        updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true }).select('-password').exec()
        res.status(200).json(updatedUser);


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// [DELETE] /Users/:id
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        const validId = mongoose.Types.ObjectId.isValid(id)
        if (!validId) {
            return res.status(400).json({ message: 'Id not valid' })
        }

        let deletedUser = await User.findById(id)
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' })
        }
        deletedUser = await User.delete({ _id: id }).exec()
        res.status(200).json({ message: 'Deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
// [POST] /me/logout
const logoutUserFromOneDevice = async (req, res) => {
    try {
        req.user.access_token = null;
        req.user.refresh_token = null;
        await req.user.save()
        res.status(200).json({ message: 'Logout successfully' })
    }
    catch (err) {
        res.status(500).json({ error: err.message })
    }
}

module.exports = {
    deleteUser, getAllUsers, getUserByID, createUser, updateUser, getUserByPhone,
    getPersitUserLogin, getAuthUserLogin, logoutUserFromOneDevice
};
