# UIUX 로직 주요 문제점 분석

## 1. 옵션 선택 로직 문제

### 1.1. 조건부 옵션 표시 오류 (MenuDetailPage.tsx)

현재 메뉴 상세 페이지에서 조건부 옵션 표시에 문제가 있습니다. 특히 온도 옵션과 얼음 옵션의 관계에서 다음 이슈가 발견됩니다:

```typescript
// MenuDetailPage.tsx 154-155라인 근처
const isOptionVisible = (group: OptionGroup): boolean => {
  if (!group.visibleWhen) return true;
  
  // 문제점: 조건부 옵션이 즉각적으로 반영되지 않음
  const [conditionKey, conditionValue] = Object.entries(group.visibleWhen)[0];
  return selectedOptions[conditionKey] === conditionValue;
};
```

**문제점**:
- 온도 옵션을 "Iced"에서 "Hot"으로 변경할 때 얼음 옵션이 즉시 숨겨지지 않음
- Hot → Iced 전환 시 얼음 옵션 표시에 지연 발생
- 옵션 변경 시 시각적 피드백 부족

### 1.2. 가격 계산 로직 비효율 (MenuDetailPage.tsx)

가격 계산 로직이 복잡하게 구현되어 있으며, 수정이 어려운 구조입니다:

```typescript
// MenuDetailPage.tsx 84-117라인 근처
// Calculate total price when options change
useEffect(() => {
  if (!menuItem) return;
  
  let price = menuItem.basePrice;
  
  // 문제점: 모든 옵션을 매번 순회하는 비효율적 구조
  Object.entries(selectedOptions).forEach(([groupId, value]) => {
    const group = optionGroups[groupId];
    if (!group) return;
    
    if (group.type === 'single' && typeof value === 'string') {
      const option = group.options?.find(opt => opt.id === value);
      if (option) {
        price += option.priceDelta;
      }
    } else if (group.type === 'counter' && typeof value === 'number') {
      if (group.unitPriceDelta) {
        price += value * group.unitPriceDelta;
      }
    } else if (group.type === 'multiple' && Array.isArray(value)) {
      // ... 생략 ...
    }
  });
  
  // 수량 계산
  price *= quantity;
  
  setTotalPrice(price);
}, [menuItem, selectedOptions, quantity, optionGroups]);
```

**문제점**:
- 옵션 변경마다 전체 가격 재계산으로 성능 이슈 가능성
- 로직이 복잡하고 읽기 어려움
- 옵션 타입별 처리가 분산되어 유지보수 어려움

## 2. 장바구니 UX 문제

### 2.1. 옵션 표시 형식 비사용자 친화적 (CartPage.tsx)

```typescript
// CartPage.tsx 91-95라인 근처
{Object.entries(item.selectedOptions).map(([key, value]) => (
  <p key={key} className="option">
    {formatOptionText(key, value)}
  </p>
))}
```

**문제점**:
- 옵션 키-값을 직접 표시하여 사용자 친화적이지 않음
- 실제 옵션명과 가격 정보가 명확하게 표시되지 않음
- `formatOptionText` 함수가 단순히 문자열 연결만 수행

### 2.2. 장바구니 동기화 문제

```typescript
// Header.tsx 26-30라인 근처
// Also update when navigating
useEffect(() => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  setCartItemCount(cart.length);
}, [location.pathname]);
```

```typescript
// CartPage.tsx 56-59라인 근처
// Handle item removal
const removeItem = (index: number) => {
  const updatedCart = cartItems.filter((_, i) => i !== index);
  setCartItems(updatedCart);
  localStorage.setItem('cart', JSON.stringify(updatedCart));
};
```

**문제점**:
- 여러 탭이나 브라우저 창에서 장바구니 상태 동기화 불가
- localStorage 이벤트 리스너가 Header에만 존재하여 다른 컴포넌트는 업데이트 안됨
- 전역 상태 관리 부재로 일관성 유지 어려움

## 3. 사용자 경험 및 피드백 문제

### 3.1. 로딩 및 오류 상태 표시 부족

```typescript
// MenuListPage.tsx 33-40라인 근처
.then(data => {
  setCategories(data.categories);
  setMenuItems(data.items);
  
  // Set default active category
  if (data.categories.length > 0 && !activeCategory) {
    setActiveCategory(data.categories[0].id);
  }
})
.catch(error => console.error('Error loading menu data:', error));
```

**문제점**:
- 데이터 로딩 중 상태 표시 없음 (스켈레톤 UI 등 부재)
- 오류 발생 시 사용자에게 적절한 피드백 제공 안함
- 오류 상태 처리가 콘솔 로깅에만 의존

### 3.2. 접근성 문제

```typescript
// MenuDetailPage.tsx 207-217라인 근처
<button 
  key={option.id}
  className={selectedOptions[groupId] === option.id ? 'selected' : ''}
  onClick={() => handleOptionChange(groupId, option.id)}
>
  {option.name}
  {option.priceDelta > 0 && ` (+${option.priceDelta.toLocaleString()}원)`}
</button>
```

**문제점**:
- 버튼 요소에 aria-pressed, aria-label 등 접근성 속성 부재
- 색상 대비(특히 배지에서)가 WCAG 요구사항 충족 불확실
- 키보드 탐색 및 포커스 상태 명확하지 않음

## 4. 상태 관리 문제

### 4.1. 분산된 데이터 접근 패턴

```typescript
// 여러 컴포넌트에서 localStorage 직접 접근
localStorage.getItem('cart')
localStorage.setItem('cart', JSON.stringify(updatedCart))
```

**문제점**:
- localStorage 접근 로직이 여러 컴포넌트에 중복됨
- 장바구니 업데이트 로직이 일관되지 않음
- 중앙화된 상태 관리 솔루션 없이 동기화 어려움

### 4.2. 타입 정의 중복

```typescript
// MenuDetailPage.tsx, CartPage.tsx, CheckoutPage.tsx 등에서 유사/중복 인터페이스 정의
interface MenuItem { /* ... */ }
interface CartItem { /* ... */ }
```

**문제점**:
- 여러 파일에서 동일한 인터페이스를 중복 정의
- 타입 수정 시 여러 파일을 변경해야 하는 유지보수 문제
- 타입 불일치 가능성

## 5. PWA 관련 문제

### 5.1. 서비스 워커 구현 문제

```typescript
// main.tsx 6-17라인 근처
// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
```

**문제점**:
- `sw.js` 파일 참조하나 실제 존재하지 않음
- 서비스 워커 등록은 있으나 캐싱 및 오프라인 지원 로직 부재
- `/sw.ts` 파일은 있지만 빌드 설정이 제대로 되지 않음

### 5.2. 시각적 자산 부족

**문제점**:
- PWA 아이콘 파일 부재 (icon-192.png, icon-512.png)
- 스플래시 이미지 및 브랜드 시각 자산 부족
- 메뉴 항목의 이미지 리소스 누락

## 6. 개선을 위한 권장사항

1. **옵션 선택 로직 개선**
   - 조건부 옵션 표시 로직을 useEffect로 분리하여 즉시 반응하도록 수정
   - 가격 계산 로직 최적화 및 단순화

2. **상태 관리 구조화**
   - Context API 또는 Zustand 등을 활용한 전역 상태 관리 도입
   - localStorage 접근을 추상화한 훅 또는 서비스 생성

3. **UX 개선**
   - 로딩, 오류, 성공 상태에 대한 시각적 피드백 추가
   - 스켈레톤 UI 도입으로 로딩 경험 개선
   - 토스트 알림 시스템 추가

4. **코드 구조 개선**
   - 공통 타입 정의 파일(types.ts) 생성
   - 공유 로직을 커스텀 훅으로 추출
   - 컴포넌트 크기 축소 및 책임 분리

5. **PWA 완성**
   - 서비스 워커 구현 완료(오프라인 지원, 캐싱 전략)
   - PWA 아이콘 및 시각적 자산 추가
   - 설치 경험 개선

6. **접근성 준수**
   - 모든 인터랙티브 요소에 적절한 aria 속성 추가
   - 색상 대비 검증 및 개선
   - 키보드 탐색 및 포커스 경험 개선

이 문제점들을 해결하면 사용자 경험이 크게 향상되고 코드 유지보수성이 개선될 것입니다. 특히 옵션 선택과 장바구니 관련 로직은 가장 시급한 개선이 필요한 영역입니다.