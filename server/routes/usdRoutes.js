import express from 'express';
import { getClients, createClient, createTransaction, getTransactions, getMetrics, updateTransaction } from '../controllers/usdController.js';

const router = express.Router();

router.get('/clients', getClients);
router.post('/clients', createClient);

router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);
router.put('/transactions/:id', updateTransaction);

router.get('/metrics', getMetrics);

export default router;
