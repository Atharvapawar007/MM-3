// authController.js - Updated for JWT-based password reset
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail } from '../services/emailService.js';

const saltRounds = 10;

// ================================================================
// Login Controller (with bcrypt)
// ================================================================
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('📥 Raw Login Request:', req.body);

        const normalizedEmail = email.trim().toLowerCase();
        console.log('📧 Normalized Email:', normalizedEmail);

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            console.log('❌ No user found with email:', normalizedEmail);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        console.log('🔐 DB Hashed Password:', user.password);
        console.log('🔑 Entered Password:', password);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('❌ Password mismatch');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const payload = {
            userId: user._id,
            role: user.role || 'admin'
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log('✅ Login successful');
        res.status(200).json({ message: 'Login successful', token, user });

    } catch (error) {
        console.error('🚨 Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ================================================================
// Forgot Password Controller (with JWT token)
// ================================================================
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            console.log('❌ Forgot Password: No user found for email:', normalizedEmail);
            return res.status(404).json({ message: 'User with that email does not exist.' });
        }

        // Generate a JWT token that is valid for 1 hour.
        const resetToken = jwt.sign(
            { id: user._id },
            process.env.RESET_PASSWORD_SECRET,
            { expiresIn: '1h' }
        );

        // Store the token in the user document and save it.
        user.resetPasswordToken = resetToken;
        await user.save();

        // Construct the password reset URL.
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // Send the password reset email with the link.
        await sendPasswordResetEmail(user.email, resetURL);

        res.status(200).json({
            message: 'A password reset email has been sent.'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ================================================================
// Reset Password Controller (with JWT token)
// ================================================================
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Verify the JWT token from the URL.
        const decoded = jwt.verify(token, process.env.RESET_PASSWORD_SECRET);
        const user = await User.findOne({ 
            _id: decoded.id, 
            resetPasswordToken: token 
        });

        if (!user) {
            console.log('❌ Invalid or expired token');
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined; // Invalidate the token
        await user.save();

        console.log('✅ Password reset successful for', user.email);
        res.status(200).json({ message: 'Password has been successfully reset.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({ message: 'Invalid or expired token.' });
    }
};
