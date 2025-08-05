import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const saltRounds = 10;

// ================================================================
// Hashes a plain text password for secure storage.
// @param {string} password - The plain text password to hash.
// @returns {Promise<string>} The hashed password.
// ================================================================
export const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Failed to hash password.');
    }
};

// ================================================================
// Compares a plain text password with a hashed password.
// @param {string} password - The plain text password.
// @param {string} hash - The hashed password from the database.
// @returns {Promise<boolean>} True if passwords match, false otherwise.
// ================================================================
export const comparePassword = async (password, hash) => {
    try {
        return await bcrypt.compare(password, hash);
    } catch (error) {
        console.error('Error comparing password:', error);
        throw new Error('Failed to compare password.');
    }
};

// ================================================================
// Generates a JSON Web Token (JWT) for user authentication.
// @param {object} payload - The data to be encoded in the token.
// @param {string} expiresIn - A string describing the token's expiration (e.g., '1h', '7d').
// @returns {string} The signed JWT.
// ================================================================
export const generateToken = (payload, expiresIn = '1h') => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

// ================================================================
// Verifies a JWT.
// @param {string} token - The JWT to verify.
// @returns {object|null} The decoded payload if valid, or null if invalid.
// ================================================================
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;
    }
};
