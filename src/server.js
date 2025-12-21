import app from './app.js';
import connectDB from './config/connectDB.js';
import { env } from './config/env.js';
import logger from './utils/logger.js';

const  PORT = env.PORT;

connectDB();

app.listen(PORT, ()=>{
    logger.info(`Server is running on port ${PORT}`);
})