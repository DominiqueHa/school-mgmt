import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getAllFunctions,
  getFunctionsByRole,
  createFunction,
  updateFunction,
  deleteFunction,
  getUserFunctions,
  assignFunction,
  revokeFunction,
} from '../controllers/functionsController';

const router = Router();

const adminRoles = ['super_admin', 'admin', 'director'];

// Fonctions disponibles
router.get('/', authenticate, getAllFunctions);
router.get('/role/:roleId', authenticate, getFunctionsByRole);
router.post('/', authenticate, authorize(...adminRoles), createFunction);
router.put('/:id', authenticate, authorize(...adminRoles), updateFunction);
router.delete('/:id', authenticate, authorize(...adminRoles), deleteFunction);

// Fonctions utilisateur
router.get('/user/:userId', authenticate, getUserFunctions);
router.post('/assign', authenticate, authorize(...adminRoles), assignFunction);
router.post('/revoke', authenticate, authorize(...adminRoles), revokeFunction);

export default router;
