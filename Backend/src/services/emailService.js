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

// ================================================================
// Sends invitation email to students for the future app.
// @param {string} email - The student's email address.
// @param {string} prn - The student's PRN (Personal Registration Number).
// @returns {Promise<object>} An object containing the success status.
// ================================================================
export const sendInvitationEmail = async (email, prn) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'BusTracker Student App - Invitation to Join',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 600;">BusTracker Student App</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">You're invited to join our student portal!</p>
                </div>
                
                <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #1e3a8a; margin-top: 0; font-size: 24px;">Welcome to BusTracker!</h2>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                        Dear Student,
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                        We are excited to inform you that you have been registered for the <strong>BusTracker Student App</strong>, 
                        which will be launching soon. This app will allow you to track your bus location, receive real-time updates, 
                        and stay connected with your transportation schedule.
                    </p>
                    
                    <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <h3 style="color: #1e3a8a; margin-top: 0; font-size: 18px;">Your Login Credentials</h3>
                        <p style="margin: 10px 0; font-size: 16px;">
                            <strong>Username:</strong> <span style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${email}</span>
                        </p>
                        <p style="margin: 10px 0; font-size: 16px;">
                            <strong>Password:</strong> <span style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${prn}</span>
                        </p>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                        <strong>Important Notes:</strong>
                    </p>
                    <ul style="font-size: 16px; line-height: 1.6; color: #374151; padding-left: 20px;">
                        <li>Please keep these credentials safe and do not share them with others</li>
                        <li>The app will be available for download in the coming weeks</li>
                        <li>You will receive a notification when the app is ready for use</li>
                        <li>For security reasons, please change your password after your first login</li>
                    </ul>
                    
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">
                        If you have any questions or need assistance, please don't hesitate to contact the administration office.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background: #1e3a8a; color: white; padding: 15px 30px; border-radius: 8px; display: inline-block; font-weight: 600;">
                            🚌 BusTracker Student Portal
                        </div>
                    </div>
                    
                    <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Invitation email sent to ${email}`);
        return { success: true };
    } catch (error) {
        console.error(`Failed to send invitation email to ${email}:`, error);
        return { success: false, error };
    }
};
