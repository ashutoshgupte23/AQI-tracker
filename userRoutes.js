const express = require('express');
const path = require('path');
const User = require(path.join(__dirname, '../models/User')); // Absolute path

const router = express.Router();

// Save user details
router.post('/user', async (req, res) => {
    try {
        // Validate incoming data
        const { city,name, phoneNumber, age, gender, diseases } = req.body;
        if (!city || !name || !phoneNumber || !age || !gender || !diseases) {
            return res.status(400).json({ error: 'All fields are required.' }); // Return JSON
        }

        const user = new User(req.body);
        await user.save();
        res.status(200).json({ message: 'User details saved successfully!' }); // Return JSON
    } catch (error) {
        console.error('Error saving user details:', error);
        res.status(500).json({ error: 'Failed to save user details.' }); // Return JSON
    }
});

// Get concern percentage for a city
router.get('/concernPercentage', async (req, res) => {
    try {
        const city = req.query.city;
        if (!city) {
            return res.status(400).json({ error: 'City is required.' }); // Return JSON
        }

        const totalUsersInCity = await User.countDocuments({ city });
        const totalUsers = await User.countDocuments();
        const percentage = (totalUsersInCity / totalUsers) * 100 || 0;
        res.json({ percentage }); // Return JSON
    } catch (error) {
        console.error('Error fetching concern percentage:', error);
        res.status(500).json({ error: 'Failed to fetch concern percentage.' }); // Return JSON
    }
});

module.exports = router;