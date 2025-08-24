import { Driver, Student, User } from '../models/index.js';
import { Op } from 'sequelize';
console.log('[driverController] Module loaded');

// ================================================================
// Add a new driver and bus allocation
// ================================================================
export const addDriver = async (req, res) => {
    try {
        console.log('[driverController.addDriver] body:', req.body);
        // The fix: Add 'userId' to the destructured body to receive the ID from the frontend.
        const { userId, name, number, gender, contact, email, busPlate, busNumber } = req.body;

        // Basic validation - Add userId to the list of required fields.
        if (!userId || !name || !number || !gender || !contact || !email || !busPlate || !busNumber) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Check for duplicate driver number
        console.log('[driverController.addDriver] Checking duplicate number:', number);
        const existingDriver = await Driver.findOne({ where: { number } });
        if (existingDriver) {
            return res.status(409).json({ message: 'Driver with this number already exists' });
        }

        // Check for duplicate email
        console.log('[driverController.addDriver] Checking duplicate email:', email);
        const existingEmail = await Driver.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(409).json({ message: 'Driver with this email already exists' });
        }

        // Check for duplicate bus details
        console.log('[driverController.addDriver] Checking bus uniqueness:', { busNumber, busPlate });
        const existingBus = await Driver.findOne({ where: { [Op.or]: [{ busNumber }, { busPlate }] } });
        if (existingBus) {
            return res.status(409).json({ message: 'This bus is already assigned to another driver' });
        }

        // Create a new driver
        console.log('[driverController.addDriver] Creating driver');
        const newDriver = await Driver.create({
            userId,
            name,
            number,
            gender,
            contact,
            email,
            busPlate,
            busNumber
        });

        console.log('[driverController.addDriver] Created driver id:', newDriver?.id);
        res.status(201).json({ message: 'Driver successfully allocated to bus', driver: newDriver });

    } catch (error) {
        // The original error you encountered is logged here, so we will now see a successful response.
        console.error('[driverController.addDriver] Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Get all drivers
// ================================================================
export const getDrivers = async (req, res) => {
    console.log('[driverController.getDrivers] Fetching all drivers');
    try {
        const drivers = await Driver.findAll();
        console.log('[driverController.getDrivers] Found drivers:', drivers.length);

        // Transform each driver to match frontend expectations
        const transformedDrivers = drivers.map(d => ({
            id: String(d.id),
            _id: String(d.id),
            name: d.name,
            phone: d.contact,
            driverId: d.number,
            gender: d.gender,
            email: d.email,
            bus: d.busPlate ? {
                id: String(d.id),
                plateNumber: d.busPlate,
                busNumber: d.busNumber
            } : null,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt
        }));

        console.log('[driverController.getDrivers] Sending transformed drivers');
        res.status(200).json(transformedDrivers);
    } catch (error) {
        console.error('[driverController.getDrivers] Error:', error);
        res.status(500).json({ message: 'Server error while fetching drivers', error: error.message });
    }
};

// ================================================================
// Get a single driver by ID
// ================================================================
export const getDriverById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('[driverController.getDriverById] id:', id);
        const driver = await Driver.findByPk(id);

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Transform the response to match frontend expectations
        const transformedDriver = {
            id: String(driver.id),
            _id: String(driver.id),
            name: driver.name,
            phone: driver.contact,
            driverId: driver.number,
            gender: driver.gender,
            email: driver.email,
            bus: driver.busPlate ? {
                id: String(driver.id),
                plateNumber: driver.busPlate,
                busNumber: driver.busNumber
            } : null,
            createdAt: driver.createdAt,
            updatedAt: driver.updatedAt
        };

        console.log('[driverController.getDriverById] Found driver, sending');
        res.status(200).json(transformedDriver);
    } catch (error) {
        console.error('[driverController.getDriverById] Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Delete a driver and all associated students
// ================================================================
export const deleteDriver = async (req, res) => {
    console.log('[driverController.deleteDriver] Request received');
    console.log('Request params:', req.params);
    console.log('Request headers:', req.headers);
    
    try {
        const { id } = req.params; // Get the driver ID from the URL parameter
        console.log('Driver ID from params:', id);
        console.log('Type of ID:', typeof id);
        if (!id || id === 'undefined' || id === 'null') {
            console.error('Invalid driver ID - missing or undefined/null');
            return res.status(400).json({ 
                success: false,
                message: 'Invalid driver ID',
                receivedId: id
            });
        }

        console.log('[driverController.deleteDriver] Attempting to find driver with ID:', id);
        const driver = await Driver.findByPk(id);
        if (!driver) {
            console.error('Driver not found with ID:', id);
            return res.status(404).json({ 
                success: false,
                message: 'Driver not found',
                driverId: id
            });
        }

        // Delete associated students then the driver
        console.log('[driverController.deleteDriver] Deleting students for bus ID:', id);
        const studentsDeleted = await Student.destroy({ where: { busId: id } });
        console.log('[driverController.deleteDriver] Deleted students count:', studentsDeleted);

        console.log('[driverController.deleteDriver] Deleting driver row');
        await Driver.destroy({ where: { id } });

        console.log('[driverController.deleteDriver] Driver and students deleted successfully');
        res.status(200).json({ 
            success: true,
            message: 'Driver and all associated students successfully deleted',
            driverId: id,
            studentsDeleted
        });

    } catch (error) {
        console.error('[driverController.deleteDriver] Error');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error object:', JSON.stringify(error, null, 2));
        
        if (error.name === 'CastError') {
            console.error('CastError details:', {
                stringValue: error.stringValue,
                kind: error.kind,
                value: error.value,
                path: error.path,
                reason: error.reason?.message
            });
            return res.status(400).json({ 
                success: false,
                message: 'Invalid driver ID format',
                error: {
                    name: error.name,
                    message: error.message,
                    receivedId: id,
                    expectedType: 'MongoDB ObjectId'
                }
            });
        }
        
        console.error('Unexpected error in deleteDriver:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while deleting driver',
            error: {
                name: error.name,
                message: error.message,
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            }
        });
    }
};

// ================================================================
// Update a driver (without changing bus assignment)
// ================================================================
export const updateDriver = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, number, gender, contact, email } = req.body;
        console.log('[driverController.updateDriver] id:', id, 'body:', req.body);

        const driver = await Driver.findByPk(id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Duplicate checks for number and email when changed
        if (typeof number !== 'undefined' && number !== driver.number) {
            const existingByNumber = await Driver.findOne({ where: { number, id: { [Op.ne]: id } } });
            if (existingByNumber) {
                return res.status(409).json({ message: 'Driver with this number already exists' });
            }
        }

        if (typeof email !== 'undefined' && email !== driver.email) {
            const existingByEmail = await Driver.findOne({ where: { email, id: { [Op.ne]: id } } });
            if (existingByEmail) {
                return res.status(409).json({ message: 'Driver with this email already exists' });
            }
        }

        // Apply updates (bus fields are intentionally not editable here)
        const updates = {};
        if (typeof name !== 'undefined') updates.name = name;
        if (typeof number !== 'undefined') updates.number = number;
        if (typeof gender !== 'undefined') updates.gender = gender;
        if (typeof contact !== 'undefined') updates.contact = contact;
        if (typeof email !== 'undefined') updates.email = email;

        console.log('[driverController.updateDriver] Applying updates:', updates);
        await driver.update(updates);

        const transformedDriver = {
            id: String(driver.id),
            _id: String(driver.id),
            name: driver.name,
            phone: driver.contact,
            driverId: driver.number,
            gender: driver.gender,
            email: driver.email,
            bus: driver.busPlate ? {
                id: String(driver.id),
                plateNumber: driver.busPlate,
                busNumber: driver.busNumber
            } : null,
            createdAt: driver.createdAt,
            updatedAt: driver.updatedAt
        };

        console.log('[driverController.updateDriver] Update successful, sending');
        res.status(200).json({ message: 'Driver updated successfully', driver: transformedDriver });
    } catch (error) {
        console.error('[driverController.updateDriver] Error:', error);
        res.status(500).json({ message: 'Server error while updating driver', error: error.message });
    }
};
