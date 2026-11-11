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

## 설치

저장소 루트에서 설치 스크립트를 한 번 실행합니다. 가상환경 생성, 파이썬 패키지 설치, DB 마이그레이션, 운동 데이터와 이미지 가져오기, `npm install`까지 한 번에 처리합니다.

macOS / Linux / Git Bash:

```bash
bash scripts/setup.sh
```

Windows PowerShell:

```bash
powershell -ExecutionPolicy Bypass -File scripts\setup.ps1
```

- 인터넷 연결이 필요합니다. 운동 132개와 이미지(약 7 MB)를 공개 데이터 [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db)(Unlicense, 퍼블릭 도메인)에서 내려받습니다.
- 여러 번 실행해도 안전합니다. 이미 있는 가상환경·이미지는 다시 만들거나 받지 않습니다.
- **운동 이미지(`backend/media/`)와 DB(`backend/db.sqlite3`)는 git에 들어 있지 않습니다. 다른 PC로 옮기거나 새로 clone한 뒤에는 설치 스크립트를 다시 실행해야 합니다.** 실행하지 않으면 운동 목록이 비어 있습니다.
- 이미지 없이 빠르게 설치하려면 `bash scripts/setup.sh --skip-images` 또는 `scripts\setup.ps1 -SkipImages`. 이 경우 카드에 "이미지 없음"이 표시됩니다.

## 실행

터미널 두 개에서 각각 실행합니다.

```bash
cd backend
source .venv/bin/activate        # Windows: .venv\Scripts\activate
python manage.py runserver       # http://127.0.0.1:8000
```

```bash
cd frontend
npm run dev                      # http://localhost:5173
```

브라우저에서 `http://localhost:5173`을 엽니다. 백엔드의 CORS 기본 허용 주소가 이 값이므로 다른 포트를 쓰면 요청이 막힙니다.

같은 Wi-Fi의 휴대폰에서 확인하려면 `scripts/dev-lan.sh`(또는 `scripts\dev-lan.ps1`)를 사용합니다. 절차는 [docs/MOBILE_TEST.md](docs/MOBILE_TEST.md)에 있습니다.

### 운동 데이터 다시 가져오기

설치 스크립트가 실행하는 명령을 직접 실행할 수도 있습니다.

```bash
cd backend && python manage.py import_exercises
```

| 옵션 | 설명 |
| --- | --- |
| `--limit-per-group N` | 세부 근육마다 가져올 운동 수 (기본 6) |
| `--skip-images` | 이미지를 내려받지 않음 (이미 받은 이미지는 연결) |
| `--prune` | 이전에 가져왔지만 이번 선택에 없는 운동을 삭제 |
| `--data-file 경로` | 인터넷 대신 로컬 JSON 파일에서 읽음 |

## 테스트

```bash
# 백엔드
cd backend && python manage.py test

# 프론트엔드 단위 테스트
cd frontend && npm run test

# 종단 간 테스트
cd frontend && npx playwright install chromium firefox webkit   # 최초 1회
cd frontend && npm run e2e
```

종단 간 테스트는 서버를 직접 띄울 필요가 없습니다. Playwright가 테스트 전용 백엔드(포트 8001, DB `backend/db.e2e.sqlite3`)와 프론트엔드(포트 5174)를 스스로 시작하고, 매번 빈 DB에 테스트용 운동 97개를 넣은 뒤 실행합니다. 개발용 DB(`db.sqlite3`)는 건드리지 않습니다.

휴대폰 접속 스크립트의 IP 판별 로직은 `node --test scripts/`로 테스트합니다.

Firefox가 실행되지 않는 PC에서는 `npm run e2e:local`(Chromium, WebKit, iPhone 13 에뮬레이션)을 사용하세요.

결과는 [docs/TEST_REPORT.md](docs/TEST_REPORT.md)에 있습니다.

## 환경 변수

| 이름 | 위치 | 기본값 |
| --- | --- | --- |
| `DJANGO_SECRET_KEY` | 백엔드 | 개발용 키 |
| `CORS_ALLOWED_ORIGINS` | 백엔드 | `http://localhost:5173` (쉼표로 여러 개) |
| `GYM_DB_NAME` | 백엔드 | `db.sqlite3` (종단 간 테스트는 `db.e2e.sqlite3`) |
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
scripts/       설치 스크립트 (setup), 휴대폰 확인용 실행 스크립트 (dev-lan)
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
