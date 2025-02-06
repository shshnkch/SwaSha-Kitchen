const express = require('express');
const Order = require('../models/order');
const User = require('../models/user');
const Cart = require('../models/cart');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/order/confirmation', async (req, res, next) => {
    const { address } = req.body;

    const token = req.cookies.token;
    if (!token) {
        return res.status(401).render('menu', { error: 'You must be logged in to checkout.'});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    try {
        const user = await User.findById(userId);
        const cart = await Cart.findOne({ user: userId }).populate('items.menuItem');

        if (!cart || cart.items.length === 0) {
            return res.status(400).render('menu', { error: 'Your cart is empty.'});
        }

        const cartItems = cart.items.map(item => ({
            menuItem: item.menuItem._id,
            quantity: item.quantity
        }));

        const total = cart.items.reduce((sum, item) => {
            return sum + item.menuItem.price * item.quantity;
        }, 0);

        const newOrder = new Order({
            user: userId,
            cartItems,
            total,
            address,
            paymentMethod: 'COD',
            status: 'Pending'
        });

        await newOrder.save();
        await Cart.updateOne({ user: userId }, { $set: { items: [] } });
        
        res.redirect(`/order/confirmation/${newOrder._id}`);
    
    } catch (err) {
        console.error('Error processing the order:', err);
        next(err);
    }
});

router.get('/order/confirmation/:id', async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('cartItems.menuItem');
        if (!order) {
            return res.status(404).render('error', { message: 'Order not found' });
        }

        res.render('orderconfirmation', {order});
    } catch (err) {
        console.error('Error fetching order:', err);
        next(err);
    }
});

router.get('/order/all', async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).render('menu', { error: 'You must be logged in to view your orders.'});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    try {
        const orders = await Order.find({ user: userId }).populate('cartItems.menuItem').sort({ createdAt: -1 });;

        res.render('yourorders', {orders});
    } catch (err) {
        console.error('Error fetching orders:', err);
        next(err);
    }
});

router.get('/order/openorders', async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).render('menu', { error: 'You must be logged in as admin view open orders.'});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    try{
        const user = await User.findById(userId);
        if(user.role !== 'admin') {
            return res.status(401).render('menu', { error: 'You must be logged in as admin view open orders.'});
        }
        const openOrders = await Order.find({status: { $in : ['Pending', 'Preparing', 'Out For Delivery']}})
        .populate('user', 'name email')
        .populate('cartItems.menuItem');
        res.render('openordersadmin', {openOrders});
    } catch (err) {
        console.error('Error fetching open orders:', err);
        next(err);
    }
});

router.get('/order/closedorders', async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).render('menu', { error: 'You must be logged in as admin view open orders.'});
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    try{
        const user = await User.findById(userId);
        if(user.role !== 'admin') {
            return res.status(401).render('menu', { error: 'You must be logged in as admin view open orders.'});
        }
        const closedOrders = await Order.find({status: { $in : ['Cancelled', 'Delivered']}})
        .populate('user', 'name email')
        .populate('cartItems.menuItem');
        res.render('closedordersadmin', { closedOrders});
    } catch (err) {
        console.error('Error fetching close orders:', err);
        next(err);
    }
});

router.post('/order/update-status', async (req, res, next) => {
    try {
        const { orderId, status } = req.body;

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).send('Order not found');
        }

        res.redirect('/order/openorders');
    } catch (err) {
        console.error('Error updating order status:', err);
        next(err);
    }
});


module.exports = router;