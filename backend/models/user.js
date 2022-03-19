const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    streetAddress: {
        type: String,
        default: ''
    },
    aptOrUnit: {
        type: String,
        default: ''
    },
    zipCode: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    token: {
        type: String,
        default: ''
    }
});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userSchema.set('toJSON', {
    virtuals: true,
});

exports.User = mongoose.model('User', userSchema);
exports.userSchema = userSchema;