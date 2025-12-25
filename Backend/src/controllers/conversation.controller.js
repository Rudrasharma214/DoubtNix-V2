import * as conversationService from '../services/conversation.service.js';
import { sendErrorResponse, sendResponse } from '../utils/Response.js';


export const getConversations = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { page = 1, limit = 10, search = '' } = req.query;
        const conversations = await conversationService.getConversations({ userId, page, limit, search });

        if(!conversations.success) {
            return sendErrorResponse(res, conversations.status, conversations.message, conversations.errors);
        }

        return sendResponse(res, conversations.status, conversations.message, conversations.data);
    } catch (error) {
        next(error);
    }
};

export const getConversationsById = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const { id: userId } = req.user;

        const result = await conversationService.getConversationById(conversationId, userId);

        if(!result.success) {
            return sendErrorResponse(res, result.status, result.message, result.errors);
        }

        return sendResponse(res, result.status, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const updateConversationTitle = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const { id: userId } = req.user;
        const { title } = req.body;

        const result = await conversationService.updateConversationTitle(conversationId, userId, title);

        if(!result.success) {
            return sendErrorResponse(res, result.status, result.message, result.errors);
        }

        return sendResponse(res, result.status, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const deleteConversation = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const { id: userId } = req.user;

        const result = await conversationService.deleteConversation(conversationId, userId);

        if(!result.success) {
            return sendErrorResponse(res, result.status, result.message, result.errors);
        }

        return sendResponse(res, result.status, result.message, result.data);
    } catch (error) {
        next(error);
    }
};

export const conversationStats = async (req, res, next) => {
    try {
        const { id: userId } = req.user;

        const result = await conversationService.getConversationStats(userId);

        if(!result.success) {
            return sendErrorResponse(res, result.status, result.message, result.errors);
        }
        return sendResponse(res, result.status, result.message, result.data);
    } catch (error) {
        next(error);
    }
};