# 그린빈 커피 PWA (데모)

데모용 스타벅스 스타일 커피 주문 PWA 프로젝트입니다. 단일 매장, 게스트 주문, 모의 결제(카드 패턴 판정) 기반의 최소 기능 제품(MVP) 설계와 폴더 구조를 제공합니다.

- 앱 성격: 데모용 PWA, 단일 매장 픽업
- 로그인: 없음(게스트 주문)
- 결제: 모의 카드 폼(성공: 4242…, 실패: 4000…)
- 메뉴: 3카테고리 × 3종(총 9종)

## 폴더 구조

- `docs/` — 기획 산출물(PRD 등)
- `frontend/` — PWA 프론트엔드(React/Vite 권장), `public/`에 PWA 매니페스트 포함
- `backend/` — 모의 API용 폴더(JSON Server 등 선택사항)
- `data/` — 공용 정적 데이터(메뉴 JSON)

## 빠른 시작(가이드)

- PRD 확인: `docs/PRD.md:1`
- 메뉴 데이터: `data/menu.json:1`
- PWA 매니페스트: `frontend/public/manifest.webmanifest:1`
- 모의 API 사용을 원하면 `backend/README.md:1` 참고(JSON Server 권장)

원하시면 다음 단계로 실제 React + Vite 템플릿 초기화와 기본 화면(홈/메뉴/상세/장바구니/결제/완료) 스캐폴딩을 진행해 드릴 수 있어요.
