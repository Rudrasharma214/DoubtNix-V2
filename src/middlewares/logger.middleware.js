import logger from "../utils/logger.js";

export default function errorHandler(err, req, res, next) {
  logger.error("Unhandled error", {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: err.stack,
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}
