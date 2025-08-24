import User from './User.js';
import Driver from './Driver.js';
import Student from './Student.js';
console.log('[models/index] Models imported');

// Define associations
console.log('[models/index] Defining associations');
User.hasMany(Driver, { foreignKey: 'userId', as: 'drivers' });
Driver.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Driver.hasMany(Student, { foreignKey: 'busId', as: 'students' });
Student.belongsTo(Driver, { foreignKey: 'busId', as: 'driver' });

console.log('[models/index] Associations defined');

export { User, Driver, Student };
