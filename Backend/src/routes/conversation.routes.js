import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as conversationController from '../controllers/conversation.controller.js';

const conversationRouter = express.Router();

conversationRouter.use(authenticate);

conversationRouter.get('/:documentId', conversationController.getConversations);



export default conversationRouter;