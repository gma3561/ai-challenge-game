const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// 로그 디렉토리 생성
const logDir = path.resolve(config.logging.directory);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 로그 포맷 설정
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 개발 환경용 콘솔 포맷 설정
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `[${timestamp}] ${level}: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

// 로거 설정
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'starbucks-app-backend' },
  transports: [
    // 파일 로그 (에러 수준)
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 파일 로그 (모든 수준)
    new winston.transports.File({ 
      filename: path.join(logDir, config.logging.filename),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 개발 환경에서는 콘솔 출력 추가
if (config.environment !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// HTTP 요청 로깅용 미들웨어
logger.httpLogger = (req, res, next) => {
  const start = new Date();
  
  // 응답 완료 이벤트 리스너
  res.on('finish', () => {
    const responseTime = new Date() - start;
    
    logger.http({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('user-agent') || '',
      ip: req.ip,
    });
  });
  
  next();
};

module.exports = logger;