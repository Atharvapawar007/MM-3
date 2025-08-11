import express from 'express';
import { addDriver, getDrivers, deleteDriver, getDriverById } from '../controllers/driverController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Define API routes for driver management

// POST /api/drivers/add
// Route to add a new driver and bus allocation.
router.post('/add', verifyToken, addDriver);

// GET /api/drivers/list
// Route to get a list of all drivers.
router.get('/list', verifyToken, getDrivers);

// GET /api/drivers/:id
// Route to get a single driver by ID.
router.get('/:id', verifyToken, getDriverById);

// DELETE /api/drivers/delete/:id
// Route to delete a driver and their associated students.
router.delete('/delete/:id', verifyToken, deleteDriver);

export default router;
