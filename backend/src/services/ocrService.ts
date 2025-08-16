import Tesseract from 'tesseract.js';
import { BillScanResult } from '@billsense/shared';

export class OCRService {
  private static instance: OCRService;

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  async extractTextFromImage(imagePath: string): Promise<string> {
    try {
      const { data: { text, confidence } } = await Tesseract.recognize(
        imagePath,
        process.env.OCR_LANGUAGE || 'eng',
        {
          logger: m => console.log(m)
        }
      );

      if (confidence < parseInt(process.env.OCR_CONFIDENCE_THRESHOLD || '60')) {
        throw new Error(`OCR confidence too low: ${confidence}%`);
      }

      return text;
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  parseReceiptText(text: string): BillScanResult {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const items: Array<{ name: string; price: number; quantity: number }> = [];
    let subtotal = 0;
    let tax = 0;
    let tip = 0;
    let total = 0;

    // Regex patterns for common receipt formats
    const pricePattern = /\$?(\d+\.?\d*)/;
    const itemPattern = /^(.+?)\s+\$?(\d+\.?\d*)$/;
    const subtotalPattern = /subtotal|sub total|sub-total/i;
    const taxPattern = /tax|hst|gst|pst/i;
    const tipPattern = /tip|gratuity/i;
    const totalPattern = /total|amount due|balance/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for totals first
      if (totalPattern.test(line)) {
        const match = line.match(pricePattern);
        if (match) {
          total = parseFloat(match[1]);
        }
        continue;
      }

      if (subtotalPattern.test(line)) {
        const match = line.match(pricePattern);
        if (match) {
          subtotal = parseFloat(match[1]);
        }
        continue;
      }

      if (taxPattern.test(line)) {
        const match = line.match(pricePattern);
        if (match) {
          tax = parseFloat(match[1]);
        }
        continue;
      }

      if (tipPattern.test(line)) {
        const match = line.match(pricePattern);
        if (match) {
          tip = parseFloat(match[1]);
        }
        continue;
      }

      // Try to parse as item
      const itemMatch = line.match(itemPattern);
      if (itemMatch) {
        const name = itemMatch[1].trim();
        const price = parseFloat(itemMatch[2]);
        
        // Skip if name looks like a total/tax line
        if (!totalPattern.test(name) && !taxPattern.test(name) && !tipPattern.test(name)) {
          items.push({
            name,
            price,
            quantity: 1
          });
        }
      }
    }

    // Calculate subtotal if not found
    if (subtotal === 0 && items.length > 0) {
      subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Calculate total if not found
    if (total === 0) {
      total = subtotal + tax + tip;
    }

    return {
      items,
      subtotal,
      tax,
      tip,
      total,
      confidence: 85 // Mock confidence for now
    };
  }

  async processReceiptImage(imagePath: string): Promise<BillScanResult> {
    const text = await this.extractTextFromImage(imagePath);
    return this.parseReceiptText(text);
  }
}
