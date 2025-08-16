import { Request, Response } from 'express';
import { OCRService } from '../services/ocrService';
import { ImageService } from '../services/imageService';

export class OCRController {
  private static ocrService = OCRService.getInstance();
  private static imageService = ImageService.getInstance();

  static async scanReceipt(req: Request, res: Response): Promise<void> {
    let tempFiles: string[] = [];

    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
        return;
      }

      const originalPath = req.file.path;
      tempFiles.push(originalPath);

      // Process image for better OCR results
      const processedPath = await OCRController.imageService.processImage(
        originalPath,
        req.file.filename
      );
      tempFiles.push(processedPath);

      // Extract and parse receipt data
      const scanResult = await OCRController.ocrService.processReceiptImage(processedPath);

      res.json({
        success: true,
        data: scanResult
      });
    } catch (error) {
      console.error('Error scanning receipt:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to scan receipt'
      });
    } finally {
      // Cleanup temporary files
      if (tempFiles.length > 0) {
        OCRController.imageService.cleanupTempFiles(tempFiles).catch(console.error);
      }
    }
  }

  static async extractText(req: Request, res: Response): Promise<void> {
    let tempFiles: string[] = [];

    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
        return;
      }

      const originalPath = req.file.path;
      tempFiles.push(originalPath);

      // Process image for better OCR results
      const processedPath = await OCRController.imageService.processImage(
        originalPath,
        req.file.filename
      );
      tempFiles.push(processedPath);

      // Extract text only
      const text = await OCRController.ocrService.extractTextFromImage(processedPath);

      res.json({
        success: true,
        data: { text }
      });
    } catch (error) {
      console.error('Error extracting text:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to extract text'
      });
    } finally {
      // Cleanup temporary files
      if (tempFiles.length > 0) {
        OCRController.imageService.cleanupTempFiles(tempFiles).catch(console.error);
      }
    }
  }
}
