import STATUS from "../constants/statusCode.js";
import AppError from "../utils/AppError.js";

const errorHandler = (err, req, res, next) => {
  // Smart status code detection - use my AppError codes or default to 500
  const statusCode = err instanceof AppError ? err.statusCode : STATUS.INTERNAL_ERROR;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Something went wrong', // User-friendly message
    status: statusCode,
    // Security first - only expose stack traces during development
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

export default errorHandler;