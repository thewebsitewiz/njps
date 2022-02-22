const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    amount: {
        type: String
    },
    amountName: {
        type: String,
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
})

exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);