import { Driver } from '../models/index.js';
import { Op } from 'sequelize';
console.log('[busController] Module loaded');

export const getBuses = async (req, res) => {
    try {
        console.log('[busController.getBuses] Fetching all buses');
        // Get all drivers that have buses
        const drivers = await Driver.findAll({
            where: {
                busPlate: { [Op.ne]: null }
            }
        });
        console.log('[busController.getBuses] Found drivers with buses:', drivers.length);

        // Transform each driver's bus info into Bus objects with driver details
        const buses = drivers.map(driver => {
            console.log('[busController.getBuses] Processing driver:', driver.id);
            return {
                id: String(driver.id),
                plateNumber: driver.busPlate,
                busNumber: driver.busNumber,
                driverId: String(driver.id),
                driverName: driver.name,
                driverContact: driver.contact,
                createdAt: driver.createdAt,
                updatedAt: driver.updatedAt
            };
        });

        console.log('[busController.getBuses] Sending buses:', buses.length);
        res.status(200).json(buses);
    } catch (error) {
        console.error('[busController.getBuses] Error fetching buses:', error);
        console.error('[busController.getBuses] Stack:', error.stack);
        res.status(500).json({ message: 'Server error while fetching buses', error: error.message });
    }
};
