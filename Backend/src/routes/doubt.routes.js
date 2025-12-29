import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import * as doubtController from '../controllers/doubt.controller.js';

const doubtRouter = express.Router();

doubtRouter.use(authenticate);

/**
 * POST /api/doubt/ask
 * Submit a question about a document
 * Body: { documentId, question, language? }
 */
doubtRouter.post('/ask', doubtController.askDoubt);

/**
 * GET /api/doubt/conversation/:documentId
 * Get conversation history for a document
 */
doubtRouter.get('/:documentId', doubtController.getConversationHistory);

/**
 * DELETE /api/doubt/conversation/:conversationId
 * Delete/clear a conversation
 */
doubtRouter.delete('/:conversationId', doubtController.deleteConversationMessages);

export default doubtRouter;