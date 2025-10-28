# Project Context

## 프로젝트 정보
- **프로젝트명**: External Customer Dashboard v1
- **시작일**: 2025-08-14
- **목표 완료일**: 8주 내 정식 출시
- **팀 구성**: PO, Service Planner, Frontend, Backend, UI/UX, QA

## 비즈니스 목표
- 외부 고객에게 신뢰 가능한 핵심 지표와 스프린트 현황을 제공하여 의사결정 속도와 예측 가능성을 향상

## 핵심 가치
- 신뢰도(품질/안정성 최우선), 명료성(한 눈에 이해 가능한 정보 구조), 최소권한(보안)

## 제약사항
- 8주 내 v1, 소규모 팀
- 민감정보 보호 및 컴플라이언스 준수 필요

## 리스크 요소
- 데이터 소스 간 스키마 불일치 → 정규화 어댑터 필요
- 트래픽 변동/스파이크 → 캐시/리드 리플리카/레이트리밋

## 성공 지표
- 가용성 ≥ 99.9%, 핵심 API p95 ≤ 300ms, 메트릭 지연 p95 ≤ 5분

## 참고 자료
- `brother/PRD.md`
- `brother/.ai-team/service-planner/architecture.md`
- `brother/.ai-team/service-planner/reports/competitor-reverse-engineering.md`
