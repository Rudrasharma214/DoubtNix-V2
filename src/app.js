import express from 'express';
import errorHandler from './middlewares/error.middleware';
import cookieParser from "cookie-parser";
import cors from 'cors';
import { env } from './config/env';
import routes from './routes/index.js';

const app = express();

app.use(cookieParser());
app.use(express.json());

const allowedOrigin = env.NODE_ENV === 'production' ? 
                    env.CLIENT_URL : 'http://localhost:3000';

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

app.use('/api', routes);

app.use(errorHandler);

export default app;