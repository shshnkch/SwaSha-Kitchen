const express =  require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

router.get('/user/login', (req, res, next) => {
    try{
        res.render('login', {pageTitle: "SwaSha Kitchen - Login"});
    } catch(err) {
        next(err);
    }
});

router.post('/user/login', async(req, res, next) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).render('login', {error: 'Invalid email or password', pageTitle: "SwaSha Kitchen - Login"});
        }
        const validatePassword = await bcrypt.compare(password, user.password);
        if(!validatePassword){
            return res.status(401).render('login', {error: 'Invalid email or password', pageTitle: "SwaSha Kitchen - Login"});
        }
        const token = jwt.sign({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role},
            process.env.JWT_SECRET,
            {expiresIn: '1h'});
        res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
        res.redirect('/menu?pageTitle=SwaSha Kitchen - Menu');
    } catch(err){
        next(err);
    }
});

router.get('/user/signup', (req, res, next) => {
    try{
        res.render('signup', {pageTitle: "SwaSha Kitchen - Sign Up"});
    } catch(err) {
        next(err);
    }
});

router.post('/user/signup', async(req, res, next) => {
    const {name, email, password, phoneNumber, address} = req.body;
    try{
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(409).render('signup', {error: 'Email already in use', pageTitle: "SwaSha Kitchen - Sign Up"});
        }
        const existingPhoneNumber = await User.findOne({phoneNumber});
        if(existingPhoneNumber){
            return res.status(409).render('signup', {error: 'Phone number already in use', pageTitle: "SwaSha Kitchen - Sign Up"});
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
        res.status(201).redirect('/login?pageTitle=SwaSha Kitchen - Login');
    } catch(err){
        res.status(500).render('signup', {error: 'Server error: Please try again later', pageTitle: "SwaSha Kitchen - Sign Up"});
    }
});

router.get('/user/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/?pageTitle=SwaSha Kitchen - Home');
});

module.exports = router;