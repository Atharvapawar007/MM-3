import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendOTP } from '../services/emailService.js';

// A simple in-memory store for OTPs. In a real application, you would use a database like Redis.
const otpStore = {};

// ================================================================
// Login Controller
// Verifies user credentials and generates a JWT
// ================================================================
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // If credentials are valid, create a JWT token
        const payload = {
            userId: user._id,
            role: user.role
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token, user });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ================================================================
// Forgot Password Controller
// Sends a 6-digit OTP to the user's email
// ================================================================
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store the OTP with an expiration time (e.g., 5 minutes)
        otpStore[email] = {
            otp,
            expires: Date.now() + 5 * 60 * 1000 // 5 minutes in milliseconds
        };

        // Send the OTP to the user's email
        await sendOTP(email, otp);

        res.status(200).json({ message: 'OTP sent to your email' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ================================================================
// Reset Password Controller
// Verifies OTP and updates the password
// ================================================================
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Check if OTP exists and is not expired
        const storedOTP = otpStore[email];
        if (!storedOTP || storedOTP.otp !== otp || storedOTP.expires < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Find the user and update the password
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        // Clear the OTP from the store
        delete otpStore[email];

        res.status(200).json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
