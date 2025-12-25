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

// Custom delete function
export const deleteFromCloudinary = async (publicId) => {
  try {
    logger.info(`Attempting to delete file from Cloudinary: ${publicId}`);
    
    // Determine resource type based on public_id or try both
    let result;
    
    // Try deleting as image first (most common)
    try {
      result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        timeout: 10000
      });
      
      if (result.result === 'ok') {
        logger.info(`Successfully deleted image from Cloudinary: ${publicId}`);
        return { success: true, result };
      }
    } catch (imageError) {
      logger.warn(`Failed to delete as image, trying as raw: ${publicId}`);
    }
    
    // If image deletion failed, try as raw (for PDFs, docs, etc.)
    try {
      result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw',
        timeout: 10000
      });
      
      if (result.result === 'ok') {
        logger.info(`Successfully deleted raw file from Cloudinary: ${publicId}`);
        return { success: true, result };
      }
    } catch (rawError) {
      logger.error(`Failed to delete as raw file: ${publicId}`, rawError);
    }
    
    // If both failed, log the result
    logger.warn(`Cloudinary deletion result for ${publicId}:`, result);
    return { success: false, result };
    
  } catch (error) {
    logger.error(`Error deleting file from Cloudinary: ${publicId}`, error);
    return { success: false, error: error.message };
  }
};

export default cloudinary;
