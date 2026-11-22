import express from 'express';
import {
  getAnalyticsSummary,
  listUsers,
  toggleBlockUser,
  listPendingProviders,
  updateProviderVerification,
  listAllComplaints,
  updateComplaintStatus,
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth, requireRole('admin'));

router.get('/analytics', getAnalyticsSummary);
router.get('/users', listUsers);
router.patch('/users/:userId/toggle-block', toggleBlockUser);
router.get('/providers/verification', listPendingProviders);
router.patch('/providers/:providerId/verification', updateProviderVerification);
router.get('/complaints', listAllComplaints);
router.patch('/complaints/:complaintId', updateComplaintStatus);

export default router;
