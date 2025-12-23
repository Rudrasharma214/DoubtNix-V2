import * as pdf from 'pdf-parse';
import AppError from '../../utils/AppError.js';
import STATUS from '../../constants/statusCode.js';

export const extractTextFromPDF = async (localPath) => {
  const buffer = await fs.promises.readFile(localPath);
  const data = await pdf(buffer);

  if (!data.text || data.text.trim().length < 50) {
    throw new AppError('Scanned PDF OCR required', STATUS.BAD_REQUEST);
  }

  return data.text;
}
