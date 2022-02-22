const {
    Delivery
} = require('../models/delivery');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get(`/`, async (req, res) => {
    let filter = {};

    const zipCodeList = await Delivery.find({});

    if (!zipCodeList) {
        res.status(500).json({
            success: false
        });
    }
    res.send(zipCodeList);
});


router.get(`/fee/:zip`, async (req, res) => {
    const delivery = await Delivery.findOne({
        zipCode: req.params.zip
    });

    if (delivery === null) {
        res.send(null);
        return;
    }
    res.send(delivery);
});


router.post('/', async (req, res) => {
    const deliveries = await Delivery.find({
        zipCode: req.body.zipCode
    });

    if (deliveries.length > 0) {
        return res.status(500).send('The delivery zip code already exists');
    } else {
        const delivery = new Delivery({
            zipCode: req.body.zipCode,
            city: req.body.city,
            price: req.body.price,
        });

        const newDelivery = await delivery.save();

        if (!newDelivery) return res.status(500).send('The delivery cannot be created', newDelivery);

        res.send(newDelivery);
    }

});

router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Delivery Id');
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(400).send('Invalid Delivery!');

    const updatedDelivery = await Delivery.findByIdAndUpdate(
        req.params.id, {
            zipCode: req.body.name,
            city: req.body.city,
            cost: req.body.cost
        }, {
            new: true
        }
    );

    if (!updatedDelivery) return res.status(500).send('the delivery cannot be updated!');

    res.send(updatedDelivery);
});

router.delete('/:id', (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product) {
                return res.status(200).json({
                    success: true,
                    message: 'the product is deleted!'
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'product not found!'
                });
            }
        })
        .catch((err) => {
            return res.status(500).json({
                success: false,
                error: err
            });
        });
});



module.exports = router;