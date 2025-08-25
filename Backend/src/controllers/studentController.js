import { sendInvitationEmail } from '../services/emailService.js';
import { Student, Driver } from '../models/index.js';
import { Op } from 'sequelize';
console.log('[studentController] Module loaded');

// ================================================================
// Add a new student
// ================================================================
export const addStudent = async (req, res) => {
    try {
        const { name, prn, gender, email, busId } = req.body;
        const userId = req.user.id; // Extract userId from the authenticated user

        console.log('[studentController.addStudent] data:', { name, prn, gender, email, busId, userId });

        // Check for duplicate PRN or email
        console.log('[studentController.addStudent] checking duplicates');
        const existingStudentByPRN = await Student.findOne({ where: { prn } });
        const existingStudentByEmail = await Student.findOne({ where: { email } });

        if (existingStudentByPRN) {
            console.log('Student with PRN already exists:', prn);
            return res.status(409).json({ message: 'A student with this PRN already exists' });
        }

        if (existingStudentByEmail) {
            console.log('Student with email already exists:', email);
            return res.status(409).json({ message: 'A student with this email already exists' });
        }

        // Check if the bus exists
        console.log('[studentController.addStudent] verifying bus:', busId);
        const bus = await Driver.findByPk(busId);
        if (!bus) {
            console.log('Bus not found:', busId);
            return res.status(404).json({ message: 'The specified bus does not exist' });
        }

        console.log('[studentController.addStudent] creating student with PRN:', prn);

        // Create a new student row
        const newStudent = await Student.create({
            prn,
            name,
            gender,
            email,
            busId,
            userId,
            invitationSent: false
        });

        // Prepare response expected by frontend
        const studentResponse = {
            id: String(newStudent.prn), // Use prn as id for frontend compatibility
            prn: newStudent.prn,
            name: newStudent.name,
            gender: newStudent.gender,
            email: newStudent.email,
            busId: newStudent.busId,
            userId: newStudent.userId,
            invitationSent: newStudent.invitationSent,
            createdAt: newStudent.createdAt,
            updatedAt: newStudent.updatedAt
        };

        console.log('[studentController.addStudent] created:', studentResponse);
        console.log('[studentController.addStudent] sending response');
        res.status(201).json({ message: 'Student successfully added', student: studentResponse });

    } catch (error) {
        console.error('[studentController.addStudent] Error:', error);
        console.error('[studentController.addStudent] Stack:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Update an existing student's details
// ================================================================
export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params; // Treat this as PRN for backward compatibility
        const { name, prn, gender, email } = req.body;
        console.log('[studentController.updateStudent] id:', id, 'body:', req.body);

        // Find the student by PRN
        const student = await Student.findOne({ where: { prn: id } });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // If PRN is being updated, check if new PRN already exists
        if (prn && prn !== id) {
            const existingStudent = await Student.findOne({ where: { prn } });
            if (existingStudent) {
                return res.status(409).json({ message: 'A student with this PRN already exists' });
            }
        }

        // Apply updates in-place (no need to delete/recreate in SQL)
        console.log('[studentController.updateStudent] applying updates');
        await student.update({
            name: name ?? student.name,
            gender: gender ?? student.gender,
            email: email ?? student.email,
            prn: prn ?? student.prn
        });

        const studentResponse = {
            id: String(student.prn), // Use prn as id for frontend compatibility
            prn: student.prn,
            name: student.name,
            gender: student.gender,
            email: student.email,
            busId: student.busId,
            userId: student.userId,
            invitationSent: student.invitationSent,
            createdAt: student.createdAt,
            updatedAt: student.updatedAt
        };

        console.log('[studentController.updateStudent] updated successfully');
        res.status(200).json({ message: 'Student details updated successfully', student: studentResponse });

    } catch (error) {
        console.error('[studentController.updateStudent] Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Delete a student
// ================================================================
export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params; // Treat as PRN
        console.log('[studentController.deleteStudent] deleting PRN:', id);

        const existingStudent = await Student.findOne({ where: { prn: id } });
        if (!existingStudent) {
            console.log('[studentController.deleteStudent] not found:', id);
            return res.status(404).json({ message: 'Student not found' });
        }

        await Student.destroy({ where: { prn: id } });
        console.log('[studentController.deleteStudent] deleted:', { prn: id, name: existingStudent.name });
        res.status(200).json({ message: 'Student successfully deleted' });

    } catch (error) {
        console.error('[studentController.deleteStudent] Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Get all students, with optional filtering by busId
// ================================================================
export const getStudents = async (req, res) => {
    try {
        const { busId } = req.query;
        let students = [];
        console.log('[studentController.getStudents] busId:', busId);

        if (busId) {
            students = await Student.findAll({ where: { busId } });
        }

        // Transform students to include id and prn fields for frontend compatibility
        const transformedStudents = students.map(s => ({
            id: String(s.prn), // Use prn as id for frontend compatibility
            prn: s.prn,
            name: s.name,
            gender: s.gender,
            email: s.email,
            busId: s.busId,
            userId: s.userId,
            invitationSent: s.invitationSent,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt
        }));

        console.log('[studentController.getStudents] returning count:', transformedStudents.length);
        res.status(200).json(transformedStudents);

    } catch (error) {
        console.error('[studentController.getStudents] Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Send invitation email to student
// ================================================================
export const sendStudentCredentials = async (req, res) => {
    try {
        const { id } = req.params; // Treat as PRN
        console.log('[studentController.sendStudentCredentials] PRN:', id);

        const student = await Student.findOne({ where: { prn: id } });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Only send invitation if it hasn't been sent yet
        if (student.invitationSent) {
            return res.status(400).json({ message: 'Invitation for this student has already been sent' });
        }
        
        // Send invitation email with email as username and PRN as password
        const emailResult = await sendInvitationEmail(student.email, student.prn);

        if (emailResult.success) {
            // Mark invitation as sent
            await student.update({
                invitationSent: true
            });
            res.status(200).json({ message: 'Invitation sent successfully' });
        } else {
            return res.status(500).json({ message: 'Failed to send email. Please try again.' });
        }

    } catch (error) {
        console.error('[studentController.sendStudentCredentials] Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Send invitations to multiple students
// ================================================================
export const sendBulkCredentials = async (req, res) => {
    try {
        const { studentIds } = req.body; // Array of PRNs
        console.log('[studentController.sendBulkCredentials] count:', Array.isArray(studentIds) ? studentIds.length : 'invalid');

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: 'Please provide valid student IDs' });
        }

        const results = [];
        const errors = [];

        for (const prn of studentIds) {
            try {
                const student = await Student.findOne({ where: { prn } });
                if (!student) {
                    errors.push(`Student with PRN ${prn} not found`);
                    continue;
                }

                // Only send invitation if it hasn't been sent yet
                if (student.invitationSent) {
                    errors.push(`Invitation for student ${prn} has already been sent`);
                    continue;
                }

                // Send invitation email with email as username and PRN as password
                const emailResult = await sendInvitationEmail(student.email, student.prn);

                if (emailResult.success) {
                    // Mark invitation as sent
                    await student.update({
                        invitationSent: true
                    });
                    results.push(`Invitation sent successfully to ${student.name} (${prn})`);
                } else {
                    errors.push(`Failed to send invitation to ${student.name} (${prn})`);
                }
            } catch (error) {
                console.error(`[studentController.sendBulkCredentials] Error processing ${prn}:`, error);
                errors.push(`Error processing student ${prn}: ${error.message}`);
            }
        }

        res.status(200).json({ 
            message: 'Bulk invitations operation completed',
            results,
            errors
        });

    } catch (error) {
        console.error('Error sending bulk invitations:', error);
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
        console.log('[studentController.sendInvitations] busId:', busId, 'userId:', userId);

        if (!busId) {
            return res.status(400).json({ message: 'Bus ID is required' });
        }

        // Check if the bus exists
        const bus = await Driver.findByPk(busId);
        if (!bus) {
            return res.status(404).json({ message: 'The specified bus does not exist' });
        }

        // Get all students for this bus who haven't received invitations yet
        const students = await Student.findAll({ 
            where: {
                busId: busId,
                invitationSent: false
            }
        });

        if (students.length === 0) {
            return res.status(400).json({ message: 'No students found without invitations for this bus' });
        }

        const results = [];
        const errors = [];

        for (const student of students) {
            try {
                // Send invitation email with email as username and PRN as password
                const emailResult = await sendInvitationEmail(student.email, student.prn);

                if (emailResult.success) {
                    // Mark invitation as sent
                    await student.update({
                        invitationSent: true
                    });
                    
                    results.push(`Invitation sent successfully to ${student.name} (${student._id})`);
                } else {
                    errors.push(`Failed to send invitation to ${student.name} (${student._id}): Email error`);
                }
            } catch (error) {
                console.error('[studentController.sendInvitations] Error processing student', student.prn, error);
                errors.push(`Error processing student ${student.prn}: ${error.message}`);
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
        console.error('[studentController.sendInvitations] Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ================================================================
// Clean up database indexes (run once to fix existing conflicts)
// ================================================================
export const cleanupIndexes = async (req, res) => {
    try {
        // No-op for SQL backend; indexes managed via migrations/ORM
        console.log('Index cleanup not required for SQL backend');
        res.status(200).json({ message: 'No index cleanup required for SQL backend' });
        
    } catch (error) {
        console.error('Error in cleanupIndexes (SQL backend):', error);
        res.status(500).json({ message: 'Unexpected error', error: error.message });
    }
};
