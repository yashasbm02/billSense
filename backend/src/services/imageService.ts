import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

export class ImageService {
  private static instance: ImageService;
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || 'uploads';
    this.ensureUploadDir();
  }

  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async processImage(inputPath: string, filename: string): Promise<string> {
    try {
      const outputPath = path.join(this.uploadDir, `processed_${filename}`);
      
      // Process image for better OCR results
      await sharp(inputPath)
        .resize(2000, 2000, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .grayscale()
        .normalize()
        .sharpen()
        .jpeg({ quality: 95 })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.error('Image processing failed:', error);
      throw new Error('Failed to process image');
    }
  }

  async cleanupTempFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn(`Failed to cleanup file ${filePath}:`, error);
      }
    }
  }

  getUploadPath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }
}
