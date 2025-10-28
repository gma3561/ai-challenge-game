# [P1] 대시보드 데이터 스키마 정렬

- 담당: Service Planner
- 예상소요: 0.5d

## 배경
현재 `data.json`이 `{"lastUpdated":..., "metrics":..., "sprint":...}` 형태로 변경됨. 프론트 스크립트(`dashboard.js`)는 팀/활동 기반 스키마를 기대.

## 작업
- 스키마 정렬 방안 결정: (A) 프론트 적응, (B) 백엔드/데이터 어댑터 추가, (C) 하이브리드
- 결정된 방안에 따른 변경 설계서 작성

## 완료 기준
- 대시보드 정상 렌더링 및 메트릭/스프린트 정보 표시

---

## 제안: (C) 하이브리드
- 단기: 프런트에서 백워드 호환 어댑터를 추가해 `data.json` 표준 스키마(metrics[], sprint{})로 매핑
- 중기: 백엔드 수집/정규화 단계에 표준 스키마 강제, 스키마 버저닝(`schemaVersion`)

## 표준 스키마(초안)
```json
{
  "schemaVersion": 1,
  "lastUpdated": "2025-08-14T00:00:00Z",
  "metrics": [
    {"key": "activeUsers", "label": "Active Users", "unit": "count", "value": 1234},
    {"key": "errorRate", "label": "Error Rate", "unit": "%", "value": 0.08}
  ],
  "sprint": {
    "id": "S-2025-08-1",
    "name": "Sprint 1",
    "startDate": "2025-08-01",
    "endDate": "2025-08-14",
    "goal": "v1 출시 준비",
    "progress": {"done": 8, "total": 18}
  }
}
```

## 프런트 어댑터 예시(psuedo)
```ts
function adapt(raw: any): StandardData {
  const metrics = Array.isArray(raw.metrics)
    ? raw.metrics
    : Object.entries(raw.metrics || {}).map(([key, value]) => ({ key, label: key, unit: 'count', value }));
  return { schemaVersion: 1, lastUpdated: raw.lastUpdated, metrics, sprint: raw.sprint };
}
```
