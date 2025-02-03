const express =  require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

router.get('/adminSetUp', (req, res, next) => {
    const {secretKey} = req.query;
    if(secretKey !== process.env.ADMIN_SECRET_KEY){
        return res.status(403).render('home', {error: 'ACCESS DENIED', pageTitle: "SwaSha Kitchen - Home"});
    }
    try{
        res.render('admin', {pageTitle: "SwaSha Kitchen - Admin Setup"});
    } catch(err){
        next(err);
    }
});

router.post('/adminSetUp', async (req, res, next) => {
    const {name, email, password, address, phoneNumber} = req.body;
    try{
        const existingAdmin = await User.findOne({email});
        if(existingAdmin){
            return res.status(401).render('admin', {error: 'Email already in use', pageTitle: "SwaSha Kitchen - Admin Setup"});
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newAdmin = new User({
            name: name,
            email: email,
            password: hashedPassword,
            phoneNumber: phoneNumber,
            address: address,
            role: 'admin'
        });
        await newAdmin.save();
        res.status(201).redirect('/user/login?pageTitle=SwaSha Kitchen - Login');
    } catch(err){
        res.status(500).render('admin', {error: 'Server error: Please try again later', pageTitle: "SwaSha Kitchen - Admin Setup"});
    }
});

module.exports = router;