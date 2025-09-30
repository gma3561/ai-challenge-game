# 그린빈 커피 PWA 백엔드

스타벅스 스타일의 커피 주문 경험을 제공하는 데모용 PWA의 백엔드 API 서버입니다.

## 기능 개선 사항

### 1. API 통합 및 환경별 구성
- CORS 설정 강화 및 환경 변수로 관리
- API URL 구성 개선 및 접두사 관리
- 환경별(개발, 테스트, 프로덕션) 설정 분리

### 2. 모의 결제 API 구현
- `/api/payment/validate` 엔드포인트 추가
- 테스트 카드번호 기반 결제 성공/실패 처리
- 결제 금액 검증 기능 구현

### 3. API 응답 형식 표준화
```json
{
  "success": true/false,
  "data": { ... } 또는 null,
  "error": { "code": "ERROR_CODE", "message": "오류 메시지" } 또는 null
}
```

### 4. 유효성 검증 강화
- Joi 라이브러리 통합
- 스키마 기반 유효성 검증 미들웨어
- 상세 오류 메시지 제공

### 5. 성능 개선
- 메뉴 및 주문 데이터 메모리 캐싱
- Winston 로깅 시스템 도입
- 보안 강화(Helmet, Rate Limit)

## 기술 스택

- Node.js
- Express.js
- Joi (유효성 검증)
- Winston (로깅)
- Node-cache (메모리 캐싱)
- JSON Server (데모용 데이터 서버로 사용 가능)

## 디렉토리 구조

```
backend/
├── src/                   # 소스 코드
│   ├── controllers/       # 컨트롤러 (요청 처리 로직)
│   ├── models/            # 데이터 액세스 로직
│   ├── routes/            # 라우트 정의
│   ├── services/          # 비즈니스 로직
│   ├── middlewares/       # 미들웨어
│   ├── utils/             # 유틸리티 함수
│   │   ├── cache.js       # 캐싱 유틸리티
│   │   ├── error-handler.js # 에러 처리 유틸리티
│   │   ├── logger.js      # 로깅 유틸리티
│   │   └── response.js    # 응답 포맷 유틸리티
│   ├── config/            # 설정 파일
│   ├── app.js             # Express 애플리케이션
│   └── server.js          # 서버 진입점
├── db.json                # JSON Server 데이터 파일
├── routes.json            # JSON Server 라우트 설정
├── .env                   # 환경 변수 (gitignore에 포함)
├── .env.example           # 환경 변수 예시
└── package.json           # 패키지 의존성
```

## 설치 및 실행

### 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 설정을 변경하세요:

```bash
cp .env.example .env
```

### 의존성 설치

```bash
npm install
```

### 개발 모드로 실행 (Express)

```bash
npm run dev
```

### 프로덕션 모드로 실행 (Express)

```bash
npm start
```

### JSON Server 실행 (간단한 목업 API)

```bash
npm run json-server
```

## API 엔드포인트

### 메뉴 관련 API

- `GET /api/menu`: 전체 메뉴 데이터 조회
- `GET /api/menu/category/:categoryId`: 카테고리별 메뉴 조회
- `GET /api/menu/:itemId`: 특정 메뉴 아이템 상세 조회

### 주문 관련 API

- `POST /api/orders`: 새 주문 생성
- `GET /api/orders/:id`: 특정 주문 조회
- `GET /api/orders`: 모든 주문 조회 (관리자용)
- `GET /api/orders/status/:orderId/:customerName`: 주문 상태 조회

### 결제 관련 API

- `POST /api/payment/validate`: 결제 유효성 검증
- `POST /api/payment/verify-amount`: 주문 금액 검증

## 모의 결제 기능

PRD에 명시된 대로 다음 테스트 카드 번호로 모의 결제를 테스트할 수 있습니다:

- 성공 카드: `4242 4242 4242 4242`
- 실패 카드: `4000 0000 0000 0002`

결제 요청 예시:

```json
{
  "cardNumber": "4242424242424242",
  "cardExpiry": "12/25",
  "cardCvc": "123",
  "amount": 6500
}
```

## 주문 데이터 구조

```json
{
  "id": "uuid",
  "customerName": "고객명",
  "items": [
    {
      "menuItemId": "메뉴ID",
      "selectedOptions": {/* 선택된 옵션 */},
      "quantity": 수량,
      "unitPrice": 단가,
      "lineTotal": 항목 합계
    }
  ],
  "amount": 총액,
  "transactionId": "결제 거래 ID",
  "status": "paid",
  "createdAt": "생성일시"
}
```

## 에러 코드

| 에러 코드 | 설명 | HTTP 상태 코드 |
|-----------|------|----------------|
| VALIDATION_ERROR | 입력 데이터 검증 오류 | 400 |
| PAYMENT_DECLINED | 결제 거절 | 400 |
| INVALID_CARD | 유효하지 않은 카드 | 400 |
| AMOUNT_MISMATCH | 주문 금액 불일치 | 400 |
| ORDER_NOT_FOUND | 주문 찾을 수 없음 | 404 |
| NOT_FOUND | 리소스 찾을 수 없음 | 404 |
| INTERNAL_ERROR | 서버 내부 오류 | 500 |

## 캐싱 전략

- 메뉴 데이터: 5분 TTL
- 주문 데이터: 5분 TTL
- 새 주문 생성 시 주문 캐시 자동 무효화