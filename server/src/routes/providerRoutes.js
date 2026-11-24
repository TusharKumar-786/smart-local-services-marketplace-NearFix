import express from 'express';
import {
  searchProviders,
  getProviderById,
  updateOwnProfile,
  toggleAvailability,
} from '../controllers/providerController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', searchProviders);
router.get('/:id', getProviderById);
router.patch('/profile', requireAuth, requireRole('provider'), updateOwnProfile);
router.post('/toggle-availability', requireAuth, requireRole('provider'), toggleAvailability);
router.patch('/availability', requireAuth, requireRole('provider'), toggleAvailability);

export default router;
