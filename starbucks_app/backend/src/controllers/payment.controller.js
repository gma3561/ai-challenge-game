const paymentService = require('../services/payment.service');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler } = require('../utils/error-handler');
const logger = require('../utils/logger');

/**
 * 결제 유효성 검증
 * @route POST /api/payment/validate
 */
exports.validatePayment = asyncHandler(async (req, res) => {
  const paymentData = req.body;
  
  // 결제 처리
  const result = await paymentService.processPayment(paymentData);
  
  logger.info(`Payment validated successfully: ${result.transactionId}`);
  
  // 응답 반환
  res.status(200).json(successResponse({
    transactionId: result.transactionId,
    message: result.message
  }));
});

/**
 * 주문 금액 검증
 * @route POST /api/payment/verify-amount
 */
exports.verifyAmount = asyncHandler(async (req, res) => {
  const { amount, items } = req.body;
  
  // 금액 검증
  const isValid = paymentService.validateOrderAmount(amount, items);
  
  if (!isValid) {
    return res.status(400).json(errorResponse(
      '주문 금액이 계산된 금액과 일치하지 않습니다',
      'AMOUNT_MISMATCH',
      400
    ));
  }
  
  // 응답 반환
  res.status(200).json(successResponse({
    verified: true,
    message: '주문 금액이 검증되었습니다'
  }));
});