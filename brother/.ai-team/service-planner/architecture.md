# System Architecture

## 아키텍처 개요
모바일 상품권 매입/정산 서비스. 비회원 고객이 브랜드를 선택하고 PIN을 제출하면 검증/락/정산/입금을 처리한다. 공개 API는 카탈로그/시세/주문/현황을 제공하고, 내부 API는 바우처 파싱·검증·락과 정산/입금을 수행한다. 개인정보·민감정보는 암호화/마스킹하며 최소권한 원칙을 적용한다.

## 기술 스택
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python) + Uvicorn, Pydantic, Celery(배치/비동기 작업)
- **Database**: PostgreSQL (주 데이터), Redis (캐시/큐)
- **Infrastructure**: Vercel(프런트), Fly.io/Render(백엔드), Supabase/RDS(Postgres), Cloudflare CDN, Sentry/Otel(관측)

## 시스템 구성도
```mermaid
flowchart LR
  subgraph Client[Client]
    web[Customer Web (Next.js)]
    admin[Admin Portal]
  end

  subgraph PublicAPI[Public API]
    rates[GET /api/rates]
    catalog[GET /api/catalog]
    orders[POST /api/orders\nPOST /api/orders/{id}/items\nGET /api/orders/lookup]
    feed[GET /api/feed]
  end

  subgraph InternalAPI[Internal API]
    vouchers[POST /api/vouchers/parse|verify|lock]
    payouts[POST /api/payouts]
    status[PATCH /api/orders/{id}/status]
  end

  subgraph Services[Services]
    svcOrder[Order Service]
    svcVoucher[Voucher Service]
    svcPayout[Payout Service]
    svcRisk[Risk Service]
    svcCatalog[Catalog/Rate Service]
  end

  subgraph Infra[Infra]
    cache[(Redis)]
    db[(PostgreSQL)]
    queue[[Worker Queue]]
  end

  web <-- HTTPS --> PublicAPI
  admin <-- HTTPS --> PublicAPI
  PublicAPI --> Services
  InternalAPI --> Services
  Services <--> cache
  Services <--> db
  Services <--> queue
```

## API 설계
- 버전: `/api/v1`
- 공통 응답: `{ "success": true|false, "data": any, "error": {code, message, details?} }`
- 인증: 고객(비회원 주문조회는 OTP), 어드민은 RBAC/JWT

### 공개 API
- GET `/api/v1/rates`  브랜드별 매입가율/갱신시각
- GET `/api/v1/catalog`  `info_json` + `form_json`(스키마 기반 폼 메타)
- POST `/api/v1/orders`  주문 생성(고객정보/계좌/동의)
- POST `/api/v1/orders/{id}/items`  PIN 다건 등록
- GET `/api/v1/orders/lookup?phone=...`  주문 조회(OTP)
- GET `/api/v1/feed`  익명화된 최근 진행 현황

### 내부 API
- POST `/api/v1/vouchers/parse`  문자/본문에서 PIN 대량 추출
- POST `/api/v1/vouchers/verify`  형식·중복·잔액 검증
- POST `/api/v1/vouchers/lock`  사용/락 처리(지원 브랜드)
- POST `/api/v1/payouts`  입금 실행(정책 기반 수수료/지연)
- PATCH `/api/v1/orders/{id}/status`  상태 전이

## 데이터베이스 설계
- `orders(id, phone, name, bank_code, account_no, holder, fee, total_face_value, total_payable, status, risk_score, created_at)`
- `order_items(id, order_id, brand, pin_hash, face_value, status, verified_at, locked_at, paid_at)`
- `payouts(id, order_id, amount, fee, status, executed_at)`
- `rates(brand, rate, effective_from)`
- `catalog(brand, info_json jsonb, form_json jsonb, updated_at)`
- `live_feed(id, brand, qty, amount, masked, status, created_at)`
- `announcements(id, title, body, published_at)`
- `audit_logs(id, actor, action, target_type, target_id, meta_json, created_at)`
- `risk_flags(id, order_id, reason, score, created_at)`
- `privacy_consents(id, phone, consent_type, granted_at)`

인덱스: `order_items(order_id)`, `order_items(brand, status)`, `orders(status, created_at)`, `rates(brand, effective_from desc)`

## 보안 고려사항
- PIN/계좌 번호 등 민감 정보 암호화 저장(암호화 키 관리 분리), 로그 마스킹
- OTP 기반 비회원 조회, 레이트 리밋/봇 차단, 디바이스 지문/시도량 제한
- RBAC(어드민), 모든 입력 Pydantic 검증, 접근 감사/무결성
- HTTPS, CORS 화이트리스트, 비밀/키는 시크릿 매니저 관리

## 확장성 계획
- 상태머신 기반 주문/아이템 처리로 수평 확장 용이
- 워커 큐 분리(검증/락/입금), 캐시로 핫데이터(Rates/Catalog) 오프로딩
- 읽기-쓰기 분리, 장기 이력 파티셔닝/아카이빙, 백필 재처리 파이프라인
