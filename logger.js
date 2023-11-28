const winston = require('winston');
const morgan = require('morgan');

// Winston logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Morgan middleware setup
const morganMiddleware = morgan('tiny', {
  stream: {
    write: message => logger.info(message.trim())
  }
});

module.exports = { logger, morganMiddleware };
