import multer from 'multer';
import { storage } from '../config/cloudinary.js';
import logger from '../config/logger.js';
import { env } from '../config/env.js';

const fileFilter = (req, file, cb) => {

  const allowedMimeTypes = [
    // PDF files
    'application/pdf',

    // Word documents
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-word',
    'application/word',
    'application/x-msword',

    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',

    // Additional common variations
    'application/x-pdf',
    'text/pdf',
    'image/pjpeg' // IE JPEG variant
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    logger.info(`Accepted file upload with MIME type: ${file.mimetype}`);
    cb(null, true);
  } else {
    logger.error(`Rejected file upload with MIME type: ${file.mimetype}`);
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, PNG, and GIF files are allowed.'), false);
  }
};


// Configure multer with Cloudinary storage
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1 // Only allow one file at a time
  }
});


/**
 * Export single-file upload middleware
 * Client field name must be: "file"
 */
export const uploadSingleDocument = upload.single('file');
