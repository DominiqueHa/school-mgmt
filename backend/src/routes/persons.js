const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getStudents, getStudentById, createStudent,
  getTeachers, createTeacher,
  getStaff, createStaff,
} = require('../controllers/personsController');

// Élèves
router.get('/students', authenticate, authorize('admin', 'teacher'), getStudents);
router.get('/students/:id', authenticate, authorize('admin', 'teacher'), getStudentById);
router.post('/students', authenticate, authorize('admin'), createStudent);

// Enseignants
router.get('/teachers', authenticate, authorize('admin'), getTeachers);
router.post('/teachers', authenticate, authorize('admin'), createTeacher);

// Staff
router.get('/staff', authenticate, authorize('admin'), getStaff);
router.post('/staff', authenticate, authorize('admin'), createStaff);

module.exports = router;
