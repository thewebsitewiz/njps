const {
    Order
} = require('../models/order');
const express = require('express');
const {
    OrderItem
} = require('../models/order-item');
const router = express.Router();

totalOrderCount = 0;

router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({
        'dateOrdered': -1
    });

    if (!orderList) {
        res.status(500).json({
            success: false
        })
    }
    res.send(orderList);
})

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems',
            populate: {
                path: 'product',
                populate: 'category'
            }
        });

    if (!order) {
        res.status(500).json({
            success: false
        })
    }
    res.send(order);
})

router.post('/', async (req, res) => {
    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            amount: orderItem.amount,
            product: orderItem.product
        });

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))
    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product').exec();

        let totalPrice = 0;
        if (orderItem.product.unitType === 'gram' && orderItem.product.price === '') {
            const prices = {};
            orderItem.product.prices.forEach(pr => {
                prices[pr.amount] = pr.price;
            });

            totalPrice += prices[orderItem.amount]

        } else {
            totalPrice += orderItem.product.price * orderItem.amount;
        }

        return totalPrice
    }))


    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        delivery: req.body.delivery,
        phone: req.body.phone,
        status: req.body.status,
        name: req.body.name,
        totalPrice: totalPrice,
        user: req.body.user,
    })
    order = await order.save();

    if (!order)
        return res.status(400).send('the order cannot be created!');

    res.send(order);
})


router.put('/:id', async (req, res) => {
    const order = await Order.findByIdAndUpdate(
        req.params.id, {
            status: req.body.status
        }, {
            new: true
        }
    )

    if (!order)
        return res.status(400).send('the order cannot be updated!')

    res.send(order);
})


router.delete('/:id', (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({
                success: true,
                message: 'the order is deleted!'
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "order not found!"
            })
        }
    }).catch(err => {
        return res.status(500).json({
            success: false,
            error: err
        })
    })
})

router.get('/get/totalsales', async (req, res) => {
    if (totalOrderCount === 0) {
        res.send({
            totalsales: 0
        })
    } else {
        try {
            const totalsales = await Order.aggregate([{
                $group: {
                    _id: null,
                    total: {
                        $sum: '$totalPrice'
                    }
                }
            }]);

            res.send({
                totalsales: totalsales[0].total
            })
        } catch (err) {
            return res.status(400).send(`The order sales cannot be generated: ${err}`)
        }
    }
});


router.get('/get/count', async (req, res) => {
    try {
        const orderCount = await Order.countDocuments();
        totalOrderCount = orderCount;
        res.send({
            orderCount: orderCount
        });
    } catch (err) {
        console.log('orderCount Error: ', err)
        res.status(500).json({
            success: false
        });
    }
});


router.get(`/get/userorders/:userid`, async (req, res) => {
    const userOrderList = await Order.find({
        user: req.params.userid
    }).populate({
        path: 'orderItems',
        populate: {
            path: 'product',
            populate: 'category'
        }
    }).sort({
        'dateOrdered': -1
    });

    if (!userOrderList) {
        res.status(500).json({
            success: false
        })
    }
    res.send(userOrderList);
})



module.exports = router;