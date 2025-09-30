const logger = require('../utils/logger');
const { AppError } = require('../utils/error-handler');
const { ErrorTypes } = require('../utils/response');

class PaymentService {
  /**
   * 모의 결제 처리
   * @param {Object} paymentData 결제 데이터
   * @param {string} paymentData.cardNumber 카드 번호
   * @param {string} paymentData.cardExpiry 카드 유효기간
   * @param {string} paymentData.cardCvc 카드 CVC
   * @param {number} paymentData.amount 결제 금액
   * @returns {Promise<Object>} 결제 결과
   */
  async processPayment(paymentData) {
    try {
      logger.info(`Payment processing initiated for amount: ${paymentData.amount}`);
      
      // 카드 번호 정규화 (공백 제거)
      const sanitizedCardNumber = paymentData.cardNumber.replace(/\s+/g, '');
      
      // PRD에 명시된 모의 결제 로직
      // 성공: 카드번호 4242 4242 4242 4242
      // 실패: 카드번호 4000 0000 0000 0002
      
      if (sanitizedCardNumber === '4242424242424242') {
        logger.info('Payment successful with test success card');
        return {
          success: true,
          transactionId: this._generateTransactionId(),
          message: '결제가 성공적으로 처리되었습니다'
        };
      } else if (sanitizedCardNumber === '4000000000000002') {
        logger.info('Payment declined with test decline card');
        throw new AppError('카드 거절: 결제가 거부되었습니다', 'PAYMENT_DECLINED', 400);
      } else {
        logger.info('Payment failed with invalid card number');
        throw new AppError('유효하지 않은 카드번호입니다', 'INVALID_CARD', 400);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      logger.error(`Payment processing error: ${error.message}`);
      throw new AppError('결제 처리 중 오류가 발생했습니다', 'PAYMENT_ERROR', 500);
    }
  }
  
  /**
   * 모의 거래 ID 생성
   * @returns {string} 생성된 거래 ID
   * @private
   */
  _generateTransactionId() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `TX-${timestamp}-${random}`;
  }
  
  /**
   * 주문 금액 검증
   * @param {number} requestedAmount 요청된 금액
   * @param {Array} items 주문 항목 목록
   * @returns {boolean} 금액이 유효한지 여부
   */
  validateOrderAmount(requestedAmount, items) {
    try {
      // 항목별 합계 계산
      const calculatedTotal = items.reduce((total, item) => {
        const lineTotal = item.unitPrice * item.quantity;
        return total + lineTotal;
      }, 0);
      
      // 오차 범위 내 금액 검증 (1원 미만의 차이는 허용)
      const isValid = Math.abs(calculatedTotal - requestedAmount) < 1;
      
      if (!isValid) {
        logger.warn(`Amount validation failed: Requested ${requestedAmount}, Calculated ${calculatedTotal}`);
      }
      
      return isValid;
    } catch (error) {
      logger.error(`Amount validation error: ${error.message}`);
      return false;
    }
  }
}

module.exports = new PaymentService();