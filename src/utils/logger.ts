import winston from 'winston';

const loggerOption: winston.LoggerOptions = {
  exitOnError: false,
  transports: [
    process.env.NODE_ENV === 'production'
      ? new winston.transports.File({
          filename: 'logs/server.log',
          handleExceptions: true,
          maxsize: 5242880
        })
      : new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
    winston.format.align(),
    winston.format.printf((info: any) => `${info.level}: ${[info.timestamp]}: ${info.message}`)
  ),
  levels: winston.config.npm.levels
};

export default winston.createLogger(loggerOption);
