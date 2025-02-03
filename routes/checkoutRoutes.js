const express = require('express');
const jwt = require('jsonwebtoken');
const Cart = require('../models/cart');
const User = require('../models/user');
const router = express.Router();

router.post('/checkout', async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).render('menu', { error: 'You must be logged in to checkout.' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const user = await User.findById(userId);
        const cart = await Cart.findOne({ user: userId }).populate('items.menuItem');
        
        console.log('1- ', cart );
        if (!cart || cart.items.length === 0) {
            return res.redirect('/cart');
        }
        
        const total = cart.items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

        // await Cart.findOneAndUpdate({ user: userId }, { items: [] });
        // console.log('2- ', cart );
        // Send order summary and delivery address
        res.render('checkout', { cartItems: cart.items, total, address: user.address });
    } catch (err) {
        next(err);
    }
});

module.exports = router;