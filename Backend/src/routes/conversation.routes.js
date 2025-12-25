import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as conversationController from '../controllers/conversation.controller.js';

const conversationRouter = express.Router();

conversationRouter.use(authenticate);

conversationRouter.get('/', conversationController.getConversations);

conversationRouter.get('/:conversationId', conversationController.getConversationsById);

conversationRouter.patch('/:conversationId', conversationController.updateConversationTitle);

conversationRouter.delete('/:conversationId', conversationController.deleteConversation);

conversationRouter.get('/stats', conversationController.conversationStats);


export default conversationRouter;