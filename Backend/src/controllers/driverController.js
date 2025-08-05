import Driver from '../models/Driver.js';
import Student from '../models/Student.js';

// ================================================================
// Add a new driver and bus allocation
// ================================================================
export const addDriver = async (req, res) => {
    try {
        const { name, number, gender, contact, photo, busPlate, busNumber, busPhoto } = req.body;

        // Basic validation
        if (!name || !number || !gender || !contact || !busPlate || !busNumber) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Check for duplicate driver number
        const existingDriver = await Driver.findOne({ number });
        if (existingDriver) {
            return res.status(409).json({ message: 'Driver with this number already exists' });
        }

        // Check for duplicate bus details
        const existingBus = await Driver.findOne({ $or: [{ busNumber }, { busPlate }] });
        if (existingBus) {
            return res.status(409).json({ message: 'This bus is already assigned to another driver' });
        }

        // Create a new driver instance
        const newDriver = new Driver({
            name,
            number,
            gender,
            contact,
            photo,
            busPlate,
            busNumber,
            busPhoto
        });

        // Save the new driver to the database
        await newDriver.save();

        res.status(201).json({ message: 'Driver successfully allocated to bus', driver: newDriver });

    } catch (error) {
        console.error('Error adding driver:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Get all drivers
// ================================================================
export const getDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({});
        res.status(200).json(drivers);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Delete a driver and all associated students
// ================================================================
export const deleteDriver = async (req, res) => {
    try {
        const { id } = req.params; // Get the driver ID from the URL parameter

        // Find the driver by ID and delete them
        const deletedDriver = await Driver.findByIdAndDelete(id);
        if (!deletedDriver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Find and delete all students associated with the deleted driver's bus
        await Student.deleteMany({ busId: id });

        res.status(200).json({ message: 'Driver and all associated students successfully deleted' });

    } catch (error) {
        console.error('Error deleting driver:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
