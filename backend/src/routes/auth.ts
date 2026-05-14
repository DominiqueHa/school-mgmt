import { Router } from 'express';
import { login, me, changePassword, updateProfile, selectRole } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post('/login', login);
router.post('/select-role', authenticate, selectRole);
router.get('/me', authenticate, me);
router.put('/change-password', authenticate, changePassword);
router.put('/profile', authenticate, updateProfile);

export default router;
