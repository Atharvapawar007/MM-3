import express from 'express';
import { login, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// Define API routes for authentication

// POST /api/auth/login
// Route to handle user login.
router.post('/login', login);

// POST /api/auth/forgot-password
// Route to handle the forgot password request.
// It sends a 6-digit OTP to the user's email.
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password
// Route to handle the password reset.
// It verifies the OTP and updates the user's password.
router.post('/reset-password', resetPassword);

export default router;
