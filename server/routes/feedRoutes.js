import express from 'express';
import { generateZonapropFeed } from '../controllers/feedController.js';

const router = express.Router();

// Zonaprop XML Feed Endpoint
router.get('/zonaprop.xml', generateZonapropFeed);

export default router;
