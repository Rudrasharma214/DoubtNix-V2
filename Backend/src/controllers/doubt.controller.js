import { sendResponse, sendErrorResponse } from '../utils/Response.js';
import * as doubtService from '../services/doubt.service.js';
import logger from '../config/logger.js';

export const askDoubt = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { documentId, question, language } = req.body;

        logger.info(`User ${userId} asking question for document ${documentId}`);

        const result = await doubtService.askDoubt({
            userId,
            documentId,
            question,
            language
        });

        if (!result.success) {
            return sendErrorResponse(
                res,
                result.status,
                result.message,
                result.errors
            );
        }

        return sendResponse(
            res,
            result.status,
            result.message,
            result.data
        );
    } catch (error) {
        logger.error('Error in askDoubt controller:', error);
        next(error);
    }
};

export const getConversationHistory = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { documentId } = req.params;

        logger.info(`Fetching conversation history for user ${userId}, doc ${documentId}`);

        const result = await doubtService.getConversationHistory({
            userId,
            documentId
        });

        if (!result.success) {
            return sendErrorResponse(
                res,
                result.status,
                result.message,
                result.errors
            );
        }

        return sendResponse(
            res,
            result.status,
            result.message,
            result.data
        );
    } catch (error) {
        logger.error('Error in getConversationHistory controller:', error);
        next(error);
    }
};

export const deleteConversationMessages = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { conversationId } = req.params;

        logger.info(`Deleting conversation ${conversationId} for user ${userId}`);

        const result = await doubtService.deleteConversationMessages({
            userId,
            conversationId
        });

        if (!result.success) {
            return sendErrorResponse(
                res,
                result.status,
                result.message,
                result.errors
            );
        }

        return sendResponse(
            res,
            result.status,
            result.message,
            result.data
        );
    } catch (error) {
        logger.error('Error in deleteConversation controller:', error);
        next(error);
    }
};