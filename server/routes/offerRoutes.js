import express from 'express';
import { getOffers, createOffer, updateOfferStatus } from '../controllers/offerController.js';
import { authenticateToken } from '../controllers/authController.js';

const router = express.Router();

router.get('/', authenticateToken, getOffers);
router.post('/', authenticateToken, createOffer);
router.put('/:id/status', authenticateToken, updateOfferStatus);

export default router;
