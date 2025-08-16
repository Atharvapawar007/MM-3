import Driver from '../models/Driver.js';
import Student from '../models/Student.js';

// ================================================================
// Add a new driver and bus allocation
// ================================================================
export const addDriver = async (req, res) => {
    try {
        // The fix: Add 'userId' to the destructured body to receive the ID from the frontend.
        const { userId, name, number, gender, contact, email, photo, busPlate, busNumber, busPhoto } = req.body;

        // Basic validation - Add userId to the list of required fields.
        if (!userId || !name || !number || !gender || !contact || !email || !busPlate || !busNumber) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Check for duplicate driver number
        const existingDriver = await Driver.findOne({ number });
        if (existingDriver) {
            return res.status(409).json({ message: 'Driver with this number already exists' });
        }

        // Check for duplicate email
        const existingEmail = await Driver.findOne({ email });
        if (existingEmail) {
            return res.status(409).json({ message: 'Driver with this email already exists' });
        }

        // Check for duplicate bus details
        const existingBus = await Driver.findOne({ $or: [{ busNumber }, { busPlate }] });
        if (existingBus) {
            return res.status(409).json({ message: 'This bus is already assigned to another driver' });
        }

        // Create a new driver instance
        const newDriver = new Driver({
            // Pass the userId to the model instance.
            userId, 
            name,
            number,
            gender,
            contact,
            email,
            photo,
            busPlate,
            busNumber,
            busPhoto
        });

        // Save the new driver to the database
        await newDriver.save();

        res.status(201).json({ message: 'Driver successfully allocated to bus', driver: newDriver });

    } catch (error) {
        // The original error you encountered is logged here, so we will now see a successful response.
        console.error('Error adding driver:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Get all drivers
// ================================================================
export const getDrivers = async (req, res) => {
    console.log('--- Fetching all drivers ---');
    try {
        const drivers = await Driver.find({});
        console.log(`Found ${drivers.length} drivers.`);
        
        // Transform each driver to match frontend expectations
        const transformedDrivers = drivers.map(driver => {
            const driverObj = driver.toObject();
            return {
                id: driverObj._id.toString(),      // Convert MongoDB _id to string for frontend id
                _id: driverObj._id.toString(),     // Keep _id as well
                name: driverObj.name,
                phone: driverObj.contact,          // Map contact to phone
                driverId: driverObj.number,        // Map number to driverId
                gender: driverObj.gender,
                email: driverObj.email,            // Include email field
                photoUrl: driverObj.photo,         // Map photo to photoUrl
                bus: driverObj.busPlate ? {
                    id: driverObj._id.toString(),  // Use same ID for bus
                    plateNumber: driverObj.busPlate,
                    busNumber: driverObj.busNumber
                } : null,
                createdAt: driverObj.createdAt,
                updatedAt: driverObj.updatedAt
            };
        });

        res.status(200).json(transformedDrivers);
    } catch (error) {
        console.error('!!! CRITICAL ERROR fetching drivers:', error);
        res.status(500).json({ message: 'Server error while fetching drivers', error: error.message });
    }
};

// ================================================================
// Get a single driver by ID
// ================================================================
export const getDriverById = async (req, res) => {
    try {
        const { id } = req.params;
        const driver = await Driver.findById(id);

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Transform the response to match frontend expectations
        const driverObj = driver.toObject();
        const transformedDriver = {
            id: driverObj._id.toString(),      // Convert MongoDB _id to string for frontend id
            _id: driverObj._id.toString(),     // Keep _id as well
            name: driverObj.name,
            phone: driverObj.contact,          // Map contact to phone
            driverId: driverObj.number,        // Map number to driverId
            gender: driverObj.gender,
            email: driverObj.email,            // Include email field
            photoUrl: driverObj.photo,         // Map photo to photoUrl
            bus: driverObj.busPlate ? {
                id: driverObj._id.toString(),  // Use same ID for bus
                plateNumber: driverObj.busPlate,
                busNumber: driverObj.busNumber
            } : null,
            createdAt: driverObj.createdAt,
            updatedAt: driverObj.updatedAt
        };

        res.status(200).json(transformedDriver);
    } catch (error) {
        console.error('Error fetching driver by ID:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Delete a driver and all associated students
// ================================================================
export const deleteDriver = async (req, res) => {
    console.log('=== DELETE DRIVER REQUEST RECEIVED ===');
    console.log('Request params:', req.params);
    console.log('Request headers:', req.headers);
    
    try {
        const { id } = req.params; // Get the driver ID from the URL parameter
        console.log('Driver ID from params:', id);
        console.log('Type of ID:', typeof id);

        // Validate the ID format
        if (!id || id === 'undefined' || id === 'null') {
            console.error('Invalid driver ID - missing or undefined/null');
            return res.status(400).json({ 
                success: false,
                message: 'Invalid driver ID',
                receivedId: id
            });
        }

        // Check if ID is a valid MongoDB ObjectId
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        console.log('Is valid ObjectId:', isValidObjectId);
        
        if (!isValidObjectId) {
            console.error('Invalid driver ID format - not a valid ObjectId');
            return res.status(400).json({ 
                success: false,
                message: 'Invalid driver ID format',
                receivedId: id,
                expectedFormat: '24 character hex string',
                length: id ? id.length : 0
            });
        }

        console.log('Attempting to find and delete driver with ID:', id);
        const deletedDriver = await Driver.findByIdAndDelete(id);
        console.log('Delete operation result:', deletedDriver ? 'Found and deleted' : 'Not found');
        
        if (!deletedDriver) {
            console.error('Driver not found with ID:', id);
            return res.status(404).json({ 
                success: false,
                message: 'Driver not found',
                driverId: id
            });
        }

        console.log('Attempting to delete associated students for bus ID:', id);
        const deleteResult = await Student.deleteMany({ busId: id });
        console.log('Deleted students count:', deleteResult.deletedCount);

        console.log('Driver and students deleted successfully');
        res.status(200).json({ 
            success: true,
            message: 'Driver and all associated students successfully deleted',
            driverId: id,
            studentsDeleted: deleteResult.deletedCount
        });

    } catch (error) {
        console.error('=== ERROR IN deleteDriver ===');
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
        const { name, number, gender, contact, email, photo } = req.body;

        const driver = await Driver.findById(id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Duplicate checks for number and email when changed
        if (typeof number !== 'undefined' && number !== driver.number) {
            const existingByNumber = await Driver.findOne({ number });
            if (existingByNumber && existingByNumber._id.toString() !== id) {
                return res.status(409).json({ message: 'Driver with this number already exists' });
            }
        }

        if (typeof email !== 'undefined' && email !== driver.email) {
            const existingByEmail = await Driver.findOne({ email });
            if (existingByEmail && existingByEmail._id.toString() !== id) {
                return res.status(409).json({ message: 'Driver with this email already exists' });
            }
        }

        // Apply updates (bus fields are intentionally not editable here)
        if (typeof name !== 'undefined') driver.name = name;
        if (typeof number !== 'undefined') driver.number = number;
        if (typeof gender !== 'undefined') driver.gender = gender;
        if (typeof contact !== 'undefined') driver.contact = contact;
        if (typeof email !== 'undefined') driver.email = email;
        if (typeof photo !== 'undefined') driver.photo = photo;

        await driver.save();

        const driverObj = driver.toObject();
        const transformedDriver = {
            id: driverObj._id.toString(),
            _id: driverObj._id.toString(),
            name: driverObj.name,
            phone: driverObj.contact,
            driverId: driverObj.number,
            gender: driverObj.gender,
            email: driverObj.email,
            photoUrl: driverObj.photo,
            bus: driverObj.busPlate ? {
                id: driverObj._id.toString(),
                plateNumber: driverObj.busPlate,
                busNumber: driverObj.busNumber
            } : null,
            createdAt: driverObj.createdAt,
            updatedAt: driverObj.updatedAt
        };

        res.status(200).json({ message: 'Driver updated successfully', driver: transformedDriver });
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({ message: 'Server error while updating driver', error: error.message });
    }
};
