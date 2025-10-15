import express from "express";
import { initializeUpload, uploadChunk, completeUpload } from "../controllers/multipartupload.controller.js";
import multer from 'multer';

const upload = multer({
    limits: {
        fileSize: 6 * 1024 * 1024 // 3MB limit per chunk (leave some buffer for headers)
    },
    storage: multer.memoryStorage()
});

const router = express.Router();

// Route for initializing upload
router.post('/initialize', upload.none(), initializeUpload);

// Route for uploading individual chunks
router.post('/', upload.single('chunk'), uploadChunk);

// Route for completing the upload
router.post('/complete', express.json(), completeUpload);

export default router;