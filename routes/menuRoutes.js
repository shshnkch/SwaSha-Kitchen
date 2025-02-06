const express = require('express');
const MenuItem = require('../models/menuitems');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const multerStorageCloudinary = require('multer-storage-cloudinary'); 
const multerStorageCloudinary = require('multer-storage-cloudinary').CloudinaryStorage;
const router = express.Router();

// Set up Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer storage to upload images to Cloudinary
const storage = multerStorageCloudinary({
    cloudinary: cloudinary,
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]  // Optional: Resize images
});

// Initialize multer with Cloudinary storage configuration
const upload = multer({ storage });

// Get the menu items
router.get('/menu', async (req, res, next) => {
    try {
        const token = req.cookies.token;
        const menuItems = await MenuItem.find().sort({ category: 1 });

        if (!token) {
            return res.render('menu', { menuItems });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        if (decoded.role === 'admin') {
            const categories = await MenuItem.schema.path('category').enumValues;
            res.render('adminmenu', { user: decoded, menuItems, categories });
        } else {
            res.render('menu', { menuItems });
        }
    } catch (err) {
        next(err);
    }
});

// Add new menu item with image upload to Cloudinary
router.post('/menu/add', upload.single('image'), async (req, res, next) => {
    try {
        const { name, price, description, category } = req.body;
        const image = req.file ? req.file.path : null;  // Image URL from Cloudinary

        const newMenuItem = new MenuItem({
            name: name,
            price: price,
            description: description,
            category: category,
            image: image  // Store Cloudinary image URL in the database
        });

        await newMenuItem.save();
        res.redirect('/menu');
    } catch (err) {
        next(err);
    }
});

// Edit an existing menu item (support image update)
router.post('/menu/edit/:id', upload.single('image'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, price, description, category, isActive } = req.body;
        const image = req.file ? req.file.path : null;  // Get Cloudinary image URL

        const updateData = {
            name,
            price,
            description,
            category,
            isActive: isActive === 'on',
        };

        if (image) {
            updateData.image = image;
        }

        await MenuItem.findByIdAndUpdate(id, updateData, { new: true });
        res.redirect('/menu');
    } catch (err) {
        console.error("Error updating menu item:", err);
        next(err);
    }
});

// Delete a menu item
router.post('/menu/delete/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await MenuItem.findByIdAndDelete(id);
        res.redirect('/menu');
    } catch (err) {
        console.error("Error deleting menu item:", err);
        next(err);
    }
});

// Get the available categories
router.get('/menu/categories', (req, res, next) => {
    try {
        const categoryEnum = MenuItem.schema.path('category').enumValues;
        res.json(categoryEnum);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
