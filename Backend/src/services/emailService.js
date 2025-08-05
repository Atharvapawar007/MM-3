import nodemailer from 'nodemailer';

// ================================================================
// Nodemailer Transporter Configuration
// Configure your SMTP settings here.
// In a real application, these should be stored in your .env file.
// ================================================================
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // Use 'true' for port 465, 'false' for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// ================================================================
// Sends a 6-digit OTP to a user's email for password reset.
// @param {string} email - The recipient's email address.
// @param {string} otp - The 6-digit OTP.
// @returns {Promise<object>} An object containing the success status.
// ================================================================
export const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'BusTracker Admin Portal - Password Reset OTP',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #1e3a8a;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password. Please use the following OTP to proceed:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 24px; font-weight: bold; padding: 10px 20px; background-color: #f3f4f6; border-radius: 8px;">${otp}</span>
                </div>
                <p>This OTP is valid for 5 minutes. Do not share it with anyone.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin-top: 20px;">
                <p style="font-size: 12px; color: #6b7280;">BusTracker Admin Portal</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error(`Failed to send OTP to ${email}:`, error);
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
