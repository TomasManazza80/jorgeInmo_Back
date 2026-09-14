import express from 'express';
import { logEvent, getLeads } from '../controllers/trackingController.js';
import { authenticateToken } from '../controllers/authController.js';
import { requireRoles } from '../util/roleMiddleware.js';

const router = express.Router();

// Public endpoint to log events
router.post('/event', logEvent);

// Admin endpoint to view leads
router.get('/leads', authenticateToken, requireRoles(['ADMIN']), getLeads);

export default router;
