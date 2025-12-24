import fs from 'fs';
import AppError from '../../utils/AppError.js';
import STATUS from '../../constants/statusCode.js';

export const extractTextFromPDF = async (localPath) => {
  const buffer = await fs.promises.readFile(localPath);
  
  // Convert Buffer to Uint8Array
  const uint8Array = new Uint8Array(buffer);
  
  // Use dynamic import for CommonJS module and access PDFParse
  const { PDFParse } = await import('pdf-parse');
  
  // Create instance with Uint8Array
  const parser = new PDFParse(uint8Array, {
    verbosity: 0
  });
  
  // Extract text using getText method
  const textResult = await parser.getText();
  
  // getText might return an object or string, handle both cases
  const text = typeof textResult === 'string' ? textResult : (textResult?.text || JSON.stringify(textResult));
  
  if (!text || text.trim().length < 50) {
    throw new AppError('Scanned PDF OCR required', STATUS.BAD_REQUEST);
  }

  return text;
}
