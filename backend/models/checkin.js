const mongoose = require('mongoose');

const price = mongoose.Schema({
    name: String,
    amount: Number,
    price: Number,
});

const checkInSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: ''
    },
    richDescription: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    images: [{
        type: String
    }],
    cost: {
        type: Number,
        required: true
    },
    price: {
        type: String,
        default: ''
    },
    prices: [price],
    brand: {
        type: String,
        default: ''
    },
    strain: {
        type: String,
        default: ''
    },
    flavor: {
        type: String,
        default: ''
    },
    unitType: {
        type: String,
        enum: ['Item', 'Gram', 'Package'],
        default: '',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    countReceived: {
        type: Number,
        required: true,
        min: 0
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    dateReceived: {
        type: Date,
        default: Date.now,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    userName: {
        type: String
    }

}, {
    timestamps: true
});



checkInSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

checkInSchema.set('toJSON', {
    virtuals: true,
});


exports.CheckIn = mongoose.model('CheckIn', checkInSchema);