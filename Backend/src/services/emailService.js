import nodemailer from 'nodemailer';

// Explicitly convert types from environment variables
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "465");
const EMAIL_SECURE = process.env.EMAIL_SECURE === "true";

// Debug logs to ensure correct values
console.log("🔍 EMAIL CONFIGURATION DEBUG:");
console.log("EMAIL_HOST:", process.env.EMAIL_HOST || 'UNDEFINED');
console.log("EMAIL_PORT:", process.env.EMAIL_PORT || 'UNDEFINED');
console.log("EMAIL_SECURE:", process.env.EMAIL_SECURE || 'UNDEFINED');
console.log("EMAIL_USER:", process.env.EMAIL_USER || 'UNDEFINED');
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? '[SET]' : 'UNDEFINED');
console.log("EMAIL_FROM:", process.env.EMAIL_FROM || 'UNDEFINED');
console.log("Parsed PORT:", EMAIL_PORT);
console.log("Parsed SECURE:", EMAIL_SECURE);
// ================================================================
// Nodemailer Transporter Configuration
// Configure your SMTP settings here.
// In a real application, these should be stored in your .env file.
// ================================================================
console.log("Transporter Auth User:", process.env.EMAIL_USER);
console.log("Transporter Auth Pass:", process.env.EMAIL_PASS ? '[SET]' : '[NOT SET]');
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT), // 🔧 convert to number
    secure: process.env.EMAIL_SECURE === 'true', // ✅ convert string to boolean
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ================================================================
// Sends a secure password reset link to a user's email.
// @param {string} email - The recipient's email address.
// @param {string} resetURL - The secure URL with the JWT token.
// @returns {Promise<object>} An object containing the success status.
// ================================================================
export const sendPasswordResetEmail = async (email, resetURL) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'BusTracker Admin Portal - Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #1e3a8a;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password. Please click the button below to set a new one:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetURL}" style="background-color: #1e3a8a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                        Reset Your Password
                    </a>
                </div>
                <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-top: 20px;">
                <p style="font-size: 12px; color: #6b7280;">BusTracker Admin Portal</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset link sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error(`Failed to send password reset email to ${email}:`, error);
        return { success: false, error };
    }
};

// ================================================================
// Sends initial login credentials to a new student.
// @param {string} email - The student's email address.
// @param {string} username - The student's generated username.
// @param {string} password - The student's generated password.
// @returns {Promise<object>} An object containing the success status.
// ================================================================
export const sendCredentials = async (email, username, password) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'BusTracker Portal - Your New Login Credentials',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #1e3a8a;">Welcome to the BusTracker Portal!</h2>
                <p>Hello,</p>
                <p>Your login credentials have been created. You can now log in to the BusTracker Portal using the details below:</p>
                <p style="margin-top: 20px;"><strong>Username:</strong> ${username}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p style="margin-top: 20px;">Please remember to change your password after your first login for security purposes.</p>
                <p>If you have any questions, please contact the administration.</p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-top: 20px;">
                <p style="font-size: 12px; color: #6b7280;">BusTracker Admin Portal</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Credentials sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error(`Failed to send credentials to ${email}:`, error);
        return { success: false, error };
    }
};
