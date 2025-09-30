const orderModel = require('../models/order.model');
const orderService = require('../services/order.service');
const paymentService = require('../services/payment.service');
const { successResponse, errorResponse } = require('../utils/response');
const { asyncHandler, AppError } = require('../utils/error-handler');
const logger = require('../utils/logger');

/**
 * 주문 생성
 * @route POST /api/orders
 */
exports.createOrder = asyncHandler(async (req, res) => {
  const { customerName, items, amount, cardNumber } = req.body;
  
  // 주문 금액 검증
  const isAmountValid = paymentService.validateOrderAmount(amount, items);
  if (!isAmountValid) {
    throw new AppError('주문 금액이 계산된 금액과 일치하지 않습니다', 'AMOUNT_MISMATCH', 400);
  }
  
  // 결제 처리
  const paymentResult = await paymentService.processPayment(req.body);
  
  // 주문 저장
  const order = await orderModel.createOrder({
    customerName,
    items,
    amount,
    transactionId: paymentResult.transactionId
  });
  
  logger.info(`Order created: ${order.id}`);
  
  // 응답 반환
  res.status(201).json(successResponse({
    orderId: order.id,
    status: order.status,
    createdAt: order.createdAt
  }));
});

/**
 * 주문 조회
 * @route GET /api/orders/:id
 */
exports.getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const order = await orderModel.getOrder(id);
  
  logger.info(`Order retrieved: ${id}`);
  
  res.status(200).json(successResponse(order));
});

/**
 * 모든 주문 조회 (관리자용)
 * @route GET /api/orders
 */
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await orderModel.getAllOrders();
  
  logger.info(`All orders retrieved: ${orders.length} orders`);
  
  res.status(200).json(successResponse(orders));
});

/**
 * 주문 상태 조회 (주문번호와 이름으로)
 * @route GET /api/orders/status/:orderId/:customerName
 */
exports.getOrderStatus = asyncHandler(async (req, res) => {
  const { orderId, customerName } = req.params;
  
  try {
    const order = await orderModel.getOrder(orderId);
    
    // 이름 확인 (대소문자 무시)
    if (order.customerName.toLowerCase() !== customerName.toLowerCase()) {
      throw new AppError('주문자 이름이 일치하지 않습니다', 'NAME_MISMATCH', 400);
    }
    
    logger.info(`Order status retrieved: ${orderId}`);
    
    res.status(200).json(successResponse({
      orderId: order.id,
      status: order.status,
      createdAt: order.createdAt,
      customerName: order.customerName
    }));
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError('주문을 찾을 수 없습니다', 'ORDER_NOT_FOUND', 404);
  }
});