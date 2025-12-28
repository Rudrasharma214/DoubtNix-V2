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
doubtRouter.get('/conversation/:documentId', doubtController.getConversationHistory);

/**
 * GET /api/doubt/conversations/:documentId
 * Get all conversations for a document
 * Query: ?page=1&limit=10
 */
doubtRouter.get('/conversations/:documentId', doubtController.getDocumentConversations);

/**
 * GET /api/doubt/suggestions/:documentId
 * Get AI-generated suggested questions for a document
 */
doubtRouter.get('/suggestions/:documentId', doubtController.getSuggestedQuestions);

/**
 * DELETE /api/doubt/conversation/:conversationId
 * Delete/clear a conversation (soft delete)
 */
doubtRouter.delete('/conversation/:conversationId', doubtController.deleteConversation);

export default doubtRouter;