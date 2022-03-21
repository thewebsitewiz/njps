const {
    User
} = require('../models/user');
const express = require('express');
const router = express.Router();
//require('dotenv/config');
require('dotenv').config()
//const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req, res) => {
    const userList = await User.find(); //.select('-passwordHash');

    if (!userList) {
        res.status(500).json({
            success: false
        })
    }
    res.send(userList);
})

router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id); // .select('-passwordHash');

    if (!user) {
        res.status(500).json({
            message: 'The user with the given ID was not found.'
        })
    }
    res.status(200).send(user);
})

router.post('/', async (req, res) => {
    //const saltRounds = parseInt(process.env.PG_SALT, 10);
    //const salt = bcrypt.genSaltSync(saltRounds);
    //const hashedPassword = bcrypt.hashSync(req.body.password, salt);
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
            name: req.body.fullName,
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
    const user = await User.findOne({
        phoneNumber: req.body.phone
    })
    const secret = process.env.PG_JWT;
    if (!user) {
        return res.status(400).send('The user not found');
    }

    if (user && req.body.password === user.password) {
        const token = jwt.sign({
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret, {
                expiresIn: '1d'
            }
        )

        res.status(200).send({
            user: user.email,
            token: token
        })
    } else {
        res.status(400).send('password is wrong!');
    }


})


router.post('/register', async (req, res) => {
    let user = new User({
        name: req.body.name,
        password: req.body.password,
        phoneNumber: req.body.phoneNumber,
        isAdmin: false,
        streetAddress: req.body.streetAddress,
        aptOrUnit: req.body.aptOrUnit,
        zipCode: req.body.zipCode,
        city: req.body.city
    })
    user = await user.save();

    if (!user)
        return res.status(400).send('the user cannot be created!')

    res.send(user);
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