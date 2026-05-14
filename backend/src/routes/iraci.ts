import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import {
  getMyRequests,
  getPendingRequests,
  getRequestById,
  advanceRequest,
  initRequest,
} from '../controllers/iraciController';

const router = Router();
const adminRoles = ['super_admin', 'admin', 'director', 'deputy_director', 'censor'];

router.get('/my-requests', authenticate, getMyRequests);
router.get('/pending', authenticate, authorize(...adminRoles), getPendingRequests);
router.get('/:id', authenticate, getRequestById);
router.post('/', authenticate, initRequest);
router.put('/:id/advance', authenticate, authorize(...adminRoles), advanceRequest);

export default router;
