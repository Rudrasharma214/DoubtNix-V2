import STATUS from '../constants/statusCode.js';
import { sendResponse, sendErrorResponse } from '../utils/Response.js';
import * as doubtService from '../services/doubt.service.js';
import logger from '../config/logger.js';

export const askDoubt = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { documentId, question, sessionId, language } = req.body;

        logger.info(`User ${userId} asking question for document ${documentId}`);

        const result = await doubtService.askDoubt({
            userId,
            documentId,
            question,
            sessionId,
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
        const { documentId, sessionId } = req.params;

        logger.info(`Fetching conversation history for user ${userId}, doc ${documentId}, session ${sessionId}`);

        const result = await doubtService.getConversationHistory({
            userId,
            documentId,
            sessionId
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

export const getDocumentConversations = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { documentId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        logger.info(`Fetching all conversations for user ${userId}, doc ${documentId}`);

        const result = await doubtService.getDocumentConversations({
            userId,
            documentId,
            page: parseInt(page),
            limit: parseInt(limit)
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
        logger.error('Error in getDocumentConversations controller:', error);
        next(error);
    }
};

export const getSuggestedQuestions = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { documentId } = req.params;

        logger.info(`Generating suggested questions for user ${userId}, doc ${documentId}`);

        const result = await doubtService.getSuggestedQuestions({
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
        logger.error('Error in getSuggestedQuestions controller:', error);
        next(error);
    }
};

export const deleteConversation = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        const { conversationId } = req.params;

        logger.info(`Deleting conversation ${conversationId} for user ${userId}`);

        const result = await doubtService.deleteConversation({
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