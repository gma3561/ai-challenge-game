const { ErrorTypes } = require('./response');
const logger = require('./logger');

/**
 * 사용자 정의 API 에러 클래스
 */
class AppError extends Error {
  /**
   * API 에러 생성자
   * @param {string} message 에러 메시지
   * @param {string} code 에러 코드
   * @param {number} statusCode HTTP 상태 코드
   * @param {boolean} isOperational 운영 에러 여부 (true: 예상된 에러, false: 예상치 못한 에러)
   */
  constructor(message, code = 'INTERNAL_ERROR', statusCode = 500, isOperational = true) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * 에러 유형으로부터 AppError 인스턴스 생성
   * @param {Object} errorType ErrorTypes에 정의된 에러 유형
   * @param {string} [customMessage] 선택적 커스텀 메시지
   * @returns {AppError} 생성된 AppError 인스턴스
   */
  static fromType(errorType, customMessage) {
    return new AppError(
      customMessage || errorType.message,
      errorType.code,
      errorType.statusCode,
      true
    );
  }
}

/**
 * 비동기 함수의 에러를 Express 에러 핸들러로 전달하는 래퍼
 * @param {Function} fn 비동기 Express 미들웨어/컨트롤러
 * @returns {Function} 래핑된 미들웨어/컨트롤러
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 전역 에러 핸들러 미들웨어
 */
const errorHandler = (err, req, res, next) => {
  // 기본 에러 정보
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || 'INTERNAL_ERROR';
  let message = err.message || '서버 내부 오류가 발생했습니다';
  
  // 에러 타입에 따른 처리
  if (err.name === 'ValidationError') {
    // Joi 유효성 검증 에러
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.details ? err.details[0]?.message : '입력 데이터가 유효하지 않습니다';
  } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    // JSON 파싱 에러
    statusCode = 400;
    errorCode = 'INVALID_JSON';
    message = '잘못된 JSON 형식입니다';
  } else if (err.name === 'TypeError') {
    // 타입 에러
    statusCode = 500;
    errorCode = 'TYPE_ERROR';
  }
  
  // 운영 에러가 아닌 경우 (예상치 못한 에러) 자세히 로깅
  if (!err.isOperational) {
    logger.error(`Unexpected error: ${err.message}`, {
      stack: err.stack,
      name: err.name,
      code: errorCode
    });
  } else {
    // 운영 에러 로깅
    logger.warn(`Operational error: ${err.message}`, {
      code: errorCode,
      statusCode,
      path: req.path
    });
  }
  
  // 개발 환경에서는 스택 트레이스 포함
  const devError = process.env.NODE_ENV === 'development' ? {
    stack: err.stack,
    name: err.name
  } : {};
  
  // 응답 반환
  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code: errorCode,
      message,
      ...devError
    }
  });
};

module.exports = {
  AppError,
  asyncHandler,
  errorHandler,
  ErrorTypes
};