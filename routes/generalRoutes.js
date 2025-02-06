const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
    try{
        const alertMessage = `
            In order to test the functionality of the website, please use the credentials below.<br>
            Request you to first sign in as a user, place an order, and then login as an admin to accept the order and other steps.<br>
            You can also sign-up as an user, no need for actual email. (Work in progress to verify email and extra functionality)<br>
            Thank you for checking out my work.<br>
            <br>
            <strong>Admin Credentials:</strong><br>
            Email: admin@admin.com<br>
            Password: admin@123<br>
            <br>
            <strong>User Credentials:</strong><br>
            Email: test@test.com<br>
            Password: test@123<br>
    `;
        res.render('home',{alertMessage});
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
