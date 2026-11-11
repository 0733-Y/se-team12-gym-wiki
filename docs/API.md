# GYM WIKI API 명세

12조 · 인터랙티브 운동 라이브러리와 훈련 피드백 관리 시스템

이 문서의 응답 예시는 실제 서버(`python manage.py runserver`)를 호출해 얻은 값입니다.

## 1. 공통 규칙

| 항목 | 내용 |
| --- | --- |
| 기본 경로 | `http://127.0.0.1:8000/api/` |
| 형식 | 요청·응답 모두 JSON (`Content-Type: application/json`) |
| 사용자 | 로그인 기능이 없습니다. 모든 요청은 서버의 `demo` 사용자 데이터로 처리됩니다. |
| 날짜 | `YYYY-MM-DD`. 클라이언트가 자신의 현지 날짜를 직접 보냅니다. |
| 시각 | ISO 8601, 서버 시간대는 `Asia/Seoul` (예: `2026-11-12T01:56:08.313535+09:00`) |
| 이미지 | 항상 `/media/`로 시작하는 경로를 반환합니다. 클라이언트가 서버 주소를 앞에 붙입니다. |

### 1.1 성공 응답

HTTP 200 / 201 / 204. 본문은 `data`에 담기며, 요약 정보가 있으면 `meta`가 함께 옵니다.

```json
{ "data": { }, "meta": { } }
```

`204 No Content`는 본문이 없습니다.

### 1.2 오류 응답

오류는 HTTP 상태 코드로 구분합니다. "HTTP 200에 오류 코드를 담는" 응답은 없습니다.

```json
{
  "error": {
    "code": "validation_error",
    "message": "A valid integer is required.",
    "fields": { "days": ["A valid integer is required."] }
  }
}
```

| HTTP | `error.code` | 발생 상황 |
| --- | --- | --- |
| 400 | `validation_error` | 잘못된 파라미터·본문, 잘못된 날짜 형식, JSON 파싱 실패. 필드 오류가 있으면 `fields`에 담깁니다. |
| 404 | `not_found` | 존재하지 않는 운동 id, 실수 노트에 없는 운동, 정의되지 않은 경로 |
| 409 | `conflict` | 유일성 제약 충돌 |
| 500 | `server_error` | 서버 내부 오류 |

`message`는 개발자용 영어 문장입니다. 화면에는 `code`에 대응하는 한국어·중국어·영어 문구를 표시하며 `message`를 그대로 보여 주지 않습니다.

## 2. 엔드포인트 목록

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| GET | `/exercises/` | 운동 전체 목록 (`?group=` 으로 근육 필터) |
| GET | `/exercises/{id}/` | 운동 상세 |
| GET | `/wrong-book/` | 실수 노트 목록 |
| POST | `/wrong-book/{exercise_id}/report/` | 자가 점검 결과 기록 (없으면 생성) |
| PATCH | `/wrong-book/{exercise_id}/` | 메모·원인·상태 수동 수정 |
| POST | `/wrong-book/{exercise_id}/review/` | 복습 결과 기록 |
| DELETE | `/wrong-book/{exercise_id}/` | 실수 노트에서 제거 |
| GET | `/training-logs/?from=&to=` | 기간 내 훈련 기록 |
| GET | `/training-logs/stats/?days=` | 최근 N일 추세와 요약 |
| GET | `/training-logs/{date}/` | 하루 기록 |
| PUT | `/training-logs/{date}/items/{exercise_id}/` | 운동 완료 표시 (멱등) |
| DELETE | `/training-logs/{date}/items/{exercise_id}/` | 완료 취소 |

## 3. 운동 라이브러리 (F01)

### 3.1 `GET /exercises/`

운동 전체를 반환합니다. 개수가 적어(현재 132개) 페이지를 나누지 않습니다.

| 쿼리 | 필수 | 설명 |
| --- | --- | --- |
| `group` | 아니오 | 세부 근육 id. 해당 근육을 포함하는 운동만 반환합니다. |

세부 근육 id (16개):
`chest`, `front-delts`, `side-delts`, `rear-delts`, `biceps`, `triceps`, `forearms`, `abs`, `traps`, `erectors`, `lats`, `glutes`, `thighs-front`, `thighs-back`, `calves-front`, `calves-back`

`GET /exercises/?group=traps` → 200

```json
{
  "data": [
    {
      "id": 49,
      "name": "Barbell Shrug",
      "description": "1. Stand up straight with your feet at shoulder width as you…",
      "key_points": "Primary muscles: traps\nSecondary muscles: none\nMechanic: isolation\nKeep the movement controlled and stop if pain appears.",
      "category": "back",
      "muscle_groups": ["traps"],
      "difficulty": "beginner",
      "equipment": "barbell",
      "standard_image": "/media/exercises/free_exercise_db/barbell-shrug.jpg",
      "video": null,
      "source_name": "free-exercise-db (yuhonas)",
      "source_url": "https://github.com/yuhonas/free-exercise-db/tree/main/exercises/Barbell_Shrug",
      "source_license": "Unlicense (public domain)",
      "reviewed": false
    }
  ]
}
```

| 필드 | 설명 |
| --- | --- |
| `name` | 영어 원문 이름. 화면의 한국어·중국어 이름은 클라이언트 번역표에서 가져옵니다. |
| `description` | 동작 단계. 줄바꿈으로 구분됩니다. |
| `category` | `chest` / `back` / `shoulders` / `arms` / `abs` / `legs` |
| `muscle_groups` | 세부 근육 id 배열. 첫 번째가 주동근입니다. |
| `difficulty` | `beginner` / `intermediate` / `expert` |
| `equipment` | `barbell`, `dumbbell`, `cable`, `machine`, `body only` 등. 없으면 빈 문자열 |
| `source_*` | 데이터 출처와 라이선스 (N03) |
| `reviewed` | 분류와 번역을 사람이 검수했는지 여부 |

잘못된 `group` 값 → 400 `validation_error` (`fields.group`)

### 3.2 `GET /exercises/{id}/`

운동 하나를 3.1과 같은 형태로 반환합니다.

존재하지 않는 id → 404

```json
{ "error": { "code": "not_found", "message": "Not found." } }
```

## 4. 자가 점검과 실수 노트 (F02)

한 사용자가 한 운동에 대해 가지는 기록은 하나뿐입니다. 같은 운동을 다시 기록하면 새 행이 생기지 않고 횟수가 늘어납니다.

### 4.1 기록 객체

```json
{
  "id": 59,
  "exercise": {
    "id": 95,
    "name": "Barbell Squat",
    "category": "legs",
    "muscle_groups": ["thighs-front", "glutes"],
    "difficulty": "beginner",
    "equipment": "barbell",
    "standard_image": "/media/exercises/free_exercise_db/barbell-squat.jpg"
  },
  "error_category": "joint",
  "user_note": "무릎이 안쪽으로 모임",
  "mastery_status": "unfixed",
  "error_count": 1,
  "review_count": 0,
  "success_streak": 0,
  "priority_remind": true,
  "added_at": "2026-11-12T01:56:08.313535+09:00",
  "last_reviewed_at": null
}
```

| 필드 | 값 |
| --- | --- |
| `error_category` | `form` 자세 불안정 / `muscle` 자극 부족 / `joint` 관절 불편 / `weight` 중량 과다 / `path` 궤적 오류 / `breathing` 호흡 오류 |
| `mastery_status` | `unfixed` 미숙련 / `practicing` 연습 중 / `mastered` 숙련 |
| `error_count`, `review_count`, `success_streak` | 서버가 상태 규칙에 따라 계산합니다. 요청으로 직접 바꿀 수 없습니다. |
| `priority_remind` | 훈련 계획에서 우선 배치할지 여부 |

### 4.2 상태 규칙

| 동작 | 결과 |
| --- | --- |
| report | 기록이 없으면 생성(`error_count = 1`), 있으면 `error_count += 1`. 상태는 `unfixed`, `success_streak = 0`. 원인과 메모를 요청 값으로 바꿉니다. |
| review `fixed` | `review_count += 1`, `success_streak += 1`. 연속 3회 이상이면 `mastered`, 아니면 `practicing` |
| review `recurred` | `review_count += 1`, `error_count += 1`, `success_streak = 0`, 상태 `unfixed` |
| PATCH로 상태 변경 | `unfixed`·`practicing`으로 바꾸면 `success_streak = 0`. `mastered`로 바꾸면 `success_streak`이 3 미만일 때 3으로 올립니다. |

### 4.3 `GET /wrong-book/`

기록 객체 배열을 최근 추가 순으로 반환합니다. 기록이 없으면 `{"data": []}`.

### 4.4 `POST /wrong-book/{exercise_id}/report/`

| 본문 | 필수 | 설명 |
| --- | --- | --- |
| `error_category` | 예 | 4.1의 여섯 값 중 하나 |
| `user_note` | 아니오 | 최대 2000자. 생략하면 빈 문자열로 저장됩니다. |

- 새로 생성 → **201**, 기존 기록 갱신 → **200**. 본문은 기록 객체입니다.
- 존재하지 않는 운동 → 404
- 잘못된 `error_category` → 400

### 4.5 `PATCH /wrong-book/{exercise_id}/`

바꿀 필드만 보냅니다. 받을 수 있는 필드는 `error_category`, `user_note`, `mastery_status`, `priority_remind` 네 개이며 그 밖의 필드(횟수 등)는 무시합니다.

주의: `mastery_status`를 보내면 값이 그대로여도 4.2의 규칙이 적용됩니다. 메모만 고칠 때는 `mastery_status`를 보내지 마세요.

`{"mastery_status": "practicing", "priority_remind": false}` → 200, 갱신된 기록 객체

실수 노트에 없는 운동 → 404

### 4.6 `POST /wrong-book/{exercise_id}/review/`

| 본문 | 필수 | 설명 |
| --- | --- | --- |
| `outcome` | 예 | `fixed` (이번엔 제대로 했음) 또는 `recurred` (다시 틀림) |

→ 200, 갱신된 기록 객체. `last_reviewed_at`이 현재 시각으로 바뀝니다.

`{"outcome": "maybe"}` → 400

```json
{
  "error": {
    "code": "validation_error",
    "message": "\"maybe\" is not a valid choice.",
    "fields": { "outcome": ["\"maybe\" is not a valid choice."] }
  }
}
```

### 4.7 `DELETE /wrong-book/{exercise_id}/`

→ **204** (본문 없음). 이미 없는 기록이면 404.

## 5. 훈련 기록 (F03)

훈련 계획 자체는 서버에 저장하지 않습니다. 계획은 클라이언트가 운동 목록과 실수 노트로 계산하며, 서버에는 "어느 날 어떤 운동을 완료했는지"만 저장합니다. 완료 여부는 "해당 날짜의 기록에 그 운동 항목이 있는가"로 판단합니다.

### 5.1 기록 객체

```json
{
  "id": 22,
  "date": "2026-11-09",
  "weekday": 0,
  "title": "thighs-front+glutes",
  "note": "",
  "plan_goal": "hypertrophy",
  "plan_frequency": 4,
  "total_count": 4,
  "completed_count": 1,
  "items": [
    {
      "id": 62,
      "exercise_id": 95,
      "exercise_key": "95",
      "exercise_name": "Barbell Squat",
      "focus_label": "thighs-front",
      "sets": 4,
      "reps": "8-12",
      "rest": "60-90s",
      "completed_at": "2026-11-12T01:56:08.472334+09:00",
      "image": "/media/exercises/free_exercise_db/barbell-squat.jpg"
    }
  ],
  "created_at": "2026-11-12T01:56:08.470300+09:00",
  "updated_at": "2026-11-12T01:56:08.473323+09:00"
}
```

| 필드 | 설명 |
| --- | --- |
| `weekday` | `date`에서 계산한 요일. 월요일 = 0, 일요일 = 6 |
| `total_count` | 그날 계획된 운동 수 (클라이언트가 보낸 값) |
| `completed_count` | 완료한 운동 수 = `items` 길이. 서버가 계산합니다. |
| `items[].exercise_name` | 완료 시점의 이름 스냅샷. 운동이 나중에 삭제되어도 남습니다. |
| `title`, `focus_label`, `reps`, `rest` | 언어와 무관한 값으로 저장합니다(근육 id, `8-12`, `60-90s` / `2-3min`). 화면에서 현재 언어로 바꿔 표시합니다. |

한 사용자의 하루 기록은 하나, 하루 기록 안에서 같은 운동 항목도 하나입니다.

### 5.2 `GET /training-logs/?from=YYYY-MM-DD&to=YYYY-MM-DD`

기간(양 끝 포함) 안의 기록 객체 배열을 날짜순으로 반환합니다. 달력과 이번 주 완료 상태가 이 엔드포인트를 씁니다.

| 쿼리 | 필수 | 설명 |
| --- | --- | --- |
| `from`, `to` | 예 | `to`는 `from`보다 빠를 수 없고, 기간은 최대 366일입니다. |

파라미터 누락 → 400

```json
{
  "error": {
    "code": "validation_error",
    "message": "This field is required.",
    "fields": { "to": ["This field is required."], "from": ["This field is required."] }
  }
}
```

`from`이 `to`보다 늦음 → 400 (`fields.to`: `to must not be earlier than from.`)

### 5.3 `GET /training-logs/{date}/`

하루 기록을 반환합니다. 기록이 없으면 오류가 아니라 `{"data": null}` 입니다.

잘못된 날짜(`2026-02-30`, `yesterday` 등) → 400 `validation_error` (`fields.date`)

### 5.4 `PUT /training-logs/{date}/items/{exercise_id}/`

운동을 완료로 표시합니다. **멱등**입니다. 같은 요청을 여러 번 보내도 항목은 하나만 남습니다.

본문의 모든 필드는 선택입니다.

| 본문 | 설명 |
| --- | --- |
| `title`, `plan_goal`, `plan_frequency`, `total_count` | 그날 기록에 저장 (보낸 값으로 갱신) |
| `exercise_name`, `focus_label`, `sets`, `reps`, `rest` | 항목에 저장. `exercise_name`을 생략하면 운동의 영어 이름을 씁니다. |

→ 200, 그날의 기록 객체 (5.1)

- 존재하지 않는 운동 → 404
- 잘못된 날짜 → 400

### 5.5 `DELETE /training-logs/{date}/items/{exercise_id}/`

완료를 취소합니다. → 200, 갱신된 그날의 기록 객체.

그날의 마지막 항목을 취소하면 기록 자체가 삭제되고 `{"data": null}`을 반환합니다. 원래 없던 항목을 취소해도 오류가 아닙니다.

### 5.6 `GET /training-logs/stats/?days=28`

오늘(서버 기준 `Asia/Seoul`)을 포함한 최근 `days`일의 일별 추세와 요약입니다.

| 쿼리 | 필수 | 설명 |
| --- | --- | --- |
| `days` | 아니오 | 7–90의 정수. 기본값 28 |

`GET /training-logs/stats/?days=7` → 200

```json
{
  "data": [
    { "date": "2026-11-06", "completed_count": 0, "total_count": 0 },
    { "date": "2026-11-07", "completed_count": 0, "total_count": 0 }
  ],
  "meta": { "days": 7, "workout_days": 1, "completed_total": 1, "streak": 0 }
}
```

(`data`는 실제로 `days`개의 항목을 날짜순으로 담습니다. 위 예시는 앞의 두 개만 보였습니다.)

| `meta` 필드 | 설명 |
| --- | --- |
| `workout_days` | 기간 안에서 운동을 하나 이상 완료한 날 수 |
| `completed_total` | 기간 안에서 완료한 운동 수 합계 |
| `streak` | 오늘부터 거슬러 올라가며 연속으로 운동한 날 수. 오늘 기록이 없으면 0 |

`days`가 정수가 아니거나 범위를 벗어남 → 400

```json
{
  "error": {
    "code": "validation_error",
    "message": "A valid integer is required.",
    "fields": { "days": ["A valid integer is required."] }
  }
}
```

## 6. 서버를 거치지 않는 기능

| 기능 | 처리 위치 |
| --- | --- |
| 3개 국어 검색, 근육 필터 | 브라우저 (`frontend/src/domain/search.js`) |
| 훈련 계획 생성 | 브라우저 (`frontend/src/domain/plan/`) |
| 칼로리·영양소·1RM 계산 (F04) | 브라우저 (`frontend/src/domain/calculators/`). 입력값과 결과는 서버로 보내지 않고 브라우저 저장소에도 남기지 않습니다 (N03). |
| 언어, 계획 목표·주당 횟수 | 브라우저 `localStorage` (설정값만 저장) |

## 7. 관리자 화면

`/admin/` 에서 운동, 실수 노트, 훈련 기록을 조회·수정할 수 있습니다(`python manage.py createsuperuser`로 계정 생성). 실수 노트의 횟수 필드는 관리자 화면에서도 읽기 전용입니다.
