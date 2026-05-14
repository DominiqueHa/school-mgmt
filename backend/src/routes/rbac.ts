import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getRoles, getPermissions, getRolePermissions,
  grantPermission, revokePermission, getAllRolesWithPermissions,
} from '../controllers/rbacController';

const router = Router();

router.get('/roles', authenticate, authorize('director', 'admin'), getRoles);
router.get('/permissions', authenticate, authorize('director', 'admin'), getPermissions);
router.get('/roles/:roleId/permissions', authenticate, authorize('director', 'admin'), getRolePermissions);
router.get('/matrix', authenticate, authorize('director', 'admin'), getAllRolesWithPermissions);
router.post('/grant', authenticate, authorize('director', 'admin'), grantPermission);
router.delete('/revoke', authenticate, authorize('director', 'admin'), revokePermission);

export default router;
