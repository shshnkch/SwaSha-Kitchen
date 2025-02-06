const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
// const ejsLayouts = require('ejs-locals');
const expressLayouts = require('express-ejs-layouts');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const generalRoutes = require('./routes/generalRoutes');
const menuRoutes = require('./routes/menuRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();

const PORT = process.env.PORT;

// app.engine('ejs', ejsLayouts);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error('MongoDB connection failed: ', err);
    });

app.use((req, res, next) => {
    const token = req.cookies.token;
    if(token){
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = decoded;
        }catch(err){
            console.error('Invalid or expired token:', err);
            res.locals.user = null;
        }
    }else{
        res.locals.user = null;
    }
    next();
});

app.use(authRoutes);
app.use(adminRoutes);
app.use(generalRoutes);
app.use(menuRoutes);
app.use(cartRoutes);
app.use(checkoutRoutes);
app.use(orderRoutes);

app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if(err.name === 'TokenExpiredError'){
        return res.status(401).render('login', { error: 'Session expired. Please log in again.' });
    }
    next(err);
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'development' ? err.message || 'Internal Server Error' : 'Something went wrong!';
    const stack = process.env.NODE_ENV === 'development' ? err.stack : null ;
    if(process.env.NODE_ENV === 'development'){
        console.error(err);
    }
    console.error(err);
    res.status(status).render('error', { message, status, stack });
});

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});
