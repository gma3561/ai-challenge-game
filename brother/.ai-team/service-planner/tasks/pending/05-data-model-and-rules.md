# [P2] 데이터 모델 및 규칙 정의

- 담당: Service Planner
- 예상소요: 1d

## 목적
핵심 엔터티, 관계, 무결성/권한 규칙을 정의한다.

## 산출물
- ERD 초안, 주요 테이블 정의서

## 완료 기준
- DBA/백엔드 합의

---

## 엔터티/관계(요약)
- Users 1—* Sessions
- Metrics 1—* MetricSnapshots
- Sprints 1—* SprintItems
- Users 1—* DashboardConfigs

## 테이블 정의(요약)
- users(id PK, email unique, name, role enum, password_hash, created_at)
- sessions(id PK, user_id FK→users, created_at, expires_at)
- metrics(id PK, key unique, label, unit, created_at)
- metric_snapshots(id PK, metric_id FK→metrics, value numeric, captured_at timestamptz, source)
- sprints(id PK, name, start_date, end_date, goal, status enum)
- sprint_items(id PK, sprint_id FK→sprints, title, type enum, status enum, points int, assignee)
- dashboard_configs(id PK, user_id FK→users, layout_json jsonb, widgets_json jsonb, updated_at)

## 무결성 규칙
- 이메일 unique, metric.key unique
- metric_snapshots.captured_at NOT NULL, FK ON DELETE CASCADE
- enum 값 외 입력 차단(체크 제약)

## 권한 규칙
- viewer: 읽기 전용, editor: 자신의 구성 수정, admin: 전역 설정 관리

## 인덱스/성능
- metric_snapshots(metric_id, captured_at DESC)
- sprint_items(sprint_id, status)
