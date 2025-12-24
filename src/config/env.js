import dotenv from 'dotenv';
dotenv.config({quiet: true});

export const env = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/myapp',
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'your_jwt_access_secret',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret',
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRY || '15m',
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRY || '7d',
    BREVO_API_KEY: process.env.BREVO_API_KEY || '',
    BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL || 'no-reply@example.com',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    OTP_SECRET: process.env.OTP_SECRET || 'your_otp_secret',
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10485760' // 10MB default
}