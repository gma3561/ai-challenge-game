const menuModel = require('../models/menu.model');

// 메뉴 전체 조회
exports.getMenu = async (req, res, next) => {
  try {
    const menu = await menuModel.getMenu();
    res.status(200).json(menu);
  } catch (error) {
    next(error);
  }
};

// 메뉴 아이템 상세 조회
exports.getMenuItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const menuItem = await menuModel.getMenuItem(itemId);
    res.status(200).json(menuItem);
  } catch (error) {
    if (error.message === '해당 메뉴 아이템을 찾을 수 없습니다') {
      return res.status(404).json({ message: error.message });
    }
    next(error);
  }
};

// 카테고리별 메뉴 조회
exports.getMenuByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const menuItems = await menuModel.getMenuByCategory(categoryId);
    res.status(200).json(menuItems);
  } catch (error) {
    next(error);
  }
};