import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: isProduction ? 'warn' : 'debug',
  format: combine(
    colorize({ all: !isProduction }), 
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
  ],
  exitOnError: false,
});

export default logger;
