import { Router } from 'express';
import { OCRController } from '../controllers/ocrController';
import upload from '../middleware/upload';

const router = Router();

// OCR & Image Processing
router.post('/scan', upload.single('receipt'), OCRController.scanReceipt);
router.post('/extract', upload.single('receipt'), OCRController.extractText);

export default router;
