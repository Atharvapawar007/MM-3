import { User } from '../models/index.js';
console.log('[authController] Module loaded');
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Op } from 'sequelize';
// FIX: Changed import name to a more plausible one.
import { sendPasswordResetEmail } from '../services/emailService.js';

// ================================================================
// User registration (for creating admin users)
// ================================================================
export const register = async (req, res) => {
    try {
        const { email, password, role = 'admin' } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Create new user
        const user = await User.create({
            email,
            password,
            role
        });

        // Create JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ 
            message: 'User registered successfully!', 
            token, 
            userId: user.id 
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// User login
// ================================================================
export const login = async (req, res) => {
    console.log('\n🔐 [authController.login] LOGIN REQUEST STARTED');
    console.log('🔐 Request method:', req.method);
    console.log('🔐 Request URL:', req.url);
    console.log('🔐 Request headers:', JSON.stringify(req.headers, null, 2));
    
    try {
        console.log('🔐 [authController.login] Extracting email and password from body');
        console.log('🔐 Request body received:', JSON.stringify(req.body, null, 2));
        
        const { email, password } = req.body;

        console.log('🔐 [authController.login] Extracted values:');
        console.log('🔐   Email:', email);
        console.log('🔐   Password provided:', !!password);
        console.log('🔐   Password length:', password ? password.length : 0);

        // Validation
        if (!email || !password) {
            console.log('🔐 [authController.login] VALIDATION FAILED - Missing email or password');
            console.log('🔐   Email missing:', !email);
            console.log('🔐   Password missing:', !password);
            return res.status(400).json({ message: 'Email and password are required' });
        }

        console.log('🔐 [authController.login] Searching for user in database with email:', email);
        
        // Find the user by email
        const user = await User.findOne({ where: { email } });
        
        console.log('🔐 [authController.login] Database query completed');
        console.log('🔐   User found:', !!user);
        
        if (!user) {
            console.log('🔐 [authController.login] USER NOT FOUND for email:', email);
            console.log('🔐   Available users in database:');
            
            // Debug: Show all users (remove in production)
            const allUsers = await User.findAll({ attributes: ['id', 'email'] });
            console.log('🔐   All users:', JSON.stringify(allUsers, null, 2));
            
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('🔐 [authController.login] User found in database:');
        console.log('🔐   User ID:', user.id);
        console.log('🔐   User email:', user.email);
        console.log('🔐   User role:', user.role);
        console.log('🔐   Has password hash:', !!user.password);
        console.log('🔐   Password hash length:', user.password ? user.password.length : 0);
        console.log('🔐   Password hash starts with $2b$:', user.password ? user.password.startsWith('$2b$') : false);

        console.log('🔐 [authController.login] Starting password comparison');
        console.log('🔐   Plain password:', password);
        console.log('🔐   Hashed password:', user.password);
        
        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        
        console.log('🔐 [authController.login] Password comparison completed');
        console.log('🔐   Password match result:', isMatch);
        
        if (!isMatch) {
            console.log('🔐 [authController.login] PASSWORD MISMATCH for user:', email);
            console.log('🔐   Provided password:', password);
            console.log('🔐   Expected hash:', user.password);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('🔐 [authController.login] Password verified successfully');
        console.log('🔐 [authController.login] Generating JWT token');
        console.log('🔐   JWT_SECRET exists:', !!process.env.JWT_SECRET);
        console.log('🔐   JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);

        // Create a JWT token with the user ID
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        console.log('🔐 [authController.login] JWT token generated successfully');
        console.log('🔐   Token length:', token ? token.length : 0);
        console.log('🔐   Token preview:', token ? token.substring(0, 50) + '...' : 'null');

        const responseData = { 
            message: 'Login successful!', 
            token, 
            userId: user.id 
        };

        console.log('🔐 [authController.login] Sending successful response');
        console.log('🔐   Response data:', JSON.stringify(responseData, null, 2));

        // Send the user ID and token in the response
        res.status(200).json(responseData);

    } catch (error) {
        console.error('🔐 [authController.login] CRITICAL ERROR OCCURRED:');
        console.error('🔐   Error name:', error.name);
        console.error('🔐   Error message:', error.message);
        console.error('🔐   Error stack:', error.stack);
        console.error('🔐   Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message,
            errorName: error.name,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};

// ================================================================
// Forgot password
// ================================================================
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a reset token and set its expiration
        const resetToken = crypto.randomBytes(20).toString('hex');
        await user.update({
            resetPasswordToken: resetToken,
            resetPasswordExpires: new Date(Date.now() + 3600000) // 1 hour
        });

        // Create the reset URL that will redirect to the frontend
        const resetUrl = `http://localhost:5173/new-password?token=${resetToken}`;
        await sendPasswordResetEmail(user.email, resetUrl);

        res.status(200).json({ message: 'Password reset link sent to your email.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Reset password
// ================================================================
export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        console.log('Reset password request received:', { token: token ? 'PRESENT' : 'MISSING', newPassword: newPassword ? 'PRESENT' : 'MISSING' });

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required.' });
        }

        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    [Op.gt]: new Date()
                }
            }
        });

        console.log('User found for reset:', user ? { id: user.id, email: user.email } : 'NOT_FOUND');

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        console.log('Setting new password for user:', user.email);
        
        // Set the new password (will be hashed by beforeSave hook)
        await user.update({
            password: newPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });
        
        console.log('Password reset successful for user:', user.email);

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
