import express from 'express';
import { processPayment, getMyPayments } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/simulate', requireAuth, processPayment);
router.get('/my-payments', requireAuth, getMyPayments);

export default router;
