import dotenv from 'dotenv';
dotenv.config({quiet: true});

export const env = {
    PORT: process.env.PORT || 3000,
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/myapp',
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'your_jwt_access_secret',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret',
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES || '7d',
    BREVO_API_KEY: process.env.BREVO_API_KEY || '',
    BREVO_FROM_EMAIL: process.env.BREVO_FROM_EMAIL || 'no-reply@example.com',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
}