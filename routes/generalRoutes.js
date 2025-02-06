const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
    try{
        res.render('home');
    } catch(err) {
        next(err);
    }
});

router.get('/about', (req, res, next) => {
    try{
        res.render('about');
    } catch(err){
        next(err);
    }
});

router.get('/contact', (req, res, next) => {
    try{
        res.render('contact');
    } catch(err){
        next(err);
    }
});

module.exports = router;
