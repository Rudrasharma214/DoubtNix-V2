import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import { env } from './env.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);

    const ext = path.extname(file.originalname).toLowerCase();
    const name = path.basename(file.originalname, ext);

    // PDFs and documents should be 'raw', images should be 'image'
    const resourceType = ['.pdf', '.doc', '.docx', '.txt'].includes(ext) ? 'raw' : 'image';

    return {
      folder: 'DoubtNix',
      resource_type: resourceType,
      public_id: `${timestamp}-${randomString}-${name}`,
      use_filename: false,
      unique_filename: false,
      access_mode: 'public'
    };
  }
});

export default cloudinary;
