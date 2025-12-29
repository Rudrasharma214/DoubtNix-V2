import app from './app.js';
import connectDB from './config/connectDB.js';
import { env } from './config/env.js';
import logger from './config/logger.js';

const  PORT = env.PORT;

connectDB();

app.listen(PORT, ()=>{
    logger.warn(`Server is running on port ${PORT}`);
})