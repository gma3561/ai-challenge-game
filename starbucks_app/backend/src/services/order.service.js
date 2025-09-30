const menuModel = require('../models/menu.model');

class OrderService {
  // 모의 결제 처리
  async processPayment(orderData) {
    try {
      const { cardNumber } = orderData;
      
      // PRD에 명시된 모의 결제 로직
      // 성공: 카드번호 4242 4242 4242 4242
      // 실패: 카드번호 4000 0000 0000 0002
      
      if (!cardNumber) {
        return {
          success: false,
          error: '카드번호가 제공되지 않았습니다.'
        };
      }
      
      const sanitizedCardNumber = cardNumber.replace(/\s+/g, '');
      
      if (sanitizedCardNumber === '4242424242424242') {
        return {
          success: true,
          message: '결제가 성공적으로 처리되었습니다.'
        };
      } else if (sanitizedCardNumber === '4000000000000002') {
        return {
          success: false,
          error: '결제 처리 실패: 카드 거절'
        };
      } else {
        return {
          success: false,
          error: '결제 처리 실패: 유효하지 않은 카드번호'
        };
      }
    } catch (error) {
      console.error('결제 처리 중 오류 발생:', error);
      throw new Error('결제 처리에 실패했습니다');
    }
  }

  // 주문 가격 검증
  async validateOrderAmount(items) {
    try {
      let calculatedTotal = 0;
      
      for (const item of items) {
        const { menuItemId, selectedOptions, quantity } = item;
        
        // 메뉴 아이템 정보 가져오기
        const menuItem = await menuModel.getMenuItem(menuItemId);
        
        // 기본 가격 계산
        let unitPrice = menuItem.basePrice;
        
        // 선택된 옵션에 따른 추가 가격 계산
        for (const [optionGroupId, optionValue] of Object.entries(selectedOptions)) {
          // 메뉴의 공통 옵션 그룹에서 해당 옵션 그룹 찾기
          const menu = await menuModel.getMenu();
          const optionGroup = menu.commonOptionGroups[optionGroupId];
          
          if (optionGroup) {
            if (optionGroup.type === 'counter') {
              // 카운터 타입 옵션 (예: 샷 추가)
              unitPrice += optionValue * optionGroup.unitPriceDelta;
            } else {
              // 단일 선택 옵션 (예: 사이즈, 우유 등)
              const selectedOption = optionGroup.options.find(opt => opt.id === optionValue);
              if (selectedOption) {
                unitPrice += selectedOption.priceDelta;
              }
            }
          }
        }
        
        // 수량 적용하여 항목 합계 계산
        const itemTotal = unitPrice * quantity;
        calculatedTotal += itemTotal;
      }
      
      return calculatedTotal;
    } catch (error) {
      console.error('주문 금액 검증 중 오류 발생:', error);
      throw new Error('주문 금액 검증에 실패했습니다');
    }
  }
}

module.exports = new OrderService();