# Naver MCP Server 사용 예시

## 기본 사용법

### 1. 부동산 매물 검색

```json
{
  "tool": "search_properties",
  "arguments": {
    "location": "강남구",
    "propertyType": "아파트",
    "priceRange": {
      "min": 10,
      "max": 20
    },
    "size": {
      "min": 80,
      "max": 120
    },
    "rooms": 3
  }
}
```

**응답 예시:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Found 15 properties in 강남구"
    },
    {
      "type": "text",
      "text": "[매물 정보 JSON 데이터]"
    }
  ]
}
```

### 2. 네이버 API를 통한 부동산 정보 검색

```json
{
  "tool": "search_naver_api",
  "arguments": {
    "query": "강남구 아파트 시세 2024",
    "searchType": "web",
    "display": 20
  }
}
```

**응답 예시:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Naver API Search Results for \"강남구 아파트 시세 2024\" (web)"
    },
    {
      "type": "text",
      "text": "[네이버 검색 결과 JSON 데이터]"
    }
  ]
}
```

### 3. 시장 동향 분석

```json
{
  "tool": "get_market_trends",
  "arguments": {
    "location": "강남구",
    "period": "3개월"
  }
}
```

**응답 예시:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Market Trends for 강남구 (3개월) - Combined from API and Service"
    },
    {
      "type": "text",
      "text": "[시장 동향 분석 데이터]"
    }
  ]
}
```

### 4. 매물 비교

```json
{
  "tool": "compare_properties",
  "arguments": {
    "propertyIds": ["prop_001", "prop_002", "prop_003"]
  }
}
```

**응답 예시:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Property Comparison"
    },
    {
      "type": "text",
      "text": "[매물 비교 분석 데이터]"
    }
  ]
}
```

### 5. 부동산 종합 분석

```json
{
  "tool": "get_property_analysis",
  "arguments": {
    "location": "강남구",
    "propertyType": "아파트"
  }
}
```

**응답 예시:**
```json
{
  "content": [
    {
      "type": "text",
      "text": "Property Analysis for 아파트 in 강남구"
    },
    {
      "type": "text",
      "text": "[종합 분석 데이터]"
    }
  ]
}
```

## 고급 사용법

### 복합 검색 예시

여러 도구를 연속으로 사용하여 종합적인 부동산 분석을 수행할 수 있습니다:

1. **지역 검색**: `search_properties`로 기본 매물 검색
2. **시장 동향**: `get_market_trends`로 해당 지역 시장 분석
3. **투자 인사이트**: `search_naver_api`로 투자 관련 정보 검색
4. **매물 비교**: `compare_properties`로 선별된 매물 비교

### 에러 처리

모든 도구는 에러 발생 시 적절한 에러 메시지를 반환합니다:

```json
{
  "error": "Configuration validation failed",
  "details": "Missing required environment variables: NAVER_ACCESS_LICENSE"
}
```

## 성능 최적화 팁

1. **검색 범위 제한**: 너무 넓은 지역이나 가격 범위는 검색 시간을 증가시킵니다
2. **적절한 display 값**: `search_naver_api`에서 `display` 값을 필요 이상으로 크게 설정하지 마세요
3. **캐싱 활용**: 동일한 검색 조건으로 반복 검색 시 이전 결과를 재사용하세요

## 제한사항

- 네이버 API 호출 제한: 분당 25,000회, 일일 500,000회
- 웹 크롤링: 네이버 부동산 페이지 구조 변경 시 크롤링이 실패할 수 있습니다
- 동시 요청: 동시에 너무 많은 요청을 보내면 차단될 수 있습니다
