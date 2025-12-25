import multer from 'multer';
import { storage, uploadToCloudinary } from '../config/cloudinary.js';
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
    fileSize: parseInt(env.MAX_FILE_SIZE) || 10 * 1024 * 1024,
    files: 1,
    fieldSize: 1024 * 1024
  }
});


/**
 * Export single-file upload middleware with error handling
 * Client field name must be: "file"
 */
export const uploadSingleDocument = (req, res, next) => {
  logger.info('Starting file upload middleware');
  
  // Set a timeout for the entire upload process
  const timeout = setTimeout(() => {
    logger.error('Upload timeout - operation took too long');
    if (!res.headersSent) {
      return sendErrorResponse(
        res,
        STATUS.INTERNAL_ERROR,
        'Upload timeout',
        'File upload took too long and was cancelled'
      );
    }
  }, 45000);
  
  const uploadMiddleware = upload.single('file');
  
  uploadMiddleware(req, res, async (err) => {
    clearTimeout(timeout); // Clear timeout on completion
    
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
    
    logger.info('Upload middleware completed without errors');
    
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
    
    try {
      logger.info('Starting manual Cloudinary upload');
      const cloudinaryResult = await uploadToCloudinary(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );
      
      // Attach Cloudinary result to req.file for controller use
      req.file.path = cloudinaryResult.secure_url;
      req.file.filename = cloudinaryResult.public_id;
      
      logger.info('File upload middleware completed successfully', {
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path,
        filename_cloudinary: req.file.filename
      });
      
      next();
    } catch (uploadError) {
      logger.error('Cloudinary upload failed:', uploadError);
      return sendErrorResponse(
        res,
        STATUS.INTERNAL_ERROR,
        'File upload to cloud storage failed',
        uploadError.message
      );
    }
  });
};
