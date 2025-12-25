import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import path from 'path';
import { env } from './env.js';
import logger from './logger.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
  timeout: 10000,
});

// Use memory storage instead of CloudinaryStorage
export const storage = multer.memoryStorage();

// Custom upload function
export const uploadToCloudinary = async (fileBuffer, filename, mimetype) => {
  return new Promise((resolve, reject) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).slice(2);
    
    const ext = path.extname(filename).toLowerCase();
    const name = path.basename(filename, ext);
    
    const sanitizedName = name
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 50);
    
    const resourceType = ['.pdf', '.doc', '.docx', '.txt'].includes(ext) ? 'raw' : 'image';
    const publicId = `${timestamp}-${randomString}-${sanitizedName}`;
    
    const options = {
      folder: 'DoubtNix',
      resource_type: resourceType,
      public_id: publicId,
      access_mode: 'public',
      timeout: 10000
    };
    
    cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(fileBuffer);
  });
};

export default cloudinary;
