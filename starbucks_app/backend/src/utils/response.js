/**
 * API 응답을 표준화된 형식으로 생성
 * 
 * 형식:
 * {
 *   success: true/false,
 *   data: {...} 또는 null,
 *   error: { code: "ERROR_CODE", message: "오류 메시지" } 또는 null
 * }
 */

/**
 * 성공 응답 생성
 * @param {*} data 응답 데이터
 * @returns {Object} 표준화된 성공 응답
 */
exports.successResponse = (data = null) => ({
  success: true,
  data,
  error: null
});

/**
 * 에러 응답 생성
 * @param {string} message 에러 메시지
 * @param {string} code 에러 코드
 * @param {number} statusCode HTTP 상태 코드
 * @returns {Object} 표준화된 에러 응답
 */
exports.errorResponse = (message = '오류가 발생했습니다', code = 'INTERNAL_ERROR', statusCode = 500) => ({
  success: false,
  data: null,
  error: {
    code,
    message
  },
  statusCode
});

// 일반적인 에러 유형들
exports.ErrorTypes = {
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: '입력 데이터가 유효하지 않습니다',
    statusCode: 400
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: '요청한 리소스를 찾을 수 없습니다',
    statusCode: 404
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: '인증이 필요합니다',
    statusCode: 401
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: '접근 권한이 없습니다',
    statusCode: 403
  },
  PAYMENT_FAILED: {
    code: 'PAYMENT_FAILED',
    message: '결제 처리에 실패했습니다',
    statusCode: 400
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: '서버 내부 오류가 발생했습니다',
    statusCode: 500
  }
};