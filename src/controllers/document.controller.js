import * as documentService from '../services/document.service.js';
import { sendResponse, sendErrorResponse } from "../utils/Response.js";
import STATUS from "../constants/statusCode.js";
import logger from '../config/logger.js';

export const uploadDocument = async (req, res, next) => {
    try {
        logger.info('Document upload initiated', req.user);
        const { id } = req.user;
        const file = req.file;

        if (!file) {
            return sendErrorResponse(res, STATUS.BAD_REQUEST, 'No file uploaded');
        };

        const result = await documentService.uploadDocument(id, file);

        if (!result.success) {
            return sendErrorResponse(res, result.status, result.message, result.errors);
        };

        sendResponse(res, result.status, result.message, result.data);
    } catch (error) {
        next(error);
    }
}

export const getUserDocuments = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { page = 1, limit = 10 } = req.query;

        const result = await documentService.getUserDocuments({
            id,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10)
        });

        if (!result.success) {
            return sendErrorResponse(res, result.status, result.message, result.errors);
        }

        sendResponse(res, result.status, result.message, result.data);
    } catch (error) {
        next(error);
    }
}