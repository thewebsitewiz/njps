const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    amount: {
        type: String
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }

}, {
    timestamps: true
});

exports.OrderItem = mongoose.model('OrderItem', orderItemSchema);