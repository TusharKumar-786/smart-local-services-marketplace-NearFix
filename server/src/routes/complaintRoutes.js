import express from 'express';
import { createComplaint, getMyComplaints } from '../controllers/complaintController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, createComplaint);
router.get('/my-complaints', requireAuth, getMyComplaints);

export default router;
