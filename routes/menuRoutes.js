const express = require('express');
const MenuItem = require('../models/menuitems');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Serve static files from the "uploads" directory
router.use('/uploads', express.static('uploads'));

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);  // Set the destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        // Save the file with the current timestamp + original file extension
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// File filter to allow only certain image types (JPEG, PNG, AVIF, WebP, etc.)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/avif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);  // Reject if file type is not allowed
    }
};

// Multer configuration
const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // max file size: 10MB

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

// Add new menu item
router.post('/menu/add', upload.single('image'), async (req, res, next) => {
    try {
        const { name, price, description, category } = req.body;
        const image = req.file ? req.file.filename : null;

        const newMenuItem = new MenuItem({
            name: name,
            price: price,
            description: description,
            category: category,
            image: image
        });

        await newMenuItem.save();
        res.redirect('/menu');
    } catch (err) {
        next(err);
    }
});

// Edit an existing menu item
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
