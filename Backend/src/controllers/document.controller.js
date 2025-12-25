import * as documentService from '../services/document.service.js';
import { sendResponse, sendErrorResponse } from "../utils/Response.js";
import STATUS from "../constants/statusCode.js";
import logger from '../config/logger.js';

export const uploadDocument = async (req, res, next) => {
  try {
    logger.info('Document upload initiated', { userId: req.user?.id });

    // Check if file was uploaded
    if (!req.file) {
      logger.error('No file uploaded in request');
      return sendErrorResponse(
        res,
        STATUS.BAD_REQUEST,
        'No file uploaded',
        'Please select a file to upload'
      );
    }

    const { id } = req.user;
    const { originalname, size, mimetype } = req.file;
    const fileUrl = req.file.path;
    const publicId = req.file.filename;

    // Additional validation for required file properties
    if (!originalname || !fileUrl || !publicId) {
      logger.error('Incomplete file upload data', { originalname, fileUrl, publicId });
      return sendErrorResponse(
        res,
        STATUS.INTERNAL_ERROR,
        'File upload incomplete',
        'File was not processed correctly by the server'
      );
    }

    const result = await documentService.uploadDocument({
        id,
        filename: originalname,
        fileType: mimetype,
        fileUrl,
        cloudinaryPublicId: publicId,
        fileSize: size
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
    next(error);
  }
};

export const getUserDocuments = async (req, res, next) => {
    try {
        const { id } = req.user;
        const { page = 1, limit = 10, search } = req.query;

        const result = await documentService.getUserDocuments({
            id,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            search
        });

        if (!result.success) {
            return sendErrorResponse(res, result.status, result.message, result.errors);
        }

        sendResponse(res, result.status, result.message, result.data);
    } catch (error) {
        next(error);
    }
}

export const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.user;
    const { documentId } = req.params;

    const result = await documentService.deleteDocument({ userId: id, documentId });

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
    next(error);
  }
};