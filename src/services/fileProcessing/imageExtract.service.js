import Tesseract from 'tesseract.js';
import path from 'path';
import os from 'os';
import logger from '../../config/logger.js';

export const extractTextFromImage = async (localPath) => {
  try {
    // Configure Tesseract with proper cache directory
    const worker = await Tesseract.createWorker('eng', 1, {
      cachePath: path.join(os.tmpdir(), 'tesseract-cache'),
      logger: m => logger.info(`Tesseract: ${m.status} ${m.progress ? `(${Math.round(m.progress * 100)}%)` : ''}`)
    });

    const { data } = await worker.recognize(localPath);
    
    await worker.terminate();
    
    return data.text;
  } catch (error) {
    logger.error('Image text extraction failed:', error);
    throw error;
  }
}
