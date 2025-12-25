import express from 'express';
import authRouter from './auth.routes.js';
import documentRouter from './document.routes.js';
import conversationRouter from './conversation.routes.js';
import doubtRouter from './doubt.routes.js';

const routes = express.Router();

routes.use('/auth', authRouter);
routes.use('/documents', documentRouter);
routes.use('/conversations', conversationRouter);
routes.use('/doubt', doubtRouter);

export default routes;