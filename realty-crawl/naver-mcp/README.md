# Naver MCP Server

네이버 부동산 정보를 크롤링하고 분석하는 MCP (Model Context Protocol) 서버입니다.

## 주요 기능

- 🏠 **부동산 매물 검색**: 네이버 부동산에서 매물 정보를 크롤링
- 📊 **시장 동향 분석**: 특정 지역의 부동산 시장 동향 분석
- 🔍 **네이버 API 연동**: 네이버 검색 API를 통한 부동산 관련 정보 검색
- 📈 **매물 비교**: 여러 매물을 비교 분석
- 💡 **투자 인사이트**: 부동산 투자 관련 정보 제공

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

```bash
cp env.example .env
# .env 파일을 편집하여 필요한 설정을 입력
```

### 3. 빌드

```bash
npm run build
```

### 4. 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `NAVER_ACCESS_LICENSE` | 네이버 API 액세스 라이선스 | - |
| `NAVER_SECRET_KEY` | 네이버 API 비밀키 | - |
| `NAVER_BASE_URL` | 네이버 API 기본 URL | `https://openapi.naver.com` |
| `PORT` | 서버 포트 | `3000` |
| `NODE_ENV` | 실행 환경 | `development` |
| `LOG_LEVEL` | 로그 레벨 | `info` |

## 사용 가능한 도구

### 1. `search_properties`
부동산 매물을 검색합니다.

```json
{
  "location": "강남구",
  "propertyType": "아파트",
  "priceRange": {
    "min": 10,
    "max": 20
  },
  "size": {
    "min": 80,
    "max": 120
  }
}
```

### 2. `get_property_details`
특정 매물의 상세 정보를 가져옵니다.

```json
{
  "propertyId": "property_123"
}
```

### 3. `get_market_trends`
특정 지역의 시장 동향을 분석합니다.

```json
{
  "location": "강남구",
  "period": "3개월"
}
```

### 4. `search_naver_api`
네이버 API를 통해 부동산 관련 정보를 검색합니다.

```json
{
  "query": "강남구 아파트 시세",
  "searchType": "web",
  "display": 20
}
```

### 5. `get_property_analysis`
특정 지역과 매물 유형에 대한 종합 분석을 제공합니다.

```json
{
  "location": "강남구",
  "propertyType": "아파트"
}
```

## 프로젝트 구조

```
naver-mcp/
├── src/
│   ├── crawlers/          # 웹 크롤링 관련
│   ├── services/          # 비즈니스 로직 서비스
│   ├── utils/             # 유틸리티 함수
│   ├── types/             # 타입 정의
│   ├── config/            # 설정 관리
│   └── index.ts           # 메인 서버 파일
├── logs/                  # 로그 파일
├── scripts/               # 스크립트 파일
├── examples/              # 사용 예시
├── tests/                 # 테스트 파일
├── package.json           # 프로젝트 설정
├── tsconfig.json          # TypeScript 설정
└── README.md              # 프로젝트 문서
```

## 개발

### 개발 모드 실행

```bash
npm run dev
```

### 코드 포맷팅

```bash
npm run format
```

### 린팅

```bash
npm run lint
```

### 테스트

```bash
npm test
```

## 로깅

서버는 Winston을 사용하여 로깅을 수행합니다. 로그는 다음 위치에 저장됩니다:

- `logs/combined.log`: 모든 로그
- `logs/error.log`: 에러 로그만

## 라이선스

MIT License

## 기여

버그 리포트나 기능 요청은 이슈를 통해 제출해 주세요.
Pull Request도 환영합니다.

## 연락처

프로젝트 관련 문의사항이 있으시면 이슈를 통해 연락해 주세요.
