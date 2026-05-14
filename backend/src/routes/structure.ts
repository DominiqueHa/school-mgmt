import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getSchoolYears, createSchoolYear,
  getClasses, createClass, assignStudentToClass,
  getSubjects, createSubject,
} from '../controllers/structureController';

const router = Router();

router.get('/school-years', authenticate, getSchoolYears);
router.post('/school-years', authenticate, authorize('admin', 'director', 'deputy_director'), createSchoolYear);

router.get('/classes', authenticate, getClasses);
router.post('/classes', authenticate, authorize('admin', 'director', 'deputy_director'), createClass);
router.post('/classes/assign-student', authenticate, authorize('admin', 'director', 'deputy_director'), assignStudentToClass);

router.get('/subjects', authenticate, getSubjects);
router.post('/subjects', authenticate, authorize('admin', 'director', 'deputy_director'), createSubject);

export default router;
