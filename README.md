# weather-map

날씨 기반 상황 인식 경로 추천 서비스

---

## 실행 방법

### 백엔드

```bash
cd backend

# 가상환경 활성화
source venv/bin/activate      # Linux / Mac
venv\Scripts\activate         # Windows

# 패키지 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env 파일을 열어 API 키 입력

# 서버 실행
uvicorn app.main:app --reload
```

서버 주소: `http://localhost:8000`  
API 문서: `http://localhost:8000/docs`

### 프론트엔드

```bash
cd frontend

# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일을 열어 값 확인 (기본값: http://localhost:8000)

# 개발 서버 실행
npm run dev
```

---

## API 키 발급

### 기상청 단기예보 API

1. [data.go.kr](https://www.data.go.kr) 회원가입 후 로그인
2. `기상청_단기예보 조회서비스` 검색 후 활용신청
3. 승인 후 마이페이지 → 개발계정 → 일반 인증키(Encoding) 복사
4. `backend/.env`의 `WEATHER_API_KEY`에 입력

### 카카오맵 API

1. [kakao developers](https://developers.kakao.com) 로그인
2. 애플리케이션 추가 후 REST API 키 복사
3. `backend/.env`의 `KAKAO_REST_API_KEY`에 입력

---

## 프로젝트 구조

```
weather-map/
├── backend/
│   ├── app/
│   │   ├── routers/       # API 엔드포인트
│   │   ├── services/      # 날씨, 경로 추천 로직
│   │   ├── config.py      # 환경변수 로드
│   │   └── main.py
│   ├── .env.example
│   └── requirements.txt
└── frontend/
    ├── src/
    ├── .env.example
    └── package.json
```

---

## 주요 API 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/weather/current` | 현재 날씨 조회 |
| GET | `/api/route/recommend` | 상황 인식 경로 추천 |
