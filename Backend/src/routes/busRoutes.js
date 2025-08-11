import express from 'express';
import { getBuses } from '../controllers/busController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Protected Routes (require authentication)
router.get('/list', verifyToken, getBuses);

export default router;
