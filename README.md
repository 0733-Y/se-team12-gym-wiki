# GYM WIKI

12조 · 인터랙티브 운동 라이브러리와 훈련 피드백 관리 시스템

설계 문서는 `ARCHITECTURE.md`를 참고하세요.

## 요구 환경

- Python 3.12 이상
- Node.js 20.19 이상 또는 22.12 이상

## 백엔드 실행

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py test
python manage.py runserver       # http://127.0.0.1:8000
```

## 프론트엔드 실행

```bash
cd frontend
cp .env.example .env             # VITE_API_BASE 설정
npm install
npm run dev                      # http://localhost:5173
npm run test                     # Vitest 단위 테스트
npm run e2e                      # Playwright (백엔드 실행 필요)
```

## 환경 변수

| 이름 | 위치 | 기본값 |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | 백엔드 | 개발용 키 |
| `CORS_ALLOWED_ORIGINS` | 백엔드 | `http://localhost:5173` |
| `VITE_API_BASE` | 프론트엔드 | `http://127.0.0.1:8000` |
