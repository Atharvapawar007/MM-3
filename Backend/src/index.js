import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './services/database.js';

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// Middleware
app.use(express.json()); // Allows the app to parse JSON bodies
app.use(cors()); // Enables Cross-Origin Resource Sharing

// Import Routes
import authRoutes from './routes/authRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/students', studentRoutes);

// Define a simple root route for testing
app.get('/', (req, res) => {
    res.send('BusTracker Backend API is running...');
});

// Set the port
const PORT = process.env.PORT || 5000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
