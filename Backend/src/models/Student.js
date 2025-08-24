import { DataTypes } from 'sequelize';
console.log('[models/Student] Module loaded');
import { sequelize } from '../services/database.js';

const Student = sequelize.define('Student', {
    prn: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        set(value) {
            this.setDataValue('prn', value.trim());
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            this.setDataValue('name', value.trim());
        }
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
        set(value) {
            this.setDataValue('email', value.trim());
        }
    },
    busId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'bus_id',
        references: {
            model: 'drivers',
            key: 'id'
        }
    },
    username: {
        type: DataTypes.STRING,
        set(value) {
            this.setDataValue('username', value ? value.trim() : value);
        }
    },
    password: {
        type: DataTypes.STRING,
        set(value) {
            this.setDataValue('password', value ? value.trim() : value);
        }
    },
    credentialsGenerated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'credentials_generated'
    },
    invitationSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'invitation_sent'
    }
}, {
    tableName: 'students',
    underscored: true,
    indexes: [
        { fields: ['bus_id'] },
        { fields: ['email'] }
    ],
    defaultScope: {
        attributes: { exclude: ['password'] }
    },
    scopes: {
        withPassword: {
            attributes: { include: ['password'] }
        }
    }
});

export default Student;
