import app from './app.js';
import connectDB from './config/connectDB.js';
import { env } from './config/env.js';
import logger from './config/logger.js';

const  PORT = env.PORT;

connectDB();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
} 


app.listen(PORT, ()=>{
    logger.warn(`Server is running on port ${PORT}`);
})