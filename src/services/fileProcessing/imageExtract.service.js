import Tesseract from 'tesseract.js';

export const extractTextFromImage = async (localPath) => {
  const { data } = await Tesseract.recognize(
    localPath,
    'eng'
  );

  return data.text;
}
