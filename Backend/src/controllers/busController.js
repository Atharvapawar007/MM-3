import Driver from '../models/Driver.js';

export const getBuses = async (req, res) => {
    try {
        // Get all drivers that have buses
        const drivers = await Driver.find({ busPlate: { $exists: true, $ne: null } });

        // Transform each driver's bus info into Bus objects with driver details
        const buses = drivers.map(driver => {
            const driverObj = driver.toObject();
            return {
                id: driverObj._id.toString(),
                plateNumber: driverObj.busPlate,
                busNumber: driverObj.busNumber,
                driverId: driverObj._id.toString(),
                photo: driverObj.busPhoto,
                driverName: driverObj.name,
                driverContact: driverObj.contact,
                createdAt: driverObj.createdAt,
                updatedAt: driverObj.updatedAt
            };
        });

        res.status(200).json(buses);
    } catch (error) {
        console.error('Error fetching buses:', error);
        res.status(500).json({ message: 'Server error while fetching buses', error: error.message });
    }
};
