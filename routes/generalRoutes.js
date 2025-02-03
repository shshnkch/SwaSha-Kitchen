const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
    try{
        res.render('home', {pageTitle: "SwaSha Kitchen - Home"});
    } catch(err) {
        next(err);
    }
});

router.get('/about', (req, res, next) => {
    try{
        res.render('about', {pageTitle: "SwaSha Kitchen - About Us"});
    } catch(err){
        next(err);
    }
});

router.get('/contact', (req, res, next) => {
    try{
        res.render('contact', {pageTitle: "SwaSha Kitchen - Contact Us"});
    } catch(err){
        next(err);
    }
});

module.exports = router;
