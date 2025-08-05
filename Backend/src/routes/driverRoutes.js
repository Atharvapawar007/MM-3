import express from 'express';
import { addDriver, getDrivers, deleteDriver } from '../controllers/driverController.js';

const router = express.Router();

// Define API routes for driver management

// POST /api/drivers/add
// Route to add a new driver and bus allocation.
router.post('/add', addDriver);

// GET /api/drivers/list
// Route to get a list of all drivers.
router.get('/list', getDrivers);

// DELETE /api/drivers/delete/:id
// Route to delete a driver and their associated students.
router.delete('/delete/:id', deleteDriver);

export default router;
