const mongoose = require('mongoose');

const faqSchema = mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
        required: true
    }

}, {
    timestamps: true
});

faqSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

faqSchema.set('toJSON', {
    virtuals: true,
});


exports.FAQ = mongoose.model('FAQ', faqSchema);