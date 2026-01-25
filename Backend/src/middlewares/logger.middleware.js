import logger from "../config/logger.js";

// Request logging middleware
export const requestLogger = (req, res, next) => {
  // Get client IP address
  const ip = req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    'Unknown IP';

  // Store the start time
  const startTime = Date.now();
  const requestTime = new Date().toISOString();

  // Log incoming request
  logger.info("Incoming Request", {
    ip,
    method: req.method,
    endpoint: req.originalUrl,
    requestTime,
    body: req.body,
  });

  // Intercept response to log it
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const responseTime = new Date().toISOString();

    logger.info("Response Sent", {
      ip,
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      requestTime,
      responseTime,
      responseTimeMs: `${duration}ms`,
    });

    return originalSend.call(this, data);
  };

  next();
};

// Error handler middleware (kept from original)
export default function errorHandler(err, req, res, next) {
  const ip = req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    'Unknown IP';

  logger.error("Unhandled error", {
    ip,
    method: req.method,
    endpoint: req.originalUrl,
    statusCode: err.statusCode || 500,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}
