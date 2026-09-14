import express from 'express';
import { getDeals, createDeal, updateDealStage } from '../controllers/salesController.js';
import { authenticateToken } from '../controllers/authController.js';

const router = express.Router();

router.get('/', authenticateToken, getDeals);
router.post('/', authenticateToken, createDeal);
router.put('/:id/stage', authenticateToken, updateDealStage);

export default router;
