import { Sequelize } from 'sequelize';
console.log('[database.js] Module loaded. Node:', process.version);

// ================================================================
// Connects to the MySQL database using Sequelize ORM
// @returns {Promise<void>}
// ================================================================
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

const connectDB = async () => {
    try {
        console.log('[database.js] Attempting to authenticate to MySQL with env:');
        console.log('  DB_HOST:', process.env.DB_HOST);
        console.log('  DB_PORT:', process.env.DB_PORT);
        console.log('  DB_NAME:', process.env.DB_NAME);
        console.log('  DB_USER:', process.env.DB_USER);
        console.log('  DIALECT: mysql');
        await sequelize.authenticate();
        console.log('[database.js] MySQL Connected successfully');
        await sequelize.sync({ alter: true });
        console.log('[database.js] Database synchronized');
    } catch (error) {
        console.error('[database.js] Database connection error:', error.message);
        console.error('[database.js] Full error:', error);
        process.exit(1);
    }
};

export { sequelize };
export default connectDB;
