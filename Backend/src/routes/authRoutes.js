import express from 'express';
import { login, register, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

console.log('[authRoutes] Setting up auth routes...');

router.post('/login', login);
router.post('/register', register);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

console.log('[authRoutes] Auth routes configured successfully');

export default router;
