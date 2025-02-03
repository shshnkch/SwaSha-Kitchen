const express = require('express');
const MenuItem = require('../models/menuitems');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const router = express.Router();

router.use('/uploads', express.static('uploads'));
router.use((req, res, next) => {
    res.locals.pageTitle = "SwaSha Kitchen - Menu";
    next();
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({storage: storage});

router.get('/menu', async (req, res, next) => {
    try{
        const token = req.cookies.token;
        const menuItems = await MenuItem.find().sort({ category: 1 });
        if (!token) {
            return res.render('menu', {menuItems, pageTitle: "SwaSha Kitchen - Menu"});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if(decoded.role === 'admin'){
            const categories = await MenuItem.schema.path('category').enumValues;
            res.render('adminmenu', {user: decoded, menuItems, categories, pageTitle: "SwaSha Kitchen - Admin Menu" });
        } else{
            res.render('menu', {menuItems, pageTitle: "SwaSha Kitchen - Menu"});
        }
    } catch(err){
        next(err);
    }
});

router.post('/menu/add', upload.single('image'), async (req, res, next) => {
    console.log(req.file);
    try{
        const {name, price, description, category} = req.body;
        const image = req.file ? req.file.filename : null;
        const newMenuItem = new MenuItem({
            name: name,
            price: price,
            description: description,
            category: category,
            image: image
        });
        await newMenuItem.save();
        res.redirect('/menu?pageTitle=SwaSha Kitchen - Menu');
    } catch(err){
        next(err);
    }
});

router.post('/menu/edit/:id', upload.single('image'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, price, description, category, isActive } = req.body;
        const image = req.file ? req.file.filename : null;
        const updateData = {
            name,
            price,
            description,
            category,
            isActive: isActive === 'on',
        };
        if (image){
            updateData.image = image;
        }
        await MenuItem.findByIdAndUpdate(id, updateData, { new: true });
        res.redirect('/menu?pageTitle=SwaSha Kitchen - Menu');
    } catch (err) {
        console.error("Error updating menu item:", err);
        next(err);
    }
});

router.post('/menu/delete/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await MenuItem.findByIdAndDelete(id);
        res.redirect('/menu?pageTitle=SwaSha Kitchen - Menu');
    } catch (err) {
        console.error("Error deleting menu item:", err);
        next(err);
    }
});

router.get('/menu/categories', (req, res, next) => {
    try{
        const categoryEnum = MenuItem.schema.path('category').enumValues;
        res.json(categoryEnum);
    }catch(err){
        next(err);
    }
    
});

module.exports = router;