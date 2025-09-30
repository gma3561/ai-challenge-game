const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const menuRoutes = require('./routes/menu.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler } = require('./utils/error-handler');

const app = express();

// 보안 미들웨어
app.use(helmet());

// CORS 설정
app.use(cors({
  origin: config.allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 요청 제한
const limiter = rateLimit({
  windowMs: config.security.rateLimit.windowMs,
  max: config.security.rateLimit.max,
  standardHeaders: true,
  message: {
    success: false,
    data: null,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
    }
  }
});

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP 로깅
app.use(logger.httpLogger);

// API 라우트
app.use(`${config.api.prefix}/menu`, menuRoutes);
app.use(`${config.api.prefix}/orders`, orderRoutes);
app.use(`${config.api.prefix}/payment`, paymentRoutes);

// 헬스체크
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      environment: config.environment,
      version: '1.0.0'
    },
    error: null
  });
});

// 404 처리
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      code: 'NOT_FOUND',
      message: '요청한 리소스를 찾을 수 없습니다'
    }
  });
});

// 에러 핸들링 미들웨어
app.use(errorHandler);

module.exports = app;