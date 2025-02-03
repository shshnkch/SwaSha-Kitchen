const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    cartItems: [
        {
            menuItem: {
                type: Schema.Types.ObjectId,
                ref: 'MenuItem',
                // type: Schema.Types.Mixed,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Cancelled', 'Preparing', 'Out For Delivery', 'Delivered']
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);