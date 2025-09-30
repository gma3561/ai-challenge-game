const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { validatePayment } = require('../middlewares/validation.middleware');

const router = express.Router();

// 결제 유효성 검증
router.post('/validate', validatePayment, paymentController.validatePayment);

// 주문 금액 검증
router.post('/verify-amount', paymentController.verifyAmount);

module.exports = router;