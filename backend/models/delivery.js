const mongoose = require('mongoose');

const deliverySchema = mongoose.Schema({
    zipCode: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        default: 0,
        required: true
    }

}, {
    timestamps: true
});

deliverySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

deliverySchema.set('toJSON', {
    virtuals: true,
});


exports.Delivery = mongoose.model('Delivery', deliverySchema);