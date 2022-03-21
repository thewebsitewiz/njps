const mongoose = require('mongoose');

const productSizesSchema = mongoose.Schema({
    name: {
        type: String
    },
    displayName: {
        type: String
    },
    amount: {
        type: Number
    },
    productType: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    list: {
        type: Boolean
    },
    sortOrder: {
        type: Number
    }
})

productSizesSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSizesSchema.set('toJSON', {
    virtuals: true,
});


exports.ProductSize = mongoose.model('ProductSize', productSizesSchema);