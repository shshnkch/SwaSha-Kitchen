const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [
        {
            menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
            quantity: { type: Number, default: 1 }
        }
    ]
});

module.exports = mongoose.model('Cart', cartSchema);