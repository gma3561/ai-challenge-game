const NodeCache = require('node-cache');
const config = require('../config');
const logger = require('./logger');

// 캐시 인스턴스 생성
const cache = new NodeCache({
  stdTTL: config.cache.ttl,
  checkperiod: config.cache.checkperiod
});

/**
 * 캐시 키 생성 유틸리티
 * @param {string} prefix 캐시 키 접두사
 * @param {string|Object} identifier 캐시 식별자
 * @returns {string} 생성된 캐시 키
 */
const generateCacheKey = (prefix, identifier) => {
  if (typeof identifier === 'object') {
    return `${prefix}:${JSON.stringify(identifier)}`;
  }
  return `${prefix}:${identifier}`;
};

/**
 * 캐시 미들웨어 생성 함수
 * @param {string} keyPrefix 캐시 키 접두사
 * @param {Function} keyGenerator 캐시 키 생성 함수
 * @param {number} ttl 캐시 TTL (초)
 * @returns {Function} Express 미들웨어
 */
exports.cacheMiddleware = (keyPrefix, keyGenerator, ttl = config.cache.ttl) => {
  return (req, res, next) => {
    // 캐시 키 생성
    const key = keyGenerator(req);
    const cacheKey = generateCacheKey(keyPrefix, key);
    
    // 캐시에서 데이터 조회
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      logger.debug(`Cache hit for: ${cacheKey}`);
      return res.json(cachedData);
    }
    
    logger.debug(`Cache miss for: ${cacheKey}`);
    
    // 원본 응답 메소드를 가로채서 응답 데이터를 캐싱
    const originalJson = res.json;
    res.json = function(data) {
      cache.set(cacheKey, data, ttl);
      originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * 메뉴 데이터용 캐시 미들웨어
 */
exports.menuCacheMiddleware = exports.cacheMiddleware(
  'menu',
  (req) => req.originalUrl,
  config.cache.ttl
);

/**
 * 특정 키로 데이터 캐싱
 * @param {string} key 캐시 키
 * @param {*} data 캐싱할 데이터
 * @param {number} ttl 캐시 TTL (초)
 * @returns {boolean} 캐싱 성공 여부
 */
exports.set = (key, data, ttl = config.cache.ttl) => {
  return cache.set(key, data, ttl);
};

/**
 * 캐시에서 데이터 조회
 * @param {string} key 캐시 키
 * @returns {*} 캐싱된 데이터 또는 undefined
 */
exports.get = (key) => {
  return cache.get(key);
};

/**
 * 특정 키의 캐시 삭제
 * @param {string} key 캐시 키
 * @returns {number} 삭제된 항목 수
 */
exports.del = (key) => {
  return cache.del(key);
};

/**
 * 특정 패턴으로 시작하는 모든 캐시 키 삭제
 * @param {string} prefix 캐시 키 접두사
 * @returns {number} 삭제된 항목 수
 */
exports.delByPrefix = (prefix) => {
  const keys = cache.keys().filter(key => key.startsWith(`${prefix}:`));
  logger.debug(`Deleting cache keys with prefix ${prefix}: ${keys.length} keys`);
  return cache.del(keys);
};

/**
 * 캐시 인스턴스 직접 접근용
 */
exports.cacheInstance = cache;