import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
} from '../controllers/usersController';

const router = Router();

const adminRoles = ['director', 'admin'];

router.get('/', authenticate, authorize(...adminRoles), getAllUsers);
router.post('/', authenticate, authorize(...adminRoles), createUser);
router.put('/:id', authenticate, authorize(...adminRoles), updateUser);
router.delete('/:id', authenticate, authorize(...adminRoles), deleteUser);
router.post('/:id/reset-password', authenticate, authorize(...adminRoles), resetPassword);

export default router;
