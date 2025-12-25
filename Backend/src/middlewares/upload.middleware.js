import multer from 'multer';
import { storage } from '../config/cloudinary.js';
import logger from '../config/logger.js';
import { env } from '../config/env.js';
import { sendErrorResponse } from '../utils/Response.js';
import STATUS from '../constants/statusCode.js';

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
 * Export single-file upload middleware with error handling
 * Client field name must be: "file"
 */
export const uploadSingleDocument = (req, res, next) => {
  const uploadMiddleware = upload.single('file');
  
  uploadMiddleware(req, res, (err) => {
    if (err) {
      logger.error('Upload middleware error:', err);
      
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            return sendErrorResponse(
              res,
              STATUS.BAD_REQUEST,
              'File too large',
              'Maximum file size is 10MB'
            );
          case 'LIMIT_FILE_COUNT':
            return sendErrorResponse(
              res,
              STATUS.BAD_REQUEST,
              'Too many files',
              'Only one file allowed'
            );
          case 'LIMIT_UNEXPECTED_FILE':
            return sendErrorResponse(
              res,
              STATUS.BAD_REQUEST,
              'Unexpected field',
              'File field must be named "file"'
            );
          default:
            return sendErrorResponse(
              res,
              STATUS.BAD_REQUEST,
              'File upload error',
              err.message
            );
        }
      }
      
      // Other errors (e.g., invalid file type)
      return sendErrorResponse(
        res,
        STATUS.BAD_REQUEST,
        'File upload failed',
        err.message
      );
    }
    
    // Check if file was actually uploaded after middleware processing
    if (!req.file) {
      logger.error('No file attached to request after upload middleware');
      return sendErrorResponse(
        res,
        STATUS.BAD_REQUEST,
        'No file uploaded',
        'Please select a file to upload'
      );
    }
    
    logger.info('File upload middleware completed successfully', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    next();
  });
};
