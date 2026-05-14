import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getMyProfile,
  completeMyProfile,
  getPendingProfiles,
  validateProfile,
  getProfileByUserId,
} from '../controllers/profileController';

const router = Router();
const adminRoles = ['super_admin', 'admin', 'director', 'deputy_director'];

router.get('/me', authenticate, getMyProfile);
router.put('/me/complete', authenticate, completeMyProfile);
router.get('/pending', authenticate, authorize(...adminRoles), getPendingProfiles);
router.get('/:userId', authenticate, authorize(...adminRoles), getProfileByUserId);
router.put('/:userId/validate', authenticate, authorize(...adminRoles), validateProfile);

export default router;
