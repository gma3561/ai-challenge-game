const fs = require('fs').promises;
const path = require('path');
const config = require('../config');

class MenuModel {
  constructor() {
    this.dbPath = path.resolve(__dirname, '..', '..', config.dbPath);
  }

  async getMenu() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      const db = JSON.parse(data);
      return db.menu;
    } catch (error) {
      console.error('메뉴 데이터를 불러오는 중 오류 발생:', error);
      throw new Error('메뉴 데이터를 불러오는데 실패했습니다');
    }
  }

  // 메뉴 아이템 ID로 검색
  async getMenuItem(itemId) {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      const db = JSON.parse(data);
      
      const menuItem = db.menu.items.find(item => item.id === itemId);
      if (!menuItem) {
        throw new Error('해당 메뉴 아이템을 찾을 수 없습니다');
      }
      
      return menuItem;
    } catch (error) {
      console.error('메뉴 아이템을 불러오는 중 오류 발생:', error);
      throw error;
    }
  }

  // 카테고리별 메뉴 아이템 가져오기
  async getMenuByCategory(categoryId) {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      const db = JSON.parse(data);
      
      const menuItems = db.menu.items.filter(item => item.categoryId === categoryId);
      return menuItems;
    } catch (error) {
      console.error('카테고리별 메뉴를 불러오는 중 오류 발생:', error);
      throw new Error('카테고리별 메뉴를 불러오는데 실패했습니다');
    }
  }
}

module.exports = new MenuModel();