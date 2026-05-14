import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getStudents, getStudentById, createStudent,
  getTeachers, createTeacher,
  getStaff, createStaff,
} from '../controllers/personsController';

const router = Router();

router.get('/students', authenticate, authorize('admin', 'teacher', 'director', 'deputy_director'), getStudents);
router.get('/students/:id', authenticate, authorize('admin', 'teacher', 'director', 'deputy_director'), getStudentById);
router.post('/students', authenticate, authorize('admin', 'director', 'deputy_director'), createStudent);

router.get('/teachers', authenticate, authorize('admin', 'director', 'deputy_director'), getTeachers);
router.post('/teachers', authenticate, authorize('admin', 'director', 'deputy_director'), createTeacher);

router.get('/staff', authenticate, authorize('admin', 'director', 'deputy_director'), getStaff);
router.post('/staff', authenticate, authorize('admin', 'director', 'deputy_director'), createStaff);

export default router;
