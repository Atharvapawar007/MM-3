import { DataTypes } from 'sequelize';
console.log('[models/Driver] Module loaded');
import { sequelize } from '../services/database.js';

const Driver = sequelize.define('Driver', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            this.setDataValue('name', value.trim());
        }
    },
    number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
            this.setDataValue('number', value.trim());
        }
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false,
        set(value) {
            this.setDataValue('gender', value.toLowerCase());
        }
    },
    contact: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            this.setDataValue('contact', value.trim());
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
        set(value) {
            this.setDataValue('email', value.toLowerCase().trim());
        }
    },
    busPlate: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'bus_plate',
        set(value) {
            this.setDataValue('busPlate', value.trim());
        }
    },
    busNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        field: 'bus_number',
        set(value) {
            this.setDataValue('busNumber', value.trim());
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'drivers',
    underscored: true
});

export default Driver;
