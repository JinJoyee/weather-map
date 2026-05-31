# weather-map

날씨 기반 상황 인식 경로 추천 서비스

---

## 의존성 (Dependencies)

### 개발 환경
| 항목 | 버전 |
|---|---|
| OS | Windows 10/11, macOS 12+, Ubuntu 20.04+ |
| Python | 3.12+ |
| Node.js | 22+ |
| npm | 10+ |

### 백엔드 주요 라이브러리
| 라이브러리 | 버전 | 용도 |
|---|---|---|
| [fastapi](https://github.com/fastapi/fastapi) | 0.135.3 | 웹 프레임워크 |
| [uvicorn](https://github.com/encode/uvicorn) | 0.44.0 | ASGI 서버 |
| [httpx](https://github.com/encode/httpx) | 0.28.1 | 기상청 API HTTP 클라이언트 |
| [SQLAlchemy](https://github.com/sqlalchemy/sqlalchemy) | 2.0.49 | ORM |
| [pydantic](https://github.com/pydantic/pydantic) | 2.12.5 | 데이터 검증 |
| [python-jose](https://github.com/mpdavis/python-jose) | 3.5.0 | JWT 토큰 처리 |
| [python-dotenv](https://github.com/theskumar/python-dotenv) | 1.2.2 | 환경변수 관리 |

전체 의존성: `backend/requirements.txt` 참조

### 프론트엔드 주요 라이브러리
| 라이브러리 | 버전 | 용도 |
|---|---|---|
| [React](https://github.com/facebook/react) | 19.2.4 | UI 프레임워크 |
| [react-router-dom](https://github.com/remix-run/react-router) | 7.15.1 | 클라이언트 사이드 라우팅 |
| [axios](https://github.com/axios/axios) | 1.15.2 | HTTP 통신 |
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) | 3.4.19 | 스타일링 |
| [Vite](https://github.com/vitejs/vite) | 8.0.4 | 빌드 도구 |

전체 의존성: `frontend/package.json` 참조

---

## 실행 방법

### 백엔드

```bash
cd backend

# 가상환경 생성
python -m venv venv

# 가상환경 활성화
source venv/bin/activate      # Linux / Mac

# Windows CMD
venv\Scripts\activate
# Windows PowerShell (처음 실행 시 아래 명령어 먼저 실행 필요)
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\venv\Scripts\Activate.ps1

# 패키지 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env        # Linux / Mac
copy .env.example .env      # Windows
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

### Unit Test 실행

```bash
cd backend

# 가상환경 활성화
source venv/bin/activate      # Linux / Mac
venv\Scripts\activate         # Windows

# 테스트 의존성 설치 (최초 1회)
pip install pytest httpx

# 테스트 실행
python -m pytest tests/ -v
```

예상 출력:
```
tests/test_main.py::test_root PASSED
tests/test_main.py::test_weather_endpoint_requires_params PASSED
tests/test_main.py::test_route_endpoint_requires_params PASSED
3 passed
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

---

## Contributors

| GitHub ID | 실명 | 역할 |
|---|---|---|
| [ParkSeong-Ho](https://github.com/ParkSeong-Ho) | 박성호 | 프론트엔드 |
| [JinJoyee](https://github.com/JinJoyee) | 김동현 | 백엔드 |
| [mun592](https://github.com/mun592) | 문정현 | 프론트엔드 |
| [lxj0319](https://github.com/lxj0319) | 이서진 | 백엔드 |

---

## 라이선스 (License)

MIT License

Copyright (c) 2026 weather-map contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
