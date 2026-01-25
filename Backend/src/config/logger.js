import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let metaStr = '';
  if (Object.keys(meta).length > 0) {
    metaStr = ' ' + JSON.stringify(meta, null, 2);
  }
  return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
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
