const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../utils/logger');
const { AppError } = require('../utils/error-handler');
const cache = require('../utils/cache');

class OrderModel {
  constructor() {
    this.dbPath = path.resolve(__dirname, '..', '..', config.dbPath);
  }

  /**
   * 주문 생성
   * @param {Object} orderData 주문 데이터
   * @returns {Promise<Object>} 생성된 주문
   */
  async createOrder(orderData) {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      const db = JSON.parse(data);
      
      const order = {
        id: uuidv4(), // 고유 ID 생성
        ...orderData,
        status: 'paid', // PRD에 명시된 대로 항상 'paid'로 설정
        createdAt: new Date().toISOString()
      };
      
      db.orders.push(order);
      
      await fs.writeFile(this.dbPath, JSON.stringify(db, null, 2), 'utf8');
      
      // 캐싱된 주문 목록 삭제
      cache.delByPrefix('orders');
      
      logger.info(`Created new order: ${order.id}`);
      
      return order;
    } catch (error) {
      logger.error(`Order creation error: ${error.message}`);
      throw new AppError('주문을 생성하는데 실패했습니다', 'ORDER_CREATE_FAILED', 500);
    }
  }

  /**
   * 주문 조회
   * @param {string} orderId 주문 ID
   * @returns {Promise<Object>} 주문 정보
   */
  async getOrder(orderId) {
    try {
      // 캐싱 확인
      const cacheKey = `orders:${orderId}`;
      const cachedOrder = cache.get(cacheKey);
      
      if (cachedOrder) {
        logger.debug(`Cache hit for order: ${orderId}`);
        return cachedOrder;
      }
      
      const data = await fs.readFile(this.dbPath, 'utf8');
      const db = JSON.parse(data);
      
      const order = db.orders.find(order => order.id === orderId);
      if (!order) {
        throw new AppError('해당 주문을 찾을 수 없습니다', 'ORDER_NOT_FOUND', 404);
      }
      
      // 캐싱
      cache.set(cacheKey, order);
      
      return order;
    } catch (error) {
      logger.error(`Order retrieval error: ${error.message}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('주문을 불러오는데 실패했습니다', 'ORDER_RETRIEVAL_FAILED', 500);
    }
  }

  /**
   * 모든 주문 조회 (관리자용)
   * @returns {Promise<Array>} 주문 목록
   */
  async getAllOrders() {
    try {
      // 캐싱 확인
      const cacheKey = 'orders:all';
      const cachedOrders = cache.get(cacheKey);
      
      if (cachedOrders) {
        logger.debug('Cache hit for all orders');
        return cachedOrders;
      }
      
      const data = await fs.readFile(this.dbPath, 'utf8');
      const db = JSON.parse(data);
      
      // 캐싱
      cache.set(cacheKey, db.orders);
      
      return db.orders;
    } catch (error) {
      logger.error(`All orders retrieval error: ${error.message}`);
      throw new AppError('주문 목록을 불러오는데 실패했습니다', 'ORDERS_RETRIEVAL_FAILED', 500);
    }
  }
  
  /**
   * 주문번호와 이름으로 주문 상태 조회
   * @param {string} orderId 주문 ID
   * @param {string} customerName 고객 이름
   * @returns {Promise<Object>} 주문 상태 정보
   */
  async getOrderStatus(orderId, customerName) {
    try {
      const order = await this.getOrder(orderId);
      
      // 이름 확인 (대소문자 무시)
      if (order.customerName.toLowerCase() !== customerName.toLowerCase()) {
        throw new AppError('주문자 이름이 일치하지 않습니다', 'NAME_MISMATCH', 400);
      }
      
      return {
        orderId: order.id,
        status: order.status,
        createdAt: order.createdAt,
        customerName: order.customerName
      };
    } catch (error) {
      logger.error(`Order status retrieval error: ${error.message}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('주문 상태를 불러오는데 실패했습니다', 'ORDER_STATUS_FAILED', 500);
    }
  }
}

module.exports = new OrderModel();