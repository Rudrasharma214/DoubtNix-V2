import express from 'express';
import errorHandler from './middlewares/error.middleware.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { generalLimiter } from './middlewares/rateLimit.middleware.js';
import './events/listeners/email.listener.js';
import './events/listeners/document.listener.js';

const app = express();

app.use(cookieParser());
app.use(express.json());

const allowedOrigin = env.NODE_ENV === 'production' ? 
                    env.CLIENT_URL : 'http://localhost:5173';

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

// Apply rate limiting to all routes
app.use(generalLimiter);

app.get('/api/health', (req, res) => {
  res.send('API is running...');
});

app.use('/api', routes);

app.use(errorHandler);

export default app;