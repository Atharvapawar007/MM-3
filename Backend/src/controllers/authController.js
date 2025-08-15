import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
// FIX: Changed import name to a more plausible one.
import { sendPasswordResetEmail } from '../services/emailService.js';

// ================================================================
// User registration (for creating admin users)
// ================================================================
export const register = async (req, res) => {
    try {
        const { email, password, role = 'admin' } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        // Create new user
        const user = new User({
            email,
            password,
            role
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ 
            message: 'User registered successfully!', 
            token, 
            userId: user._id 
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
    try {
        const { email, password } = req.body;

        console.log('Login attempt for email:', email);

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('User found:', { id: user._id, email: user.email, hasPassword: !!user.password });

        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password comparison result:', isMatch);
        
        if (!isMatch) {
            console.log('Password mismatch for user:', email);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('Login successful for user:', email);

        // Create a JWT token with the user ID
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the user ID and token in the response
        res.status(200).json({ 
            message: 'Login successful!', 
            token, 
            userId: user._id 
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Forgot password
// ================================================================
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a reset token and set its expiration
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

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
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });

        console.log('User found for reset:', user ? { id: user._id, email: user.email } : 'NOT_FOUND');

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        console.log('Setting new password for user:', user.email);
        
        // Set the new password (will be hashed by pre-save middleware)
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        console.log('Saving user with new password...');
        await user.save();
        
        console.log('Password reset successful for user:', user.email);

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
