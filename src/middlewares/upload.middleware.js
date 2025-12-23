import multer from 'multer';
import path from 'path';
import os from 'os';

/**
 * Allowed MIME types
 */
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

/**
 * Storage configuration
 * Files are stored temporarily in OS temp directory
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, os.tmpdir());
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `upload_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

/**
 * File filter (basic MIME validation)
 */
const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new Error('Unsupported file type. Only PDF, DOCX, and images are allowed.'),
      false
    );
  }
  cb(null, true);
};

/**
 * Multer instance
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});

/**
 * Export single-file upload middleware
 * Client field name must be: "file"
 */
export const uploadSingleDocument = upload.single('file');
