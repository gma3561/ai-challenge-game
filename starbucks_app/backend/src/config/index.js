require('dotenv').config();

const config = {
  // 서버 설정
  port: process.env.PORT || 3001,
  environment: process.env.NODE_ENV || 'development',
  
  // 데이터 설정
  dbPath: process.env.DB_PATH || 'db.json',
  
  // CORS 설정
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  
  // 로그 설정
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filename: process.env.LOG_FILENAME || 'app.log',
    directory: process.env.LOG_DIRECTORY || 'logs',
  },
  
  // 캐시 설정
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10), // 기본 5분
    checkperiod: parseInt(process.env.CACHE_CHECK_PERIOD || '60', 10), // 기본 1분
  },
  
  // API 설정
  api: {
    prefix: '/api',
    version: 'v1',
  },
  
  // 보안 설정
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15분
      max: 100, // IP당 요청 제한
    },
  },
};

module.exports = config;