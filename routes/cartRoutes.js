const express = require('express');
const jwt = require('jsonwebtoken');
const Cart = require('../models/cart');
const MenuItem = require('../models/menuitems');

const router = express.Router();

router.post('/cart/add/:menuItemId', async (req, res, next) => {
    try {
        const {menuItemId} = req.params;
        const { quantity } = req.body;
        const token = req.cookies.token;
        const menuItems = await MenuItem.find();
        if(!token){
            return res.status(401).render('login', {menuItems, error: 'You must be logged in to add items to the cart.'});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        let cart = await Cart.findOne({ user: userId });
        if(!cart){
            cart = new Cart({ user: userId, items: [] });
        }
        const existingItem = cart.items.find(item => item.menuItem.toString() === menuItemId);
        if(existingItem){
            existingItem.quantity += parseInt(quantity);
        }else{
            cart.items.push({ menuItem: menuItemId, quantity: parseInt(quantity)});
        }
        await cart.save();
        res.redirect('/menu');
    }catch (err){
        next(err);
    }
});

router.get('/cart', async (req, res, next) => {
    try {
        const token = req.cookies.token;
        const menuItems = await MenuItem.find();
        if(!token){
            return res.status(401).render('login', {menuItems, error: 'You must be logged in to view your cart.'});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const cart = await Cart.findOne({ user: userId }).populate('items.menuItem');
        if(!cart || cart.items.length === 0){
            return res.render('cart', { cartItems: []});
        }
        const total = cart.items.reduce((sum, item) => {
            return sum + item.menuItem.price * item.quantity;
        }, 0);
        res.render('cart', { cartItems: cart.items, total});
    }catch (err){
        next(err);
    }
});

router.post('/cart/remove/:menuItemId', async (req, res, next) => {
    try{
        const {menuItemId} = req.params;
        const token = req.cookies.token;
        const menuItems = await MenuItem.find();
        if(!token){
            return res.status(401).render('menu', {menuItems, error: 'You must be logged in to remove items from the cart.'});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const cart = await Cart.findOne({ user: userId });
        if(!cart){
            return res.status(404).render('menu', {menuItems, error: 'Cart is empty.'});
        }
        cart.items = cart.items.filter(item => item.menuItem.toString() !== menuItemId);
        await cart.save();
        res.redirect('/cart');
    }catch(err){
        next(err);
    }
});

module.exports = router;