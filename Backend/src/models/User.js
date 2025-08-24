import { DataTypes } from 'sequelize';
console.log('[models/User] Module loaded');
import { sequelize } from '../services/database.js';
import bcrypt from 'bcrypt';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('admin', 'sub-admin'),
        defaultValue: 'admin'
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        field: 'reset_password_token'
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        field: 'reset_password_expires'
    }
}, {
    tableName: 'users',
    underscored: true,
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password') && !user.password.startsWith('$2b$')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

export default User;
