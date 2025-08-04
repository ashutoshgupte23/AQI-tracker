const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes');

// Load environment variables from a custom path
const envPath = path.resolve(__dirname, '.env');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error('Error: .env file not found at', envPath);
    process.exit(1); // Exit the application if .env is missing
}

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? '*' : 'http://127.0.0.1:5500', // Allow any origin in production (for Vercel) or specific in dev
    methods: ['GET', 'POST'], // Allow only necessary methods
    allowedHeaders: ['Content-Type'] // Allow only necessary headers
};
app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit the application if MongoDB connection fails
    });

// Routes
app.get('/', (req, res) => {
    res.send('AQI Checker Backend is running!');
});
app.use('/api', userRoutes);

// Start the server
const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed due to app termination');
        server.close(() => {
            process.exit(0);
        });
    });
});
