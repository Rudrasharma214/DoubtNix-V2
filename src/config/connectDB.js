import mongoose from 'mongoose';
import logger from '../config/logger.js';
import { env } from './env.js';

const connectDB = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error(`Error connecting to the database: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;