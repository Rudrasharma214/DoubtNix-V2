import STATUS from '../constants/statusCode.js';

/**
 * Send a standardized API response
 * I use this everywhere to maintain consistency across my entire API
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - User-friendly message
 * @param {Any} data - Optional payload data
 */

export default sendResponse = (res, statusCode = STATUS.OK, message, data = null) => {
    const response = {
        success: true,
        status: statusCode,
        message,
        data,
    }
    return res.status(statusCode).json(response);
}

export const sendErrorResponse = (res, statusCode = STATUS.INTERNAL_ERROR, message, errors = null) => {
    const response = {
        success: false,
        status: statusCode,
        message,
        errors,
    }
    return res.status(statusCode).json(response);
}