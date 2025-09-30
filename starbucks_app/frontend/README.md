# 그린빈 커피 PWA - 프론트엔드

스타벅스 스타일의 커피 주문 PWA 데모 프론트엔드 구현입니다.

## 기술 스택

- React + TypeScript
- Vite
- React Router
- PWA(Progressive Web App) 기능

## 폴더 구조

```
frontend/
├── public/               - 정적 파일
│   ├── icons/            - PWA 아이콘
│   └── manifest.webmanifest - PWA 설정 파일
├── src/
│   ├── components/       - 공통 UI 컴포넌트
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── pages/            - 페이지 컴포넌트
│   │   ├── HomePage.tsx
│   │   ├── MenuListPage.tsx
│   │   ├── MenuDetailPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── CheckoutPage.tsx
│   │   └── SuccessPage.tsx
│   ├── App.tsx           - 루트 컴포넌트
│   ├── main.tsx          - 진입점
│   ├── sw.ts             - 서비스 워커
│   ├── App.css           - 앱 스타일
│   └── index.css         - 글로벌 스타일
└── vite.config.ts        - Vite 설정
```

## 설치 및 실행

1. 의존성 설치:

```bash
npm install
```

2. 개발 서버 실행:

```bash
npm run dev
```

3. 빌드:

```bash
npm run build
```

4. 빌드된 앱 미리보기:

```bash
npm run preview
```

## PWA 기능

- 매니페스트 파일을 통한 홈 화면 설치 지원
- 서비스 워커를 통한 오프라인 동작 지원
- 앱 셸 아키텍처를 통한 빠른 로딩

## 데이터 소스

- 메뉴 데이터: `/data/menu.json` 파일에서 직접 가져옴
- 로컬 저장소: 장바구니 데이터는 localStorage에 저장됨
- 모의 결제: 성공(4242...) / 실패(4000...) 카드 패턴을 통한 모의 결제 처리

## 주요 기능

- 홈 화면: 추천 메뉴 표시
- 메뉴 목록: 카테고리별 필터링
- 메뉴 상세: 다양한 옵션 선택 및 가격 계산
- 장바구니: 항목 추가/삭제/수량 조절
- 결제: 모의 카드 결제 및 검증
- 주문 완료: 주문 번호 및 픽업 안내