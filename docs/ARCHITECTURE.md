# 시스템 아키텍처 & API 계약서

이 문서는 **프론트엔드와 백엔드가 서로 기다리지 않고 병렬로 개발하기 위한** API 계약서입니다.

- 프론트엔드는 이 문서의 응답 예시(Mock Response)를 그대로 복사해 개발을 시작할 수 있습니다.
- 백엔드는 이 문서의 스키마를 구현 기준으로 삼습니다.
- **스키마 변경 시 반드시 이 문서를 먼저 수정**한 뒤 PR로 공유합니다. (구두 합의만으로 바꾸지 않음)

---

## 1. 전체 구조

```
[React + Kakao Maps]  ──(REST / JSON)──>  [FastAPI]  ──>  [SQLite]
                                             │
                                             ├─>  Kakao Maps REST API
                                             └─>  기상청 API (단기예보, 자외선)
```

- **프론트**: 지도 표시, 사용자 입력 수집, 경로 렌더링
- **백엔드**: 외부 API 호출, 상황 태그 판단, 경로 가중치 조정, 데이터 저장
- **DB**: 사용자, 커스텀 경로, 상황별 경유 포인트

---

## 2. 공통 규칙

### 2-1. Base URL
- 개발: `http://localhost:8000`
- 모든 API 경로는 `/api/` 로 시작

### 2-2. 요청/응답 포맷
- **Content-Type:** `application/json; charset=utf-8`
- **인증이 필요한 엔드포인트:** 헤더에 `Authorization: Bearer <JWT_TOKEN>` 포함

### 2-3. 에러 응답 공통 포맷

```json
{
  "detail": "에러 메시지 (한국어 또는 영어)"
}
```

| HTTP Status | 의미 |
|-------------|------|
| 200 | 성공 |
| 201 | 생성 성공 (POST) |
| 400 | 요청 형식 오류 (파라미터 누락, 타입 불일치) |
| 401 | 인증 실패 (토큰 없음/만료) |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 500 | 서버 내부 오류 |

### 2-4. 좌표 포맷
- `lat` (위도): -90 ~ 90, float
- `lng` (경도): -180 ~ 180, float
- 한국 기준: 위도 약 33 ~ 38, 경도 약 124 ~ 132

---

## 3. 인증 API

### 3-1. POST `/api/auth/register` — 회원가입

**Request Body**
```json
{
  "email": "student@cbnu.ac.kr",
  "nickname": "홍길동",
  "password": "mypassword123"
}
```

**Response 201**
```json
{
  "id": 1,
  "email": "student@cbnu.ac.kr",
  "nickname": "홍길동"
}
```

**Error**
- 400: 이메일 형식 오류, 비밀번호 길이 부족
- 409: 이미 존재하는 이메일 (`"detail": "이미 가입된 이메일입니다"`)

---

### 3-2. POST `/api/auth/login` — 로그인

**Request Body**
```json
{
  "email": "student@cbnu.ac.kr",
  "password": "mypassword123"
}
```

**Response 200**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "student@cbnu.ac.kr",
    "nickname": "홍길동"
  }
}
```

**Error**
- 401: 이메일 또는 비밀번호 불일치

---

## 4. 날씨 API

### 4-1. GET `/api/weather/current` — 현재 날씨 + 자외선

**Query Parameters**

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `lat` | float | O | 위도 |
| `lng` | float | O | 경도 |

**예시 요청:** `GET /api/weather/current?lat=36.628&lng=127.456`

**Response 200**
```json
{
  "lat": 36.628,
  "lng": 127.456,
  "weather": "비",
  "temperature": 18.5,
  "rain_probability": 80,
  "snow_probability": 0,
  "uv_index": 2,
  "sunrise": "2026-04-23T05:45:00+09:00",
  "sunset": "2026-04-23T18:52:00+09:00",
  "updated_at": "2026-04-23T14:30:00+09:00"
}
```

**필드 설명**

| 필드 | 타입 | 값 예시 / 범위 |
|------|------|---------------|
| `weather` | string | `"맑음"`, `"흐림"`, `"비"`, `"눈"` |
| `temperature` | float | 섭씨 온도 |
| `rain_probability` | int | 0 ~ 100 (%) |
| `snow_probability` | int | 0 ~ 100 (%) |
| `uv_index` | int | 0 ~ 11+ (기상청 지수) |
| `sunrise`, `sunset` | string (ISO 8601) | KST 기준 |

---

## 5. 경로 추천 API ⭐ (핵심)

### 5-1. GET `/api/route/recommend` — 상황 인식 경로 추천

**Query Parameters**

| 이름 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `start_lat` | float | O | 출발지 위도 |
| `start_lng` | float | O | 출발지 경도 |
| `end_lat` | float | O | 목적지 위도 |
| `end_lng` | float | O | 목적지 경도 |

**예시 요청:**
```
GET /api/route/recommend?start_lat=36.628&start_lng=127.456&end_lat=36.634&end_lng=127.488
```

**Response 200**
```json
{
  "context_tags": ["주간", "비"],
  "weather": {
    "weather": "비",
    "rain_probability": 80,
    "uv_index": 2
  },
  "routes": [
    {
      "type": "default",
      "label": "일반 경로",
      "distance_m": 3200,
      "duration_s": 1800,
      "polyline": [
        [36.628, 127.456],
        [36.630, 127.465],
        [36.634, 127.488]
      ],
      "waypoints": []
    },
    {
      "type": "context",
      "label": "비 오는 날 추천 경로 (지하상가 경유)",
      "distance_m": 3450,
      "duration_s": 1920,
      "polyline": [
        [36.628, 127.456],
        [36.631, 127.470],
        [36.634, 127.488]
      ],
      "waypoints": [
        {
          "lat": 36.631,
          "lng": 127.470,
          "label": "성안길 지하상가 입구",
          "type": "shelter"
        }
      ]
    }
  ]
}
```

**`context_tags` 가능한 값**
- `"주간"` / `"야간"` — 현재 시간 기준
- `"비"` / `"눈"` — 강수확률 60% 이상일 때
- `"자외선_높음"` — UV 6 이상 (주간에만)
- `"자외선_매우높음"` — UV 8 이상 (주간에만)

**`routes[].type` 값**
- `"default"`: 일반 최단 경로 (상황 무관)
- `"context"`: 상황 태그 반영 경로 (항상 1개 이상 제공)

---

## 6. 커스텀 경로 API

> 이 섹션은 주로 **Frontend B** 담당 화면에서 사용합니다.

### 6-1. POST `/api/routes/custom` — 경로 등록 🔒

**Headers:** `Authorization: Bearer <TOKEN>` 필수

**Request Body**
```json
{
  "name": "출근길 A코스 (비오는날)",
  "start_lat": 36.628,
  "start_lng": 127.456,
  "end_lat": 36.634,
  "end_lng": 127.488,
  "waypoints": [
    { "lat": 36.630, "lng": 127.465, "label": "지하상가" }
  ],
  "context_tag": "비",
  "is_public": false
}
```

**`context_tag` 가능한 값:** `"기본"`, `"야간"`, `"비"`, `"눈"`, `"자외선"`

**Response 201**
```json
{
  "id": 42,
  "name": "출근길 A코스 (비오는날)",
  "start_lat": 36.628,
  "start_lng": 127.456,
  "end_lat": 36.634,
  "end_lng": 127.488,
  "waypoints": [
    { "lat": 36.630, "lng": 127.465, "label": "지하상가" }
  ],
  "context_tag": "비",
  "is_public": false,
  "created_at": "2026-04-23T14:30:00+09:00"
}
```

---

### 6-2. GET `/api/routes/custom` — 내 커스텀 경로 목록 🔒

**Headers:** `Authorization: Bearer <TOKEN>` 필수

**Response 200**
```json
{
  "total": 2,
  "routes": [
    {
      "id": 42,
      "name": "출근길 A코스 (비오는날)",
      "context_tag": "비",
      "is_public": false,
      "created_at": "2026-04-23T14:30:00+09:00"
    },
    {
      "id": 43,
      "name": "야간 귀가길",
      "context_tag": "야간",
      "is_public": true,
      "created_at": "2026-04-22T20:15:00+09:00"
    }
  ]
}
```

> 목록 응답에는 `waypoints`와 좌표 상세는 포함하지 않습니다. 상세는 6-3 참조.

---

### 6-3. GET `/api/routes/custom/{id}` — 경로 상세 🔒

**Response 200:** 6-1의 응답과 동일한 구조 (해당 `id`의 경로 전체 데이터)

**Error**
- 404: 경로가 없거나 다른 사용자 소유 (비공개인 경우)

---

### 6-4. DELETE `/api/routes/custom/{id}` — 경로 삭제 🔒

**Response 204:** 본문 없음

**Error**
- 403: 본인 소유가 아닌 경로 삭제 시도
- 404: 존재하지 않는 id

---

### 6-5. GET `/api/routes/shared` — 공개 경로 목록

**인증 불필요**

**Query Parameters (선택)**

| 이름 | 타입 | 설명 |
|------|------|------|
| `context_tag` | string | 필터: `"비"`, `"야간"` 등 |
| `limit` | int | 기본 20, 최대 100 |

**Response 200:** 6-2와 동일한 구조. `is_public: true`인 경로만 반환.

---

## 7. 데이터 모델 요약 (프론트 TypeScript 타입 참고용)

```typescript
// 사용자
interface User {
  id: number;
  email: string;
  nickname: string;
}

// 날씨 정보
interface Weather {
  lat: number;
  lng: number;
  weather: "맑음" | "흐림" | "비" | "눈";
  temperature: number;
  rain_probability: number;     // 0-100
  snow_probability: number;     // 0-100
  uv_index: number;             // 0-11+
  sunrise: string;              // ISO 8601
  sunset: string;
  updated_at: string;
}

// 상황 태그
type ContextTag = "주간" | "야간" | "비" | "눈" | "자외선_높음" | "자외선_매우높음";

// 경유 포인트
interface Waypoint {
  lat: number;
  lng: number;
  label?: string;
  type?: "shelter" | "shade" | "lit_road";
}

// 경로
interface Route {
  type: "default" | "context";
  label: string;
  distance_m: number;
  duration_s: number;
  polyline: [number, number][]; // [lat, lng] 배열
  waypoints: Waypoint[];
}

// 경로 추천 응답
interface RouteRecommendResponse {
  context_tags: ContextTag[];
  weather: Pick<Weather, "weather" | "rain_probability" | "uv_index">;
  routes: Route[];
}

// 커스텀 경로
interface CustomRoute {
  id: number;
  name: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  waypoints: Waypoint[];
  context_tag: "기본" | "야간" | "비" | "눈" | "자외선";
  is_public: boolean;
  created_at: string;
}
```

---

## 8. 프론트엔드용 Mock 데이터

백엔드가 준비되기 전에 프론트 개발을 시작할 수 있도록, 아래 Mock 데이터를 그대로 사용하세요.

### 8-1. `frontend/src/api/mock/weather.json`
```json
{
  "lat": 36.628,
  "lng": 127.456,
  "weather": "비",
  "temperature": 18.5,
  "rain_probability": 80,
  "snow_probability": 0,
  "uv_index": 2,
  "sunrise": "2026-04-23T05:45:00+09:00",
  "sunset": "2026-04-23T18:52:00+09:00",
  "updated_at": "2026-04-23T14:30:00+09:00"
}
```

### 8-2. `frontend/src/api/mock/customRoutes.json`
```json
{
  "total": 2,
  "routes": [
    {
      "id": 1,
      "name": "출근길 A코스 (비오는날)",
      "context_tag": "비",
      "is_public": false,
      "created_at": "2026-04-20T08:30:00+09:00"
    },
    {
      "id": 2,
      "name": "야간 귀가길 (조명 많은 길)",
      "context_tag": "야간",
      "is_public": true,
      "created_at": "2026-04-21T21:10:00+09:00"
    }
  ]
}
```

### 8-3. API 래퍼 예시 (환경변수로 실제/Mock 전환)

```javascript
// frontend/src/api/client.js
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function fetchCustomRoutes() {
  if (USE_MOCK) {
    const mock = await import("./mock/customRoutes.json");
    return mock.default;
  }
  const res = await fetch(`${BASE_URL}/api/routes/custom`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

**`.env` 설정:**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK=true   # 백엔드 준비되면 false로 변경
```

---

## 9. 인증 흐름 (시퀀스)

```
프론트                   백엔드                   DB
  │                       │                       │
  │──POST /register──────>│                       │
  │                       │──INSERT user──────────>│
  │<─────201 (user)───────│                       │
  │                       │                       │
  │──POST /login ────────>│                       │
  │                       │──SELECT user──────────>│
  │                       │<──user row────────────│
  │                       │  (bcrypt 비교)        │
  │<──200 (JWT token)─────│                       │
  │                       │                       │
  │ [localStorage 저장]    │                       │
  │                       │                       │
  │──GET /routes/custom──>│                       │
  │  Authorization: Bearer│                       │
  │                       │  (JWT 검증)           │
  │                       │──SELECT routes────────>│
  │<──200 (routes)────────│                       │
```

---

## 10. 변경 이력

| 날짜 | 변경 내용 | 작성자 |
|------|-----------|--------|
| 2026-04-23 | 초안 작성 | - |

> 스펙 변경 시 이 표에 추가하고, 해당 PR에서 프론트/백엔드 모두에게 리뷰 요청해주세요.
