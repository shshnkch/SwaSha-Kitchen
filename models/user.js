const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name cannot be left blank']
    },
    email: {
        type: String,
        required: [true, 'Email cannot be left blank'],
        unique: [true, 'Email is already registered'],
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password cannot be left blank'],
        minLength: 8
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number cannot be left blank'],
        match: [/^\d{10}$/, 'Please enter a valid 10 digit phone number']
    },
    address: {
        type: String,
        required: [true, 'Address cannot be left blank']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;