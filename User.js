// server/models/User.js
const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    city: String,
    name:String,
    phoneNumber: String,
    age: Number,
    gender: String,
    diseases: [String]
});

// Create and export the User model
module.exports = mongoose.model('User', userSchema);