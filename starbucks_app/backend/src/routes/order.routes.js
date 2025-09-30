const express = require('express');
const orderController = require('../controllers/order.controller');
const { validateCreateOrder } = require('../middlewares/validation.middleware');
const { menuCacheMiddleware } = require('../utils/cache');

const router = express.Router();

// 주문 생성
router.post('/', validateCreateOrder, orderController.createOrder);

// 주문 조회
router.get('/:id', orderController.getOrder);

// 모든 주문 조회 (관리자용)
router.get('/', orderController.getAllOrders);

// 주문 상태 조회 (주문번호와 이름으로)
router.get('/status/:orderId/:customerName', orderController.getOrderStatus);

module.exports = router;