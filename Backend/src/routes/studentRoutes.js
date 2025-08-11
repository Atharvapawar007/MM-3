import express from 'express';
import { addStudent, updateStudent, deleteStudent, getStudents, sendCredentials } from '../controllers/studentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Define API routes for student management

// POST /api/students/add
// Route to add a new student.
router.post('/add', verifyToken, addStudent);

// PUT /api/students/update/:id
// Route to update an existing student's details.
router.put('/update/:id', verifyToken, updateStudent);

// DELETE /api/students/delete/:id
// Route to delete a student.
router.delete('/delete/:id', verifyToken, deleteStudent);

// GET /api/students/list
// Route to get a list of all students, with optional busId query parameter.
router.get('/list', verifyToken, getStudents);

// POST /api/students/send-credentials/:id
// Route to generate and send login credentials to a student.
router.post('/send-credentials/:id', verifyToken, sendCredentials);

export default router;
