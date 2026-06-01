import express from "express";
import multer from "multer";
import { uploadImage } from "../controllers/uploadController.js";
import { authenticateToken } from "../controllers/authController.js";

const router = express.Router();

// Configure multer to store file in memory
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB limit
});

// Protect route so only authenticated users (admins) can upload images
router.post("/", authenticateToken, upload.single("image"), uploadImage);

export default router;
