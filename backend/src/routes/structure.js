const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth');
const {
  getSchoolYears, createSchoolYear,
  getClasses, createClass, assignStudentToClass,
  getSubjects, createSubject,
} = require('../controllers/structureController');

// Années scolaires
router.get('/school-years', authenticate, getSchoolYears);
router.post('/school-years', authenticate, authorize('admin'), createSchoolYear);

// Classes
router.get('/classes', authenticate, getClasses);
router.post('/classes', authenticate, authorize('admin'), createClass);
router.post('/classes/assign-student', authenticate, authorize('admin'), assignStudentToClass);

// Matières
router.get('/subjects', authenticate, getSubjects);
router.post('/subjects', authenticate, authorize('admin'), createSubject);

module.exports = router;
