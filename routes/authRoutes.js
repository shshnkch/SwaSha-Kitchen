const express =  require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const router = express.Router();

router.get('/login', (req, res, next) => {
    try{
        res.render('login');
    } catch(err) {
        next(err);
    }
});

router.post('/login', async(req, res, next) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).render('login', {error: 'Invalid email or password'});
        }
        const validatePassword = await bcrypt.compare(password, user.password);
        if(!validatePassword){
            return res.status(401).render('login', {error: 'Invalid email or password'});
        }
        const token = jwt.sign({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '1h'});
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
        res.redirect('/menu');
    } catch(err){
        next(err);
    }
});

router.get('/signup', (req, res, next) => {
    try{
        res.render('signup');
    } catch(err) {
        next(err);
    }
});

router.post('/signup', async(req, res, next) => {
    const {name, email, password, phoneNumber, address} = req.body;
    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(409).render('signup', {error: 'Email already in use'});
        }
        const existingPhoneNumber = await User.findOne({phoneNumber});
        if(existingPhoneNumber){
            return res.status(409).render('signup', {error: 'Phone number already in use'});
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            phoneNumber: phoneNumber,
            address: address,
            role: 'user',
            createdAt: Date.now()
        });
        await newUser.save();
        res.status(201).redirect('/login');
    } catch(err){
        res.status(500).render('signup', {error: 'Server error: Please try again later'});
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

module.exports = router;