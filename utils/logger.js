const fs = require('fs');
const path = require('path');
const winston = require('winston')
const {combine, timestamp, errors,json, colorize,simple} = winston.format;

const logsDir = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
    level : isProduction ? 'info': 'debug',
    format: combine(
        timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        errors ({stack: !isProduction}),
        json()
    ),
    transports : [
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log')
        }),
        new winston.transports.File({
            level: 'error',
            filename: path.join(logsDir, 'error.log')
        }),
        new winston.transports.Console({
            format : isProduction ? combine(timestamp(),json()): combine(colorize(), simple())
        })
    ]
})
module.exports = logger;