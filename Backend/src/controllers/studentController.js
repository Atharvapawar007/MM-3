import Student from '../models/Student.js';
import Driver from '../models/Driver.js';
import { sendCredentials as sendCredentialsEmail } from '../services/emailService.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// ================================================================
// Add a new student to a bus
// ================================================================
export const addStudent = async (req, res) => {
    try {
        // FIX: Add 'userId' to the destructured body.
        const { name, prn, gender, email, busId, userId } = req.body;

        // FIX: Update validation to ensure userId is present.
        if (!name || !prn || !gender || !email || !busId || !userId) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Check for duplicate PRN or email
        const existingStudent = await Student.findOne({ $or: [{ prn }, { email }] });
        if (existingStudent) {
            return res.status(409).json({ message: 'A student with this PRN or email already exists' });
        }

        // Check if the bus exists
        const bus = await Driver.findById(busId);
        if (!bus) {
            return res.status(404).json({ message: 'The specified bus does not exist' });
        }

        // Create a new student instance
        const newStudent = new Student({
            name,
            prn,
            gender,
            email,
            busId,
            // FIX: Pass the userId to the new Student instance.
            userId, 
            credentialsGenerated: false,
            createdAt: new Date()
        });

        await newStudent.save();

        res.status(201).json({ message: 'Student successfully added', student: newStudent });

    } catch (error) {
        console.error('Error adding student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Update an existing student's details
// ================================================================
export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, prn, gender, email } = req.body;

        // Find the student by ID
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Update the student fields
        student.name = name || student.name;
        student.prn = prn || student.prn;
        student.gender = gender || student.gender;
        student.email = email || student.email;

        await student.save();

        res.status(200).json({ message: 'Student details updated successfully', student });

    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Delete a student
// ================================================================
export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedStudent = await Student.findByIdAndDelete(id);
        if (!deletedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ message: 'Student successfully deleted' });

    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Get all students, with optional filtering by busId
// ================================================================
export const getStudents = async (req, res) => {
    try {
        const { busId } = req.query;
        let students = []; // Initialize as an empty array

        // FIX: Check if busId is a valid ObjectId before querying
        if (busId && mongoose.Types.ObjectId.isValid(busId)) {
            students = await Student.find({ busId });
        }

        res.status(200).json(students);

    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Generate credentials and send invitation email
// ================================================================
export const sendCredentials = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Only send credentials if they haven't been generated yet
        if (student.credentialsGenerated) {
            return res.status(400).json({ message: 'Credentials for this student have already been sent' });
        }
        
        // Generate a random username and password
        const username = student.prn; // Using PRN as a unique username
        const password = Math.random().toString(36).slice(-8); // Random 8-character password

        // Hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        student.username = username;
        student.password = hashedPassword;
        student.credentialsGenerated = true;
        await student.save();

        // Send the credentials via email
        const emailResult = await sendCredentialsEmail(student.email, username, password);

        if (emailResult.success) {
            res.status(200).json({ message: 'Credentials sent successfully' });
        } else {
            // If email fails, revert the changes
            student.credentialsGenerated = false;
            student.username = undefined;
            student.password = undefined;
            await student.save();
            return res.status(500).json({ message: 'Failed to send email. Please try again.' });
        }

    } catch (error) {
        console.error('Error sending credentials:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
