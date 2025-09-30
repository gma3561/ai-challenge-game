// 그린빈 커피 앱 JavaScript

// 전역 상태 관리
const appState = {
    currentPage: 'home',
    menu: {
        categories: [],
        commonOptionGroups: {},
        items: []
    },
    cart: [],
    selectedItem: null,
    selectedOptions: {},
    currentTotal: 0
};

// DOM 요소 캐싱
const elements = {
    pages: {},
    nav: {
        bottomNavItems: null,
        backButtons: null
    },
    home: {
        featuredItems: null,
        viewMenuBtn: null
    },
    menu: {
        categoryTabs: null,
        menuList: null
    },
    menuDetail: {
        image: null,
        name: null,
        badges: null,
        basePrice: null,
        optionGroups: null,
        totalPrice: null,
        addToCartBtn: null
    },
    cart: {
        items: null,
        emptyCart: null,
        subtotal: null,
        total: null,
        checkoutBtn: null,
        startShoppingBtn: null,
        summary: null
    },
    checkout: {
        paymentForm: null,
        paymentAmount: null
    },
    orderComplete: {
        orderNumber: null,
        orderAgainBtn: null
    },
    loading: {
        overlay: null
    },
    pwa: {
        installBanner: null,
        installBtn: null,
        closeBannerBtn: null
    }
};

// 초기화 함수
async function initApp() {
    cacheElements();
    setupEventListeners();
    registerServiceWorker();
    await loadMenuData();
    renderMenu();
    initPWA();
    
    // URL 해시 기반 라우팅 처리
    handleLocationHash();
    
    // 로컬 스토리지에서 장바구니 복원
    restoreCartFromLocalStorage();
    updateCartUI();
}

// DOM 요소 캐싱 함수
function cacheElements() {
    // 페이지 요소
    document.querySelectorAll('.page').forEach(page => {
        elements.pages[page.id] = page;
    });
    
    // 내비게이션 요소
    elements.nav.bottomNavItems = document.querySelectorAll('.nav-item');
    elements.nav.backButtons = document.querySelectorAll('.back-btn');
    
    // 홈 페이지 요소
    elements.home.featuredItems = document.querySelectorAll('.featured-items .menu-item');
    elements.home.viewMenuBtn = document.getElementById('view-menu-btn');
    
    // 메뉴 페이지 요소
    elements.menu.categoryTabs = document.querySelectorAll('.category-tabs .tab');
    elements.menu.menuList = document.querySelector('.menu-list');
    
    // 메뉴 상세 페이지 요소
    elements.menuDetail.image = document.getElementById('detail-image');
    elements.menuDetail.name = document.getElementById('detail-name');
    elements.menuDetail.badges = document.getElementById('detail-badges');
    elements.menuDetail.basePrice = document.getElementById('detail-base-price');
    elements.menuDetail.optionGroups = document.getElementById('option-groups');
    elements.menuDetail.totalPrice = document.getElementById('total-price');
    elements.menuDetail.addToCartBtn = document.getElementById('add-to-cart-btn');
    
    // 장바구니 페이지 요소
    elements.cart.items = document.getElementById('cart-items');
    elements.cart.emptyCart = document.getElementById('empty-cart');
    elements.cart.subtotal = document.getElementById('cart-subtotal');
    elements.cart.total = document.getElementById('cart-total');
    elements.cart.checkoutBtn = document.getElementById('checkout-btn');
    elements.cart.startShoppingBtn = document.getElementById('start-shopping-btn');
    elements.cart.summary = document.getElementById('cart-summary');
    
    // 결제 페이지 요소
    elements.checkout.paymentForm = document.getElementById('payment-form');
    elements.checkout.paymentAmount = document.getElementById('payment-amount');
    
    // 주문 완료 페이지 요소
    elements.orderComplete.orderNumber = document.getElementById('order-number');
    elements.orderComplete.orderAgainBtn = document.getElementById('order-again-btn');
    
    // 로딩 오버레이
    elements.loading.overlay = document.getElementById('loading-overlay');
    
    // PWA 설치 배너
    elements.pwa.installBanner = document.getElementById('pwa-install-banner');
    elements.pwa.installBtn = document.getElementById('install-btn');
    elements.pwa.closeBannerBtn = document.getElementById('close-banner-btn');
}

// 이벤트 리스너 설정 함수
function setupEventListeners() {
    // 하단 내비게이션 이벤트 리스너
    elements.nav.bottomNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = item.getAttribute('href').substring(1);
            navigateToPage(targetPage);
            updateNavigation(targetPage);
        });
    });
    
    // 뒤로 가기 버튼 이벤트 리스너
    elements.nav.backButtons.forEach(button => {
        button.addEventListener('click', () => {
            navigateBack();
        });
    });
    
    // 홈 페이지 이벤트 리스너
    elements.home.featuredItems.forEach(item => {
        item.addEventListener('click', () => {
            const itemId = item.dataset.id;
            showItemDetail(itemId);
        });
    });
    
    elements.home.viewMenuBtn.addEventListener('click', () => {
        navigateToPage('menu');
        updateNavigation('menu');
    });
    
    // 메뉴 페이지 이벤트 리스너
    elements.menu.categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const categoryId = tab.dataset.category;
            filterMenuByCategory(categoryId);
            
            // 활성 탭 표시
            elements.menu.categoryTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
    
    // 메뉴 상세 페이지 이벤트 리스너
    elements.menuDetail.addToCartBtn.addEventListener('click', () => {
        addToCart();
    });
    
    // 장바구니 페이지 이벤트 리스너
    elements.cart.checkoutBtn.addEventListener('click', () => {
        if (appState.cart.length > 0) {
            navigateToPage('checkout');
            updateCheckoutUI();
        }
    });
    
    elements.cart.startShoppingBtn.addEventListener('click', () => {
        navigateToPage('menu');
        updateNavigation('menu');
    });
    
    // 결제 페이지 이벤트 리스너
    elements.checkout.paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        processPayment();
    });
    
    // 주문 완료 페이지 이벤트 리스너
    elements.orderComplete.orderAgainBtn.addEventListener('click', () => {
        navigateToPage('home');
        updateNavigation('home');
        clearCart();
    });
    
    // PWA 설치 배너 이벤트 리스너
    elements.pwa.closeBannerBtn.addEventListener('click', () => {
        elements.pwa.installBanner.style.display = 'none';
        localStorage.setItem('pwa-install-banner-closed', 'true');
    });
    
    // 해시 변경 이벤트 리스너
    window.addEventListener('hashchange', handleLocationHash);
}

// 서비스 워커 등록 함수
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(reg => {
                    console.log('Service worker registered!', reg);
                })
                .catch(err => {
                    console.error('Service worker registration failed:', err);
                });
        });
    }
}

// 메뉴 데이터 로드 함수
async function loadMenuData() {
    try {
        showLoading();
        
        // 메뉴 데이터를 서버에서 로드하는 시뮬레이션 (데모용)
        // 실제로는 API에서 가져와야 함
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 하드코딩된 메뉴 데이터 (실제로는 API에서 가져와야 함)
        appState.menu = {
            "categories": [
                { "id": "coffee", "name": "커피" },
                { "id": "tea", "name": "티" },
                { "id": "frappuccino", "name": "프라푸치노" }
            ],
            "commonOptionGroups": {
                "size": {
                    "id": "size",
                    "name": "사이즈",
                    "type": "single",
                    "required": true,
                    "options": [
                        { "id": "tall", "name": "Tall", "priceDelta": 0 },
                        { "id": "grande", "name": "Grande", "priceDelta": 500 },
                        { "id": "venti", "name": "Venti", "priceDelta": 1000 }
                    ]
                },
                "temperature": {
                    "id": "temperature",
                    "name": "온도",
                    "type": "single",
                    "required": true,
                    "options": [
                        { "id": "hot", "name": "Hot", "priceDelta": 0 },
                        { "id": "iced", "name": "Iced", "priceDelta": 0 }
                    ]
                },
                "shots": {
                    "id": "shots",
                    "name": "샷 추가",
                    "type": "counter",
                    "required": false,
                    "min": 0,
                    "max": 3,
                    "unitPriceDelta": 500
                },
                "milk": {
                    "id": "milk",
                    "name": "우유",
                    "type": "single",
                    "required": false,
                    "options": [
                        { "id": "regular", "name": "일반 우유", "priceDelta": 0 },
                        { "id": "lowfat", "name": "저지방 우유", "priceDelta": 0 },
                        { "id": "oat", "name": "오트", "priceDelta": 500 },
                        { "id": "soy", "name": "두유", "priceDelta": 500 }
                    ]
                },
                "syrup": {
                    "id": "syrup",
                    "name": "시럽",
                    "type": "single",
                    "required": false,
                    "options": [
                        { "id": "none", "name": "없음", "priceDelta": 0 },
                        { "id": "vanilla", "name": "바닐라", "priceDelta": 300 },
                        { "id": "caramel", "name": "카라멜", "priceDelta": 300 },
                        { "id": "hazelnut", "name": "헤이즐넛", "priceDelta": 300 }
                    ]
                },
                "ice": {
                    "id": "ice",
                    "name": "얼음",
                    "type": "single",
                    "required": false,
                    "visibleWhen": { "temperature": "iced" },
                    "options": [
                        { "id": "less", "name": "적게", "priceDelta": 0 },
                        { "id": "regular", "name": "보통", "priceDelta": 0 },
                        { "id": "extra", "name": "많이", "priceDelta": 0 }
                    ]
                },
                "sweetness": {
                    "id": "sweetness",
                    "name": "당도",
                    "type": "single",
                    "required": false,
                    "options": [
                        { "id": "0", "name": "0%", "priceDelta": 0 },
                        { "id": "50", "name": "50%", "priceDelta": 0 },
                        { "id": "100", "name": "100%", "priceDelta": 0 }
                    ]
                }
            },
            "items": [
                {
                    "id": "coffee_americano",
                    "categoryId": "coffee",
                    "name": "아메리카노",
                    "basePrice": 4500,
                    "badges": { "caffeine": true, "allergens": [] },
                    "optionGroupIds": ["size", "temperature", "shots", "syrup", "ice"],
                    "image": "images/menu/americano.jpg"
                },
                {
                    "id": "coffee_latte",
                    "categoryId": "coffee",
                    "name": "카페 라떼",
                    "basePrice": 5500,
                    "badges": { "caffeine": true, "allergens": ["milk"] },
                    "optionGroupIds": ["size", "temperature", "shots", "milk", "syrup", "ice"],
                    "image": "images/menu/latte.jpg"
                },
                {
                    "id": "coffee_mocha",
                    "categoryId": "coffee",
                    "name": "카페 모카",
                    "basePrice": 6000,
                    "badges": { "caffeine": true, "allergens": ["milk"] },
                    "optionGroupIds": ["size", "temperature", "shots", "milk", "syrup", "ice"],
                    "image": "images/menu/mocha.jpg"
                },
                {
                    "id": "tea_earl_grey",
                    "categoryId": "tea",
                    "name": "얼그레이",
                    "basePrice": 5000,
                    "badges": { "caffeine": true, "allergens": [] },
                    "optionGroupIds": ["size", "temperature", "sweetness", "ice"],
                    "image": "images/menu/earl-grey.jpg"
                },
                {
                    "id": "tea_chamomile",
                    "categoryId": "tea",
                    "name": "캐모마일",
                    "basePrice": 5000,
                    "badges": { "caffeine": false, "allergens": [] },
                    "optionGroupIds": ["size", "temperature", "sweetness", "ice"],
                    "image": "images/menu/chamomile.jpg"
                },
                {
                    "id": "tea_green",
                    "categoryId": "tea",
                    "name": "녹차",
                    "basePrice": 5000,
                    "badges": { "caffeine": true, "allergens": [] },
                    "optionGroupIds": ["size", "temperature", "sweetness", "ice"],
                    "image": "images/menu/green-tea.jpg"
                },
                {
                    "id": "frapu_java_chip",
                    "categoryId": "frappuccino",
                    "name": "자바칩 프라푸치노",
                    "basePrice": 6500,
                    "badges": { "caffeine": true, "allergens": ["milk"] },
                    "optionGroupIds": ["size", "shots", "milk", "sweetness", "ice"],
                    "image": "images/menu/java-chip.jpg"
                },
                {
                    "id": "frapu_caramel",
                    "categoryId": "frappuccino",
                    "name": "카라멜 프라푸치노",
                    "basePrice": 6500,
                    "badges": { "caffeine": true, "allergens": ["milk"] },
                    "optionGroupIds": ["size", "shots", "milk", "sweetness", "ice"],
                    "image": "images/menu/caramel-frapu.jpg"
                },
                {
                    "id": "frapu_mocha",
                    "categoryId": "frappuccino",
                    "name": "모카 프라푸치노",
                    "basePrice": 6500,
                    "badges": { "caffeine": true, "allergens": ["milk"] },
                    "optionGroupIds": ["size", "shots", "milk", "sweetness", "ice"],
                    "image": "images/menu/mocha-frapu.jpg"
                }
            ]
        };
        
        // 이미지 경로 추가 (실제로는 서버에서 받아야 함)
        hideLoading();
    } catch (error) {
        console.error('메뉴 데이터 로드 실패:', error);
        hideLoading();
    }
}

// 페이지 렌더링 함수들
function renderMenu() {
    const menuList = elements.menu.menuList;
    menuList.innerHTML = '';
    
    appState.menu.items.forEach(item => {
        const menuItem = createMenuItemElement(item);
        menuList.appendChild(menuItem);
    });
}

function createMenuItemElement(item) {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.dataset.id = item.id;
    
    const imagePlaceholder = item.image || 'images/placeholder.jpg';
    
    menuItem.innerHTML = `
        <div class="item-image">
            <img src="${imagePlaceholder}" alt="${item.name}">
        </div>
        <div class="item-info">
            <h3>${item.name}</h3>
            <p class="price">₩${formatPrice(item.basePrice)}~</p>
            <div class="badges">
                ${item.badges.caffeine ? '<span class="badge badge-caffeine">카페인</span>' : ''}
                ${item.badges.allergens.map(allergen => `<span class="badge badge-allergen">${allergen}</span>`).join('')}
            </div>
        </div>
    `;
    
    menuItem.addEventListener('click', () => {
        showItemDetail(item.id);
    });
    
    return menuItem;
}

function filterMenuByCategory(categoryId) {
    const menuList = elements.menu.menuList;
    const allItems = menuList.querySelectorAll('.menu-item');
    
    if (categoryId === 'all') {
        allItems.forEach(item => {
            item.style.display = 'flex';
        });
        return;
    }
    
    allItems.forEach(item => {
        const itemId = item.dataset.id;
        const menuItem = appState.menu.items.find(i => i.id === itemId);
        
        if (menuItem && menuItem.categoryId === categoryId) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function showItemDetail(itemId) {
    const item = appState.menu.items.find(i => i.id === itemId);
    if (!item) return;
    
    appState.selectedItem = item;
    appState.selectedOptions = {};
    
    // 이미지 및 기본 정보 설정
    elements.menuDetail.image.src = item.image || 'images/placeholder.jpg';
    elements.menuDetail.image.alt = item.name;
    elements.menuDetail.name.textContent = item.name;
    
    // 배지 표시
    elements.menuDetail.badges.innerHTML = '';
    if (item.badges.caffeine) {
        const caffeineSpan = document.createElement('span');
        caffeineSpan.className = 'badge badge-caffeine';
        caffeineSpan.textContent = '카페인';
        elements.menuDetail.badges.appendChild(caffeineSpan);
    }
    
    item.badges.allergens.forEach(allergen => {
        const allergenSpan = document.createElement('span');
        allergenSpan.className = 'badge badge-allergen';
        allergenSpan.textContent = allergen;
        elements.menuDetail.badges.appendChild(allergenSpan);
    });
    
    // 기본 가격 설정
    elements.menuDetail.basePrice.textContent = `₩${formatPrice(item.basePrice)}`;
    
    // 옵션 그룹 렌더링
    renderOptionGroups(item);
    
    // 초기 총 가격 계산
    calculateTotalPrice();
    
    // 페이지 이동
    navigateToPage('menu-detail');
}

function renderOptionGroups(item) {
    const optionGroupsContainer = elements.menuDetail.optionGroups;
    optionGroupsContainer.innerHTML = '';
    
    item.optionGroupIds.forEach(groupId => {
        const optionGroup = appState.menu.commonOptionGroups[groupId];
        if (!optionGroup) return;
        
        // 옵션 그룹 표시 조건 확인
        if (optionGroup.visibleWhen) {
            const conditionOption = Object.keys(optionGroup.visibleWhen)[0];
            const conditionValue = optionGroup.visibleWhen[conditionOption];
            
            // 조건이 만족되지 않으면 렌더링하지 않음
            if (
                !appState.selectedOptions[conditionOption] || 
                appState.selectedOptions[conditionOption].id !== conditionValue
            ) {
                return;
            }
        }
        
        const groupElement = document.createElement('div');
        groupElement.className = 'option-group';
        groupElement.dataset.groupId = optionGroup.id;
        
        const titleElement = document.createElement('h3');
        titleElement.textContent = optionGroup.name;
        
        if (optionGroup.required) {
            const requiredBadge = document.createElement('span');
            requiredBadge.className = 'required-badge';
            requiredBadge.textContent = '필수';
            titleElement.appendChild(requiredBadge);
        }
        
        groupElement.appendChild(titleElement);
        
        // 옵션 타입에 따라 렌더링
        if (optionGroup.type === 'single') {
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options';
            
            optionGroup.options.forEach(option => {
                const optionBtn = document.createElement('button');
                optionBtn.className = 'option-button';
                optionBtn.dataset.optionId = option.id;
                optionBtn.textContent = option.name;
                
                if (option.priceDelta > 0) {
                    optionBtn.textContent += ` (+${formatPrice(option.priceDelta)})`;
                }
                
                optionBtn.addEventListener('click', () => {
                    // 같은 그룹의 다른 옵션들 선택 해제
                    optionsContainer.querySelectorAll('.option-button').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    
                    optionBtn.classList.add('selected');
                    
                    // 상태 업데이트
                    appState.selectedOptions[optionGroup.id] = option;
                    
                    // 총 가격 계산
                    calculateTotalPrice();
                    
                    // 조건부 옵션 그룹 다시 렌더링
                    renderOptionGroups(item);
                });
                
                optionsContainer.appendChild(optionBtn);
            });
            
            groupElement.appendChild(optionsContainer);
        } else if (optionGroup.type === 'counter') {
            const counterOption = document.createElement('div');
            counterOption.className = 'counter-option';
            
            const label = document.createElement('span');
            label.textContent = `${optionGroup.name} (개당 +${formatPrice(optionGroup.unitPriceDelta)})`;
            counterOption.appendChild(label);
            
            const controls = document.createElement('div');
            controls.className = 'counter-controls';
            
            const minusBtn = document.createElement('button');
            minusBtn.className = 'counter-button';
            minusBtn.textContent = '-';
            minusBtn.disabled = true;  // 초기값은 0
            
            const valueSpan = document.createElement('span');
            valueSpan.className = 'counter-value';
            valueSpan.textContent = '0';
            
            const plusBtn = document.createElement('button');
            plusBtn.className = 'counter-button';
            plusBtn.textContent = '+';
            
            // 초기 상태 설정
            if (!appState.selectedOptions[optionGroup.id]) {
                appState.selectedOptions[optionGroup.id] = {
                    count: 0,
                    unitPriceDelta: optionGroup.unitPriceDelta
                };
            }
            
            minusBtn.addEventListener('click', () => {
                const currentCount = appState.selectedOptions[optionGroup.id].count;
                if (currentCount > 0) {
                    appState.selectedOptions[optionGroup.id].count = currentCount - 1;
                    valueSpan.textContent = currentCount - 1;
                    
                    if (currentCount - 1 === 0) {
                        minusBtn.disabled = true;
                    }
                    
                    if (currentCount - 1 < optionGroup.max) {
                        plusBtn.disabled = false;
                    }
                    
                    calculateTotalPrice();
                }
            });
            
            plusBtn.addEventListener('click', () => {
                const currentCount = appState.selectedOptions[optionGroup.id].count;
                if (currentCount < optionGroup.max) {
                    appState.selectedOptions[optionGroup.id].count = currentCount + 1;
                    valueSpan.textContent = currentCount + 1;
                    
                    minusBtn.disabled = false;
                    
                    if (currentCount + 1 === optionGroup.max) {
                        plusBtn.disabled = true;
                    }
                    
                    calculateTotalPrice();
                }
            });
            
            controls.appendChild(minusBtn);
            controls.appendChild(valueSpan);
            controls.appendChild(plusBtn);
            
            counterOption.appendChild(controls);
            groupElement.appendChild(counterOption);
        }
        
        optionGroupsContainer.appendChild(groupElement);
    });
}

function calculateTotalPrice() {
    if (!appState.selectedItem) return;
    
    let totalPrice = appState.selectedItem.basePrice;
    
    // 각 선택된 옵션 가격 계산
    for (const [groupId, option] of Object.entries(appState.selectedOptions)) {
        if (option.priceDelta !== undefined) {
            totalPrice += option.priceDelta;
        } else if (option.count !== undefined && option.unitPriceDelta !== undefined) {
            totalPrice += option.count * option.unitPriceDelta;
        }
    }
    
    appState.currentTotal = totalPrice;
    elements.menuDetail.totalPrice.textContent = `₩${formatPrice(totalPrice)}`;
}

function addToCart() {
    if (!appState.selectedItem) return;
    
    // 필수 옵션 확인
    const missingRequiredOptions = appState.selectedItem.optionGroupIds
        .filter(groupId => {
            const group = appState.menu.commonOptionGroups[groupId];
            return group && group.required && !appState.selectedOptions[groupId];
        })
        .map(groupId => appState.menu.commonOptionGroups[groupId].name);
    
    if (missingRequiredOptions.length > 0) {
        alert(`다음 필수 옵션을 선택해주세요: ${missingRequiredOptions.join(', ')}`);
        return;
    }
    
    // 장바구니에 추가할 아이템 준비
    const cartItem = {
        id: generateUniqueId(),
        menuItemId: appState.selectedItem.id,
        name: appState.selectedItem.name,
        options: {...appState.selectedOptions},
        quantity: 1,
        unitPrice: appState.currentTotal,
        totalPrice: appState.currentTotal
    };
    
    // 장바구니에 추가
    appState.cart.push(cartItem);
    
    // 로컬 스토리지에 장바구니 저장
    saveCartToLocalStorage();
    
    // 장바구니 아이콘 업데이트
    updateCartUI();
    
    // 장바구니 페이지로 이동
    navigateToPage('cart');
    updateNavigation('cart');
}

function renderCartItems() {
    const cartItemsContainer = elements.cart.items;
    
    // 비우기 (빈 장바구니 메시지 제외)
    const emptyCartMessage = elements.cart.emptyCart;
    
    // 이전 아이템들 제거
    Array.from(cartItemsContainer.children).forEach(child => {
        if (child !== emptyCartMessage) {
            child.remove();
        }
    });
    
    if (appState.cart.length === 0) {
        emptyCartMessage.style.display = 'flex';
        elements.cart.summary.style.display = 'none';
        return;
    }
    
    emptyCartMessage.style.display = 'none';
    elements.cart.summary.style.display = 'block';
    
    let subtotal = 0;
    
    appState.cart.forEach((item, index) => {
        subtotal += item.totalPrice;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        
        cartItemElement.innerHTML = `
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.name}</h3>
                <p class="cart-item-options">${formatCartItemOptions(item)}</p>
                <p class="cart-item-price">₩${formatPrice(item.unitPrice)} × ${item.quantity}</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-control">
                    <button class="quantity-button decrease" data-index="${index}">-</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-button increase" data-index="${index}">+</button>
                </div>
                <button class="remove-button" data-index="${index}">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
        
        // 수량 변경 이벤트 리스너 추가
        const decreaseBtn = cartItemElement.querySelector('.decrease');
        const increaseBtn = cartItemElement.querySelector('.increase');
        const removeBtn = cartItemElement.querySelector('.remove-button');
        
        decreaseBtn.addEventListener('click', () => {
            updateCartItemQuantity(index, item.quantity - 1);
        });
        
        increaseBtn.addEventListener('click', () => {
            updateCartItemQuantity(index, item.quantity + 1);
        });
        
        removeBtn.addEventListener('click', () => {
            removeCartItem(index);
        });
    });
    
    // 소계와 총액 업데이트
    elements.cart.subtotal.textContent = `₩${formatPrice(subtotal)}`;
    elements.cart.total.textContent = `₩${formatPrice(subtotal)}`;
}

function formatCartItemOptions(cartItem) {
    const optionStrings = [];
    
    for (const [groupId, option] of Object.entries(cartItem.options)) {
        const group = appState.menu.commonOptionGroups[groupId];
        
        if (!group) continue;
        
        if (option.name) {
            optionStrings.push(`${group.name}: ${option.name}`);
        } else if (option.count > 0) {
            optionStrings.push(`${group.name}: ${option.count}개`);
        }
    }
    
    return optionStrings.join(' / ');
}

function updateCartItemQuantity(index, newQuantity) {
    if (newQuantity <= 0) {
        removeCartItem(index);
        return;
    }
    
    const item = appState.cart[index];
    if (!item) return;
    
    item.quantity = newQuantity;
    item.totalPrice = item.unitPrice * newQuantity;
    
    saveCartToLocalStorage();
    renderCartItems();
}

function removeCartItem(index) {
    appState.cart.splice(index, 1);
    
    saveCartToLocalStorage();
    updateCartUI();
}

function clearCart() {
    appState.cart = [];
    saveCartToLocalStorage();
    updateCartUI();
}

function updateCartUI() {
    // 장바구니 아이콘 업데이트
    const cartCount = document.getElementById('cart-count');
    cartCount.textContent = appState.cart.length;
    
    // 장바구니 렌더링
    renderCartItems();
}

function updateCheckoutUI() {
    const total = appState.cart.reduce((sum, item) => sum + item.totalPrice, 0);
    elements.checkout.paymentAmount.textContent = `₩${formatPrice(total)}`;
}

// 결제 처리 함수
function processPayment() {
    showLoading();
    
    const formData = new FormData(elements.checkout.paymentForm);
    const customerName = formData.get('customerName');
    const cardNumber = formData.get('cardNumber').replace(/\s+/g, '');
    
    // 카드번호 검증 (데모)
    let success = true;
    
    // 실패 카드번호인 경우
    if (cardNumber === '4000000000000002') {
        success = false;
    }
    
    // 모의 비동기 처리
    setTimeout(() => {
        hideLoading();
        
        if (success) {
            // 성공 시 주문번호 생성 및 완료 페이지로 이동
            const orderNumber = generateOrderNumber();
            elements.orderComplete.orderNumber.textContent = orderNumber;
            navigateToPage('order-complete');
            
            // 트래킹 이벤트 (데모)
            trackEvent('payment_success', {
                order_id: orderNumber,
                amount: appState.cart.reduce((sum, item) => sum + item.totalPrice, 0)
            });
        } else {
            // 실패 시 오류 메시지
            alert('결제가 실패했습니다. 다른 카드로 시도해주세요.');
            
            // 트래킹 이벤트 (데모)
            trackEvent('payment_failure', {
                error: 'card_declined'
            });
        }
    }, 1500);
}

// PWA 관련 함수
function initPWA() {
    let deferredPrompt;
    const installBanner = elements.pwa.installBanner;
    const installBtn = elements.pwa.installBtn;
    
    // PWA 설치 배너가 이미 닫혔는지 확인
    const bannerClosed = localStorage.getItem('pwa-install-banner-closed') === 'true';
    
    // 설치 프롬프트 저장
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // 사용자가 배너를 닫지 않았으면 표시
        if (!bannerClosed) {
            installBanner.style.display = 'block';
        }
    });
    
    // 설치 버튼 클릭 이벤트
    installBtn.addEventListener('click', () => {
        installBanner.style.display = 'none';
        
        if (deferredPrompt) {
            deferredPrompt.prompt();
            
            deferredPrompt.userChoice.then(choiceResult => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('사용자가 설치에 동의했습니다.');
                } else {
                    console.log('사용자가 설치를 취소했습니다.');
                }
                deferredPrompt = null;
            });
        }
    });
    
    // PWA가 이미 설치된 경우
    window.addEventListener('appinstalled', () => {
        installBanner.style.display = 'none';
        console.log('PWA가 설치되었습니다.');
    });
}

// 유틸리티 함수들
function navigateToPage(pageId) {
    // 현재 페이지 숨김
    for (const id in elements.pages) {
        elements.pages[id].classList.remove('active');
    }
    
    // 새 페이지 표시
    elements.pages[pageId].classList.add('active');
    
    // 현재 페이지 상태 업데이트
    appState.currentPage = pageId;
    
    // URL 해시 업데이트
    window.location.hash = `#${pageId}`;
    
    // 페이지 최상단으로 스크롤
    window.scrollTo(0, 0);
}

function navigateBack() {
    // 페이지별 뒤로가기 로직
    switch (appState.currentPage) {
        case 'menu-detail':
            navigateToPage('menu');
            updateNavigation('menu');
            break;
        case 'cart':
            if (window.history.length > 1) {
                window.history.back();
            } else {
                navigateToPage('menu');
                updateNavigation('menu');
            }
            break;
        case 'checkout':
            navigateToPage('cart');
            updateNavigation('cart');
            break;
        default:
            window.history.back();
    }
}

function updateNavigation(activeTab) {
    elements.nav.bottomNavItems.forEach(item => {
        const itemPageId = item.getAttribute('href').substring(1);
        if (itemPageId === activeTab) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function handleLocationHash() {
    const hash = window.location.hash.substring(1);
    
    if (hash && elements.pages[hash]) {
        navigateToPage(hash);
        updateNavigation(hash);
    } else if (!hash || hash === '') {
        // 기본 페이지 (홈)
        navigateToPage('home');
        updateNavigation('home');
    }
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function generateOrderNumber() {
    const timestamp = new Date().getTime().toString().substring(7);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `GB${timestamp}${random}`;
}

function saveCartToLocalStorage() {
    localStorage.setItem('green-bean-cart', JSON.stringify(appState.cart));
}

function restoreCartFromLocalStorage() {
    const savedCart = localStorage.getItem('green-bean-cart');
    if (savedCart) {
        try {
            appState.cart = JSON.parse(savedCart);
        } catch (e) {
            console.error('장바구니 복원 실패:', e);
            appState.cart = [];
        }
    }
}

function showLoading() {
    elements.loading.overlay.style.display = 'flex';
}

function hideLoading() {
    elements.loading.overlay.style.display = 'none';
}

function trackEvent(eventName, params = {}) {
    // 데모용 트래킹 함수 (실제로는 Google Analytics나 다른 분석 도구 사용)
    console.log(`[TRACKING] ${eventName}:`, params);
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', initApp);