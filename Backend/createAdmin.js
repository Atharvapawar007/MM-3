import 'dotenv/config';
import connectDB, { sequelize } from './src/services/database.js';
// Ensure models and associations are registered
import './src/models/index.js';
import User from './src/models/User.js';

// Create admin user using Sequelize
const createAdminUser = async () => {
    try {
        console.log('[createAdmin] Starting... Node:', process.version);
        console.log('[createAdmin] DB env:', {
            DB_HOST: process.env.DB_HOST,
            DB_PORT: process.env.DB_PORT,
            DB_NAME: process.env.DB_NAME,
            DB_USER: process.env.DB_USER
        });
        console.log('[createAdmin] Calling connectDB()');
        await connectDB();
        console.log('[createAdmin] DB connected, proceeding');

        const ADMIN_EMAIL = 'atharavpawar4507@gmail.com';
        const ADMIN_PASSWORD = 'admin123';

        // Check if admin already exists
        console.log('[createAdmin] Looking up existing admin by email:', ADMIN_EMAIL);
        const existingAdmin = await User.findOne({ where: { email: ADMIN_EMAIL } });
        if (existingAdmin) {
            console.log('✅ Admin user already exists!');
            console.log(`Email: ${ADMIN_EMAIL}`);
            console.log('You can now login with these credentials.');
            return;
        }

        // Create new admin user (password will be hashed via hook)
        console.log('[createAdmin] Creating admin user');
        const adminUser = await User.create({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: 'admin'
        });

        console.log('✅ Admin user created successfully!');
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Password: ${ADMIN_PASSWORD}`);
        console.log('You can now login with these credentials.');
    } catch (err) {
        console.error('[createAdmin] Error:', err);
        process.exitCode = 1;
    }
};

// Run the script
createAdminUser();
