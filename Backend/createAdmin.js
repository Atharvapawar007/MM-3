import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Create admin user
const createAdminUser = async () => {
    try {
        await connectDB();

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'atharavpawar4507@gmail.com' });
        if (existingAdmin) {
            console.log('✅ Admin user already exists!');
            console.log('Email: atharavpawar4507@gmail.com');
            console.log('You can now login with these credentials.');
            process.exit(0);
        }

        // Create new admin user
        const adminUser = new User({
            email: 'atharavpawar4507@gmail.com',
            password: 'admin123', // This will be hashed automatically by the pre-save hook
            role: 'admin'
        });

        await adminUser.save();

        console.log('✅ Admin user created successfully!');
        console.log('Email: atharavpawar4507@gmail.com');
        console.log('Password: admin123');
        console.log('You can now login with these credentials.');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

// Run the script
createAdminUser();
