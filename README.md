# GYM WIKI

12조 · 인터랙티브 운동 라이브러리와 훈련 피드백 관리 시스템

근육 지도와 3개 국어(한국어·중국어·영어) 검색으로 운동을 찾고, 훈련 후 자가 점검 결과를 실수 노트에 남기면, 아직 익히지 못한 운동이 다음 주 훈련 계획에 먼저 배치됩니다.

```
근육 선택 / 검색 → 운동 상세 → 훈련 후 자가 점검 → 실수 노트에 기록
       ↑                                              ↓
  날짜별 기록 ← 계획에서 완료 표시 ← 미숙련 운동을 계획에 우선 배치
```

## 기능

| ID | 기능 | 화면 |
| --- | --- | --- |
| F01 | 운동 라이브러리: 근육 지도, 16개 세부 근육 필터, 3개 국어 검색, 상세 | `/library` |
| F02 | 훈련 후 자가 점검, 실수 노트, 교정 센터 | `/library/:id`, `/correction` |
| F03 | 주간 훈련 계획, 완료 표시, 달력 기록과 4주 추세 | `/plans`, `/logs` |
| F04 | 칼로리 / 영양소 / 1RM 계산기 | `/tools` |

로그인, 기기 간 동기화, AI 자세 평가는 포함하지 않습니다.

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
python manage.py import_exercises   # 운동 132개와 이미지를 내려받음 (인터넷 필요)
python manage.py runserver          # http://127.0.0.1:8000
```

`import_exercises`는 공개 데이터 [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db)(Unlicense, 퍼블릭 도메인)에서 근력 운동을 가져옵니다. 여러 번 실행해도 중복되지 않습니다.

| 옵션 | 설명 |
| --- | --- |
| `--limit-per-group N` | 세부 근육마다 가져올 운동 수 (기본 6) |
| `--skip-images` | 이미지를 내려받지 않음 |
| `--prune` | 이전에 가져왔지만 이번 선택에 없는 운동을 삭제 |
| `--data-file 경로` | 인터넷 대신 로컬 JSON 파일에서 읽음 |

이미지는 `backend/media/`에 저장되며 git에 포함되지 않습니다. 새 환경에서는 `import_exercises`를 다시 실행하세요.

## 프론트엔드 실행

```bash
cd frontend
cp .env.example .env             # VITE_API_BASE 설정
npm install
npm run dev                      # http://localhost:5173
```

개발 서버 주소는 `http://localhost:5173`을 사용하세요. 백엔드의 CORS 기본 허용 주소가 이 값입니다.

## 테스트

```bash
# 백엔드 (38건)
cd backend && python manage.py test

# 프론트엔드 단위 테스트 (191건)
cd frontend && npm run test

# 종단 간 테스트 (45건). 백엔드가 실행 중이고 import_exercises를 마친 상태여야 함
cd frontend && npx playwright install chromium   # 최초 1회
cd frontend && npm run e2e
```

주의: 종단 간 테스트는 `demo` 사용자의 실수 노트 전체와 오늘 기준 앞뒤 45일의 훈련 기록을 지웁니다.

결과는 [docs/TEST_REPORT.md](docs/TEST_REPORT.md)에 있습니다.

## 환경 변수

| 이름 | 위치 | 기본값 |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | 백엔드 | 개발용 키 |
| `CORS_ALLOWED_ORIGINS` | 백엔드 | `http://localhost:5173` (쉼표로 여러 개) |
| `VITE_API_BASE` | 프론트엔드 | `http://127.0.0.1:8000` |

## 구조

```
backend/
  config/      설정, URL
  common/      응답 형식, 오류 처리, 현재 사용자(resolve_user)
  exercises/   운동 모델, 가져오기 명령
  feedback/    실수 노트와 상태 규칙
  training/    훈련 기록과 통계
frontend/src/
  api/         HTTP 클라이언트 (오류를 ApiError로 통일)
  stores/      Pinia 상태
  domain/      순수 함수: 검색, 계획 생성, 계산기, 날짜
  data/        근육 필터, 검색 동의어
  i18n/        화면 문구와 운동 이름 (zh / ko / en)
  views/       화면 6개
  components/  layout, library, feedback, plan, log, tools
frontend/e2e/  Playwright 테스트
```

## 문서

| 문서 | 내용 |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 설계 (중국어) |
| [docs/API.md](docs/API.md) | API 명세 |
| [docs/TEST_REPORT.md](docs/TEST_REPORT.md) | 시험 결과서 |
| [docs/DEVLOG.md](docs/DEVLOG.md) | 개발 중 문제와 해결 기록 (중국어) |

## 데이터 출처와 개인정보

- 운동 설명과 이미지: yuhonas/free-exercise-db, Unlicense(퍼블릭 도메인). 각 운동의 출처와 라이선스는 상세 화면에 표시됩니다.
- 근육 지도: `body-muscles` 패키지 (Apache-2.0).
- 회원 가입이 없으며 개인을 식별하는 정보를 수집하지 않습니다. 계산기의 입력값과 결과는 브라우저 안에서만 계산하고 서버로 보내지 않습니다.
