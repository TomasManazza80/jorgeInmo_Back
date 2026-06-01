import express from 'express';
import * as realEstateController from "../controllers/realEstateController.js";

const router = express.Router();

// Public Properties
router.get('/properties', realEstateController.getPublicProperties);
router.get('/properties/:id', realEstateController.getPublicProperty);

export default router;

