const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menuItemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        enum: ['Starters', 'Main Course', 'Rice', 'Breads', 'Desserts', 'Beverages', 'Extras'],
        required: true
    },
    image: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = MenuItem;