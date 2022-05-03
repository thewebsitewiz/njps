const {
    Order
} = require('../models/order');
const express = require('express');
const {
    OrderItem
} = require('../models/order-item');

const nodemailer = require("nodemailer");
const dateTime = require("date-and-time");

const router = express.Router();

const mons = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
};

const pad = (num, size) => {
    let s = num + "";
    while (s.length < size) {
        s = "0" + s;
    }
    return s;
};
totalOrderCount = 0;

router.get(`/`, async (req, res) => {
    try {
        const orderList = await Order.find().populate('user', 'name').sort({
            'dateOrdered': -1
        });

        if (!orderList) {
            return res.status(500).json({
                success: false
            })
        }
        return res.send(orderList);
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }
});

router.get(`/:id`, async (req, res) => {
    try {
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
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
            let newOrderItem = new OrderItem({
                amount: orderItem.amount,
                product: orderItem.product
            });

            newOrderItem = await newOrderItem.save();

            // return newOrderItem._id;
        }));

        const orderItemsIdsResolved = await orderItemsIds;

        /*     const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
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
            })) */


        const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

        let order = new Order({
            orderItems: orderItemsIdsResolved,
            streetAddress: req.body.streetAddress,
            aptOrUnit: req.body.aptOrUnit,
            city: req.body.city,
            zipCode: req.body.zipCode,
            delivery: req.body.delivery,
            phoneNumber: req.body.phoneNumber,
            status: req.body.status,
            fullName: req.body.fullName,
            totalPrice: req.body.totalPrice,
            user: req.body.user,
        })
        order = await order.save();

        if (!order)
            return res.status(400).send('the order cannot be created!');


        emailOrder(order);
        return res.send(order)
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }
})


router.put('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id, {
                status: req.body.status
            }, {
                new: true
            }
        )

        if (!order)
            return res.status(400).send('the order cannot be updated!')

        return res.send(order);
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }
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

        return res.status(200).send({
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

            return res.stqtus(200).send({
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
        return res.status(200).send({
            orderCount: orderCount
        });
    } catch (err) {
        res.status(500).json({
            success: false
        });
    }
});

router.get(`/get/userorders/:userid`, async (req, res) => {
    try {
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
            return res.status(500).json({
                success: false
            })
        }
        return res.send(userOrderList);
    } catch (e) {
        return res.status(500).json({
            success: false,
            message: `error in catch: ${e}`
        });
    }
})

function emailOrder(order) {

    const timestamp = getTimestamp();
    const subject = `${order.fullName} - ${order.zipCode} - ${order.totalPrice} ${timestamp}`

    const mailConfig = {
        to: 'orders@njpotshop.com',
        subject: subject,
        text: order
    };

    sendViaSMTP(mailConfig);
}

async function sendViaSMTP(mailConfig) {
    const transporter = nodemailer.createTransport({
        host: "mail.njpotshop.com",
        port: 465, // 587
        secure: true, // true for 465, false for other ports
        auth: {
            user: "orders@njpotshop.com",
            pass: "d@=L(T?Sv7b!",
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    // setup email data with unicode symbols
    const mailOptions = {
        from: "NJ Potshop <orders@njpotshop.com>", // sender address
        to: mailConfig.to,
        bcc: 'edplunk@gmail.com',
        subject: mailConfig.subject,
        text: mailConfig.text
    };

    // send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);
}

function getTimestamp() {

    const thisYear = Number(newDate.getFullYear());
    const thisMonth = pad(newDate.getMonth() + 1, 2);
    let thisDOM = pad(newDate.getDate(), 2);

    const thisDate = thisYear + "-" + thisMonth + "-" + thisDOM;

    const thisHour = pad(newDate.getHours(), 2);
    const thisMinute = pad(newDate.getMinutes(), 2);

    const timestamp = `${thisDate} ${thisHour}:${thisMinute}`
    return timestamp;
};


module.exports = router;