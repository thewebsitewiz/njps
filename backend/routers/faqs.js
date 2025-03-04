const {
    FAQ
} = require('../models/faq');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get(`/`, async (req, res) => {
    try {
        const faqList = await FAQ.find({});

        if (!faqList) {
            return res.status(500).json({
                success: false
            });
        }
        return res.send(faqList);
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }
});


router.post('/', async (req, res) => {
    try {
        const faqs = await FAQ.find({});
        const newOrder = faqs.length + 1;

        const faq = new FAQ({
            question: req.body.question,
            answer: req.body.answer,
            order: newOrder
        });

        const newFaq = await faq.save();

        if (!newFaq) return res.status(500).send('The FAQ cannot be created', newFaq);

        return res.send(newFaq);
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }
});


router.post('/reorder', async (req, res) => {
    try {
        await FAQ.deleteMany({});

        const newfaqs = [];
        req.body.forEach(async (faq) => {

            newfaqs.push({
                question: faq.question,
                answer: faq.answer
            });
        });

        const FAQs = await FAQ.insertMany(newfaqs);

        return res.send(FAQs);
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }

});


/* router.put('/:id', async (req, res) => {
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
}); */

/* router.delete('/:id', (req, res) => {
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
}); */



module.exports = router;