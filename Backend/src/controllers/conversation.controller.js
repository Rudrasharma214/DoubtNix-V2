import * as conversationService from '../services/conversation.service.js';
import { sendErrorResponse, sendResponse } from '../utils/Response.js';


export const getConversations = async (req, res, next) => {
    try {
        const { documentId } = req.params;
        const { id: userId } = req.user;

        const conversations = await conversationService.getConversations(documentId, userId);

        if(!conversations.success) {
            return sendErrorResponse(res, conversations.status, conversations.message, conversations.errors);
        }

        return sendResponse(res, conversations.status, conversations.message, conversations.data);
    } catch (error) {
        next(error);
    }
};