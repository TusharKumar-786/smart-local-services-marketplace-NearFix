import express from 'express';
import { createReview, getProviderReviews } from '../controllers/reviewController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, requireRole('customer'), createReview);
router.get('/provider/:providerId', getProviderReviews);

export default router;
