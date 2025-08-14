# [P2] API 설계 원칙 수립

- 담당: Service Planner
- 예상소요: 0.5d

## 목적
일관된 리소스 모델과 버전 전략, 에러 규격을 정의한다.

## 산출물
- 엔드포인트命명, 응답 규격, 에러 코드 정책 문서

## 완료 기준
- 백엔드 팀 리뷰 통과

---

## 버전 전략
- URI 버전(`/api/v1`), SSE/웹소켓 등은 프로토콜별 버전 별도 관리
- 호환성 깨는 변경은 v2로 신규 추가, v1은 90일 유예

## 리소스 모델/네이밍
- 복수 명사 사용: `/metrics`, `/sprints`, `/dashboard`
- 관계/컬렉션: `/sprints/{id}/items`

## 응답 규격
```json
{ "success": true, "data": any }
```
에러 시:
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {...} } }
```

## 에러 코드 가이드
- VALIDATION_ERROR(400), UNAUTHORIZED(401), FORBIDDEN(403), NOT_FOUND(404)
- RATE_LIMITED(429), CONFLICT(409), SERVER_ERROR(500)

## 페이징/필터/정렬
- 쿼리 파라미터: `?page=1&pageSize=20&sort=-captured_at&filter[key]=value`
- Link 헤더로 다음/이전 페이지 제공

## 보안
- OAuth2 + JWT, 스코프 기반 권한
- 입력 스키마 검증(Pydantic), 레이트 리밋, 감사 로그 마스킹

## 성능
- ETag/Cache-Control, 캐시 키 안정화
- N+1 방지, 인덱스 설계 준수
