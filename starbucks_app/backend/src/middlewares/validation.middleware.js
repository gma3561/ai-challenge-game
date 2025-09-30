const Joi = require('joi');
const { AppError } = require('../utils/error-handler');
const { ErrorTypes } = require('../utils/response');

/**
 * Joi 스키마를 사용하는 유효성 검증 미들웨어 생성
 * @param {Joi.Schema} schema 검증할 Joi 스키마
 * @param {string} source 검증할 요청 소스 (body, params, query)
 * @returns {Function} 유효성 검증 미들웨어
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
      errors: {
        wrap: {
          label: false
        }
      }
    });
    
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new AppError(message, 'VALIDATION_ERROR', 400));
    }
    
    // 유효성 검증된 데이터로 교체
    req[source] = value;
    next();
  };
};

// 주문 항목 스키마
const orderItemSchema = Joi.object({
  menuItemId: Joi.string().required().messages({
    'string.empty': '메뉴 아이템 ID는 필수입니다',
    'any.required': '메뉴 아이템 ID는 필수입니다'
  }),
  selectedOptions: Joi.object().required().messages({
    'object.base': '선택된 옵션은 객체 형태여야 합니다',
    'any.required': '선택된 옵션은 필수입니다'
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': '수량은 숫자여야 합니다',
    'number.integer': '수량은 정수여야 합니다',
    'number.min': '수량은 최소 1개 이상이어야 합니다',
    'any.required': '수량은 필수입니다'
  }),
  unitPrice: Joi.number().integer().min(0).required().messages({
    'number.base': '단가는 숫자여야 합니다',
    'number.integer': '단가는 정수여야 합니다',
    'number.min': '단가는 0 이상이어야 합니다',
    'any.required': '단가는 필수입니다'
  }),
  lineTotal: Joi.number().integer().min(0).required().messages({
    'number.base': '항목 합계는 숫자여야 합니다',
    'number.integer': '항목 합계는 정수여야 합니다',
    'number.min': '항목 합계는 0 이상이어야 합니다',
    'any.required': '항목 합계는 필수입니다'
  })
});

// 주문 생성 스키마
const createOrderSchema = Joi.object({
  customerName: Joi.string().trim().min(1).required().messages({
    'string.empty': '주문자 이름은 필수입니다',
    'string.min': '주문자 이름은 최소 1자 이상이어야 합니다',
    'any.required': '주문자 이름은 필수입니다'
  }),
  items: Joi.array().items(orderItemSchema).min(1).required().messages({
    'array.base': '주문 항목은 배열이어야 합니다',
    'array.min': '최소 1개 이상의 주문 항목이 필요합니다',
    'any.required': '주문 항목은 필수입니다'
  }),
  amount: Joi.number().integer().min(0).required().messages({
    'number.base': '주문 금액은 숫자여야 합니다',
    'number.integer': '주문 금액은 정수여야 합니다',
    'number.min': '주문 금액은 0 이상이어야 합니다',
    'any.required': '주문 금액은 필수입니다'
  }),
  cardNumber: Joi.string().pattern(/^\d{16}$/).required().messages({
    'string.pattern.base': '카드 번호는 16자리 숫자여야 합니다',
    'string.empty': '카드 번호는 필수입니다',
    'any.required': '카드 번호는 필수입니다'
  }),
  cardExpiry: Joi.string().pattern(/^\d{2}\/\d{2}$/).required().messages({
    'string.pattern.base': '카드 유효기간은 MM/YY 형식이어야 합니다',
    'string.empty': '카드 유효기간은 필수입니다',
    'any.required': '카드 유효기간은 필수입니다'
  }),
  cardCvc: Joi.string().pattern(/^\d{3}$/).required().messages({
    'string.pattern.base': 'CVC는 3자리 숫자여야 합니다',
    'string.empty': 'CVC는 필수입니다',
    'any.required': 'CVC는 필수입니다'
  })
});

// 결제 검증 스키마
const paymentValidateSchema = Joi.object({
  cardNumber: Joi.string().pattern(/^\d{16}$/).required().messages({
    'string.pattern.base': '카드 번호는 16자리 숫자여야 합니다',
    'string.empty': '카드 번호는 필수입니다',
    'any.required': '카드 번호는 필수입니다'
  }),
  cardExpiry: Joi.string().pattern(/^\d{2}\/\d{2}$/).required().messages({
    'string.pattern.base': '카드 유효기간은 MM/YY 형식이어야 합니다',
    'string.empty': '카드 유효기간은 필수입니다',
    'any.required': '카드 유효기간은 필수입니다'
  }),
  cardCvc: Joi.string().pattern(/^\d{3}$/).required().messages({
    'string.pattern.base': 'CVC는 3자리 숫자여야 합니다',
    'string.empty': 'CVC는 필수입니다',
    'any.required': 'CVC는 필수입니다'
  }),
  amount: Joi.number().integer().min(0).required().messages({
    'number.base': '결제 금액은 숫자여야 합니다',
    'number.integer': '결제 금액은 정수여야 합니다',
    'number.min': '결제 금액은 0 이상이어야 합니다',
    'any.required': '결제 금액은 필수입니다'
  })
});

module.exports = {
  validate,
  validateCreateOrder: validate(createOrderSchema),
  validatePayment: validate(paymentValidateSchema),
  schemas: {
    createOrderSchema,
    paymentValidateSchema,
    orderItemSchema
  }
};