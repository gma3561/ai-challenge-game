const express = require('express');
const menuController = require('../controllers/menu.controller');

const router = express.Router();

// 메뉴 전체 조회
router.get('/', menuController.getMenu);

// 카테고리별 메뉴 조회
router.get('/category/:categoryId', menuController.getMenuByCategory);

// 메뉴 아이템 상세 조회
router.get('/:itemId', menuController.getMenuItem);

module.exports = router;