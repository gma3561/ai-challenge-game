# [P1] 시스템 아키텍처 개요 수립

- 담당: Service Planner
- 예상소요: 1d
- 의존성: 요구사항 분해

## 목적
주요 컴포넌트, 경계, 데이터 흐름을 정의해 개발 리스크를 낮춘다.

## 산출물
- `service-planner/architecture.md` 초안 (구성도/흐름도 포함)

## 완료 기준
- 백/프론트/QA 합의 및 피드백 반영

---

## 컴포넌트
- 프런트엔드(Next.js): 대시보드 UI, SSR/ISR로 초기 로드 최적화
- API(FastAPI): 인증, 메트릭/스프린트/대시보드 구성 제공
- 워커(Celery): 수집/정규화/집계 배치
- 저장소(PostgreSQL/Redis): 영속/캐시/큐

## 데이터 흐름
1) 외부 소스/`data.json` 수집 → 정규화 어댑터 → 표준 스키마에 적재
2) 워커가 집계/스냅샷 생성 → DB 저장
3) API가 캐시 우선 조회 → 응답
4) 프론트는 SSR/CSR 혼합으로 렌더링

## 경계/계약
- 표준 스키마(JSON): metrics, sprint, widgets
- API 버전: /api/v1, 안정성 유지(호환성 깨는 변경 금지)

## 운영
- 관측(Sentry/Otel), 헬스체크(/healthz), 블루/그린 또는 롤링 배포
