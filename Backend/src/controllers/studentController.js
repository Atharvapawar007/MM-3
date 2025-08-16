import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { sendCredentials, sendInvitationEmail } from '../services/emailService.js';
import Student from '../models/Student.js';
import Driver from '../models/Driver.js';

// ================================================================
// Add a new student
// ================================================================
export const addStudent = async (req, res) => {
    try {
        const { name, prn, gender, email, busId } = req.body;
        const userId = req.user.id; // Extract userId from the authenticated user

        console.log('Adding student with data:', { name, prn, gender, email, busId, userId });

        // Check for duplicate PRN or email
        const existingStudentByPRN = await Student.findById(prn);
        const existingStudentByEmail = await Student.findOne({ email });

        if (existingStudentByPRN) {
            console.log('Student with PRN already exists:', prn);
            return res.status(409).json({ message: 'A student with this PRN already exists' });
        }

        if (existingStudentByEmail) {
            console.log('Student with email already exists:', email);
            return res.status(409).json({ message: 'A student with this email already exists' });
        }

        // Check if the bus exists
        const bus = await Driver.findById(busId);
        if (!bus) {
            console.log('Bus not found:', busId);
            return res.status(404).json({ message: 'The specified bus does not exist' });
        }

        console.log('Creating new student with PRN as _id:', prn);

        // Create a new student instance with PRN as _id
        const newStudent = new Student({
            _id: prn, // PRN is now the _id
            name,
            gender,
            email,
            busId,
            userId, 
            credentialsGenerated: false,
            invitationSent: false,
            createdAt: new Date()
        });

        await newStudent.save();
        console.log('Student saved successfully to database');

        // Return the student with id field set to PRN for frontend compatibility
        const studentResponse = {
            ...newStudent.toObject(),
            id: newStudent._id, // Set id to PRN for frontend
            // Remove the prn field since it's now the _id
            invitationSent: false // New students haven't received invitations yet
        };

        console.log('Student created successfully:', studentResponse);
        console.log('Sending response:', { message: 'Student successfully added', student: studentResponse });
        res.status(201).json({ message: 'Student successfully added', student: studentResponse });

    } catch (error) {
        console.error('Error adding student:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Update an existing student's details
// ================================================================
export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params; // This is now the PRN
        const { name, prn, gender, email } = req.body;

        // Find the student by PRN
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // If PRN is being updated, check if new PRN already exists
        if (prn && prn !== id) {
            const existingStudent = await Student.findById(prn);
            if (existingStudent) {
                return res.status(409).json({ message: 'A student with this PRN already exists' });
            }
        }

        // Update the student fields
        student.name = name || student.name;
        student.gender = gender || student.gender;
        student.email = email || student.email;

        // If PRN is being updated, we need to delete and recreate the document
        if (prn && prn !== id) {
            // Delete the old document
            await Student.findByIdAndDelete(id);
            
            // Create new document with new PRN
            const updatedStudent = new Student({
                _id: prn,
                name: student.name,
                gender: student.gender,
                email: student.email,
                busId: student.busId,
                username: student.username,
                password: student.password,
                credentialsGenerated: student.credentialsGenerated,
                createdAt: student.createdAt,
                updatedAt: new Date()
            });
            
            await updatedStudent.save();
            
            const studentResponse = {
                ...updatedStudent.toObject(),
                id: updatedStudent._id,
                prn: updatedStudent._id,
                invitationSent: updatedStudent.invitationSent
            };
            
            res.status(200).json({ message: 'Student details updated successfully', student: studentResponse });
        } else {
            await student.save();
            
            const studentResponse = {
                ...student.toObject(),
                id: student._id,
                prn: student._id,
                invitationSent: student.invitationSent
            };
            
            res.status(200).json({ message: 'Student details updated successfully', student: studentResponse });
        }

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
        const { id } = req.params; // This is now the PRN
        
        console.log('Attempting to delete student with ID/PRN:', id);
        console.log('ID type:', typeof id);
        console.log('ID length:', id ? id.length : 'undefined');

        // First, let's check if the student exists
        const existingStudent = await Student.findById(id);
        if (!existingStudent) {
            console.log('Student not found with ID:', id);
            // Let's also try to find by email or name for debugging
            const allStudents = await Student.find({});
            console.log('All students in database:', allStudents.map(s => ({ _id: s._id, name: s.name, email: s.email })));
            return res.status(404).json({ message: 'Student not found' });
        }

        console.log('Found student to delete:', { _id: existingStudent._id, name: existingStudent.name, email: existingStudent.email });

        const deletedStudent = await Student.findByIdAndDelete(id);
        if (!deletedStudent) {
            console.log('Student was found but deletion failed');
            return res.status(404).json({ message: 'Student not found' });
        }

        console.log('Student deleted successfully:', { _id: deletedStudent._id, name: deletedStudent.name });
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

        // Transform students to include id and prn fields for frontend compatibility
        const transformedStudents = students.map(student => ({
            ...student.toObject(),
            id: student._id, // Set id to PRN
            prn: student._id, // Keep prn field for backward compatibility
            invitationSent: student.invitationSent
        }));

        res.status(200).json(transformedStudents);

    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Generate credentials and send invitation email
// ================================================================
export const sendStudentCredentials = async (req, res) => {
    try {
        const { id } = req.params; // This is now the PRN

        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Only send credentials if they haven't been generated yet
        if (student.credentialsGenerated) {
            return res.status(400).json({ message: 'Credentials for this student have already been sent' });
        }
        
        // Generate a random username and password
        const username = student._id; // Using PRN as a unique username
        const password = Math.random().toString(36).slice(-8); // Random 8-character password

        // Hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        student.username = username;
        student.password = hashedPassword;
        student.credentialsGenerated = true;
        await student.save();

        // Send the credentials via email
        const emailResult = await sendCredentials(student.email, username, password);

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

// ================================================================
// Send credentials to multiple students
// ================================================================
export const sendBulkCredentials = async (req, res) => {
    try {
        const { studentIds } = req.body; // Array of PRNs

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: 'Please provide valid student IDs' });
        }

        const results = [];
        const errors = [];

        for (const prn of studentIds) {
            try {
                const student = await Student.findById(prn);
                if (!student) {
                    errors.push(`Student with PRN ${prn} not found`);
                    continue;
                }

                // Only send credentials if they haven't been generated yet
                if (student.credentialsGenerated) {
                    errors.push(`Credentials for student ${prn} have already been sent`);
                    continue;
                }

                // Generate a random username and password
                const username = student._id; // Using PRN as a unique username
                const password = Math.random().toString(36).slice(-8); // Random 8-character password

                // Hash the new password before saving
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);

                student.username = username;
                student.password = hashedPassword;
                student.credentialsGenerated = true;
                await student.save();

                // Send the credentials via email
                const emailResult = await sendCredentials(student.email, username, password);

                if (emailResult.success) {
                    results.push(`Credentials sent successfully to ${student.name} (${prn})`);
                } else {
                    // If email fails, revert the changes
                    student.credentialsGenerated = false;
                    student.username = undefined;
                    student.password = undefined;
                    await student.save();
                    errors.push(`Failed to send email to ${student.name} (${prn})`);
                }
            } catch (error) {
                console.error(`Error processing student ${prn}:`, error);
                errors.push(`Error processing student ${prn}: ${error.message}`);
            }
        }

        res.status(200).json({ 
            message: 'Bulk credentials operation completed',
            results,
            errors
        });

    } catch (error) {
        console.error('Error sending bulk credentials:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Send invitations to students for the future app
// ================================================================
export const sendInvitations = async (req, res) => {
    try {
        const { busId } = req.body;
        const userId = req.user.id;

        if (!busId) {
            return res.status(400).json({ message: 'Bus ID is required' });
        }

        // Check if the bus exists
        const bus = await Driver.findById(busId);
        if (!bus) {
            return res.status(404).json({ message: 'The specified bus does not exist' });
        }

        // Get all students for this bus who haven't received invitations yet
        const students = await Student.find({ 
            busId: busId,
            credentialsGenerated: false 
        });

        if (students.length === 0) {
            return res.status(400).json({ message: 'No students found without invitations for this bus' });
        }

        const results = [];
        const errors = [];

        for (const student of students) {
            try {
                // Send invitation email with email as username and PRN as password
                const emailResult = await sendInvitationEmail(student.email, student._id);

                if (emailResult.success) {
                    // Mark invitation as sent and credentials as generated
                    student.invitationSent = true;
                    student.credentialsGenerated = true;
                    await student.save();
                    
                    results.push(`Invitation sent successfully to ${student.name} (${student._id})`);
                } else {
                    errors.push(`Failed to send invitation to ${student.name} (${student._id}): Email error`);
                }
            } catch (error) {
                console.error(`Error processing student ${student._id}:`, error);
                errors.push(`Error processing student ${student._id}: ${error.message}`);
            }
        }

        res.status(200).json({ 
            message: 'Invitations sent successfully',
            results,
            errors,
            totalSent: results.length,
            totalErrors: errors.length
        });

    } catch (error) {
        console.error('Error sending invitations:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Clean up database indexes (run once to fix existing conflicts)
// ================================================================
export const cleanupIndexes = async (req, res) => {
    try {
        console.log('Cleaning up database indexes...');
        
        // Get the Student collection
        const collection = mongoose.connection.collection('students');
        
        // List all indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes);
        
        // Drop any conflicting indexes
        for (const index of indexes) {
            if (index.name === 'prn_1' || index.name === 'email_1') {
                console.log(`Dropping conflicting index: ${index.name}`);
                await collection.dropIndex(index.name);
            }
        }
        
        // Recreate the correct indexes
        await collection.createIndex({ email: 1 }, { unique: true });
        await collection.createIndex({ busId: 1 });
        
        console.log('Index cleanup completed successfully');
        res.status(200).json({ message: 'Database indexes cleaned up successfully' });
        
    } catch (error) {
        console.error('Error cleaning up indexes:', error);
        res.status(500).json({ message: 'Failed to clean up indexes', error: error.message });
    }
};
