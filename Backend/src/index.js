import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './services/database.js';
import './models/index.js';

const app = express();

// Request logging middleware
app.use((req, res, next) => {
    console.log(`🔥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    console.log(`   Headers:`, req.headers);
    next();
});

app.use(express.json());

// Body logging middleware
app.use((req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) {
        console.log(`   Body:`, req.body);
    }
    next();
});

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to database
connectDB().then(() => {
    console.log('Database connected successfully');
}).catch((e) => {
    console.error('Database connection failed:', e);
});

// Import and mount all routes
import authRoutes from './routes/authRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import busRoutes from './routes/busRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/buses', busRoutes);

app.get('/', (req, res) => {
    res.send('BusTracker Backend API is running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});