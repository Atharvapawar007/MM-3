import express from 'express';
import { addStudent, updateStudent, deleteStudent, getStudents, sendCredentials } from '../controllers/studentController.js';

const router = express.Router();

// Define API routes for student management

// POST /api/students/add
// Route to add a new student.
router.post('/add', addStudent);

// PUT /api/students/update/:id
// Route to update an existing student's details.
router.put('/update/:id', updateStudent);

// DELETE /api/students/delete/:id
// Route to delete a student.
router.delete('/delete/:id', deleteStudent);

// GET /api/students/list
// Route to get a list of all students, with optional busId query parameter.
router.get('/list', getStudents);

// POST /api/students/send-credentials/:id
// Route to generate and send login credentials to a student.
router.post('/send-credentials/:id', sendCredentials);

export default router;
