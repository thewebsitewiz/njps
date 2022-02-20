const mongoose = require('mongoose');

const productSizeSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
})

productSizeSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSizeSchema.set('toJSON', {
    virtuals: true,
});


exports.ProductSize = mongoose.model('ProductSize', productSizeSchema);


/* ,displayName: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    productType: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    list: {
        type: Boolean,
        default: false,
    },
    sortOrder: {
        type: Number,
        default: 0
    } */