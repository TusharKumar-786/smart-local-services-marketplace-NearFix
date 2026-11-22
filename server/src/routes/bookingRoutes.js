import express from 'express';
import {
  createBooking,
  getCustomerBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, createBooking);
router.get('/customer', requireAuth, requireRole('customer'), getCustomerBookings);
router.get('/provider', requireAuth, requireRole('provider'), getProviderBookings);
router.get('/:id', requireAuth, getBookingById);
router.patch('/:id/status', requireAuth, updateBookingStatus);

export default router;
