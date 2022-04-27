const {
    User
} = require('../models/user');
const express = require('express');
const router = express.Router();
//require('dotenv/config');
require('dotenv').config()
//const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const tokenExp = "4h";
const expiresIn = 14400;

router.get(`/`, async (req, res) => {
    const userList = await User.find(); //.select('-passwordHash');

    if (!userList) {
        res.status(400).json({
            success: false
        })
    }
    res.send(userList);
})

router.get('/:id', async (req, res) => {
    console.log(`req.params.id: |${req.params.id}|`)
    if (req.params.id !== null) {
        console.log('here');
        const user = await User.findById(req.params.id); // .select('-passwordHash');

        if (!user) {
            res.status(400).json({
                message: 'The user with the given ID was not found.'
            })
        }

        user.password = null;
        delete user.password;
        res.status(200).send(user);
    } else {
        res.status(400).json({
            message: 'No ID was passed with the request.'
        })
    }
})

router.post('/', async (req, res) => {
    //const saltRounds = parseInt(process.env.PG_SALT, 10);
    //const salt = bcrypt.genSaltSync(saltRounds);
    //const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    console.log('/')
    let user = new User({
        fullName: req.body.fullName,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        isAdmin: false,
        streetAddress: req.body.streetAddress,
        aptOrUnit: req.body.aptOrUnit,
        zipCode: req.body.zipCode,
        city: req.body.city
    });

    console.log('user: ', user)
    user = await user.save();

    if (!user)
        return res.status(400).send('the user cannot be created!')

    res.send(user);
})

router.put('/:id', async (req, res) => {

    const userExist = await User.findById(req.params.id);
    let newPassword
    if (req.body.password) {
        newPassword = req.body.password; //bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = req.body.password; //userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id, {
            fullName: req.body.fullName,
            password: newPassword,
            phoneNumber: req.body.phoneNumber,
            isAdmin: req.body.isAdmin,
            streetAddress: req.body.streetAddress,
            aptOrUnit: req.body.aptOrUnit,
            zipCode: req.body.zipCode,
            city: req.body.city
        }, {
            new: true
        }
    )

    if (!user)
        return res.status(400).send('the user cannot be created!')

    res.send(user);
})

router.post('/login', async (req, res) => {
    console.log('/login');
    const user = await User.findOne({
        phoneNumber: req.body.phone
    })
    const secret = process.env.PG_JWT;
    if (!user) {
        return res.status(400).send('The user not found');
    }

    if (user && req.body.password === user.password) {
        const token = jwt.sign({
                id: user.id,
                isAdmin: user.isAdmin
            },
            secret, {
                expiresIn: '1d'
            }
        );

        const userInfo = {
            ...user._doc
        };

        userInfo.token = token;
        userInfo.expiresIn = expiresIn;
        userInfo.tokenExp = tokenExp;
        userInfo.id = user._id;

        userInfo.password = null;

        res.status(200).send(userInfo)
    } else {
        res.status(400).send('password is wrong!');
    }
})

router.post('/register', async (req, res) => {
    let user = new User({
        fullName: req.body.fullName,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        isAdmin: false,
        streetAddress: req.body.streetAddress,
        aptOrUnit: req.body.aptOrUnit,
        zipCode: req.body.zipCode,
        city: req.body.city
    });

    let userResult = null;

    try {
        userResult = await user.save();
    } catch (e) {

    }
    if (!userResult)
        return res.status(400).send('the user cannot be created!')

    const token = jwt.sign({
            userId: userResult.id,
            isAdmin: false
        },
        secret, {
            expiresIn: '1d'
        });


    userResult.token = token;
    userResult.tokenExp = tokenExp;
    userResult.expiresIn = expiresIn;

    res.send(userResult);
})

router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({
                success: true,
                message: 'the user is deleted!'
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "user not found!"
            })
        }
    }).catch(err => {
        return res.status(500).json({
            success: false,
            error: err
        })
    })
})

router.get('/get/count', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        res.send({
            userCount: userCount
        });
    } catch (err) {
        res.status(500).json({
            success: false
        });
    }
});


module.exports = router;