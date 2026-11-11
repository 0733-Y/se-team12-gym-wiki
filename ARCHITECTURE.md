# GYM WIKI 重建架构

> 12조 · 인터랙티브 운동 라이브러리와 훈련 피드백 관리 시스템
> 依据：《프로젝트 개발 계획서》PPT（F01–F04、N01–N03、第13页验收标准）＋ 旧仓库 `shoxx6/10`（提交 `fd7084d`）
> 用途：放在新仓库根目录，交给 Claude Code 按阶段实现。

---

## 1. 目标与范围

把旧仓库重建成一个结构清晰、可测试的新仓库，功能以 PPT 为准。

| 范围 | 内容 |
| --- | --- |
| 本学期必须 | F01 动作库（肌肉图＋三语搜索＋详情）、F02 自检与易错本、F03 训练计划与日志 |
| 辅助 | F04 卡路里 / 营养素 / 1RM 计算 |
| 非功能 | N01 360px 与 1280px 可用、N02 API 错误提示·保存校验·防重复、N03 动作来源记录·不收集多余个人信息 |
| 明确不做 | 用户注册登录、跨设备同步、AI 姿态评价（PPT 第3页列为后续扩展） |

核心流程（PPT 第4页）必须完整跑通：

```
选肌肉/搜索 → 看动作详情 → 训练后自检 → 问题存入易错本
      ↑                                        ↓
  日志按日期记录 ← 计划里标记完成 ← 未掌握动作在计划中优先
```

## 2. 旧仓库现状与重建要解决的问题

| 旧仓库现状 | PPT 对应要求 | 重建后的做法 |
| --- | --- | --- |
| `App.vue` 单文件 7612 行，页面、算法、翻译、样式全在一起 | — | 拆成路由页面＋组件＋纯函数模块（见第6节） |
| `Exercise` 只有名称、说明、要点、分类、图片；注释写着"删掉了 level" | 第6页：肌肉·说明·难度·器械·图片路径；N03 动作来源 | 模型补 `difficulty`、`equipment`、`muscle_groups`、`source_*` 字段 |
| 细分肌群由前端用正则临时推算 | F01 肌肉筛选 | 导入时算好存进数据库，前端只读 |
| 接口两套风格：DRF ViewSet 与手写 `JsonResponse`；错误也返回 HTTP 200，错误码放在正文 `code` 里 | 第5页"일관된 API" | 统一 REST 路径、HTTP 状态码、响应外壳（第5节） |
| 计划完成状态存在 localStorage，先改本地再同步服务器，失败会不一致 | 第13页：刷新后与保存值一致、无重复记录 | 服务器是唯一数据源，前端收到成功响应才更新 |
| 手动改掌握状态时 `success_streak` 不跟着变 | 第6页：연속 교정 횟수 | 状态机集中在服务层（第4.3节） |
| `stats?days=abc` 直接抛异常 | N02 | 序列化器校验参数，返回 400 |
| `TIME_ZONE = 'UTC'` | 날짜별 로그 | 改为 `Asia/Seoul`，日期一律由前端显式传入 |
| `API_BASE` 写死 `http://127.0.0.1:8000` | — | 用 `VITE_API_BASE` 环境变量 |
| `api/tests.py` 为空 | 第13页：시험 결과서 | 后端、前端单元测试＋端到端测试（第8节） |
| 遗留代码：`*_OLD` 常量、脚手架组件、未使用的路由、`urls.py` 重复 include | — | 不迁移 |

## 3. 技术栈与仓库结构

沿用旧仓库版本，不换框架：Django 6.0、DRF 3.17、django-cors-headers、Pillow、SQLite；Vue 3.5、Vite 8、vue-router 5、Axios、`body-muscles`（肌肉 SVG）。新增：Pinia（状态）、Vitest（前端单元测试）、Playwright（端到端）。

```
gym-wiki/
├── CLAUDE.md                  # Claude Code 工作规则
├── ARCHITECTURE.md            # 本文件
├── README.md                  # 启动方法（韩文）
├── scripts/                   # setup.sh/.ps1 一键安装；dev-lan.sh/.ps1 手机测试；翻译审校导出
├── docs/
│   ├── API.md                 # API 明细（最终产出物）
│   ├── TEST_REPORT.md         # 验收测试结果（最终产出物）
│   └── DEVLOG.md              # 开发中遇到的问题与解决办法，边做边记
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/                # settings.py, urls.py, wsgi.py
│   ├── common/                # 响应外壳、异常处理、用户上下文
│   ├── exercises/             # S1 动作库
│   ├── feedback/              # S2 自检·易错本
│   ├── training/              # S4 训练日志·统计
│   └── media/                 # 图片（不进 git）
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── .env.example           # VITE_API_BASE=http://127.0.0.1:8000
    ├── e2e/                   # Playwright；自己启动前后端，用独立数据库 db.e2e.sqlite3
    └── src/                   # 见第6节
```

每个后端 app 的固定结构：`models.py`、`serializers.py`、`services.py`（业务规则）、`views.py`（只做收参和调用服务）、`urls.py`、`admin.py`、`tests/`。

子系统与设计书（S1–S7）的对应：S1 → `exercises`，S2 → `feedback`，S3 训练计划 → 前端 `domain/plan`，S4 → `training`，S5 计算 → 前端 `domain/calculators`，S6 公共 → `common` 与前端 `api/`、`i18n/`，S7 管理 → 各 app 的 `admin.py`。

## 4. 后端设计

### 4.1 数据模型

**exercises.Exercise**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | Char(100), unique | 英文原名，同时是翻译表的键 |
| `description` | Text | 动作步骤，按行分隔 |
| `key_points` | Text | 核心要点 |
| `category` | Char(20), choices | chest / back / shoulders / arms / abs / legs |
| `muscle_groups` | JSON list | 细分肌群 id，第一个为主肌群。取值见 4.2 |
| `difficulty` | Char(16), choices | beginner / intermediate / expert |
| `equipment` | Char(40), blank | barbell、dumbbell、machine、body only 等 |
| `standard_image` | Image, null | 存 `media/exercises/` 下的相对路径 |
| `video` | File, null | 可选 |
| `source_name` / `source_url` / `source_license` | Char / URL / Char | N03：数据来源与许可 |
| `reviewed` | Bool, default False | 分类与翻译是否经过人工抽检（PPT 第7页） |

**feedback.WrongRecord**（旧 `WrongActionBook`）

| 字段 | 说明 |
| --- | --- |
| `user` FK、`exercise` FK | `UniqueConstraint(user, exercise)` |
| `error_category` | form / muscle / joint / weight / path / breathing |
| `user_note` | Text |
| `mastery_status` | unfixed / practicing / mastered |
| `error_count`（默认1）、`review_count`、`success_streak` | 只能由服务层修改 |
| `priority_remind`、`added_at`、`last_reviewed_at` | |

**training.TrainingLog**：`user`、`date`、`title`、`note`、`plan_goal`、`plan_frequency`、`total_count`、`completed_count`、时间戳；`UniqueConstraint(user, date)`。

**training.TrainingLogItem**：`log` FK、`exercise` FK（SET_NULL）、`exercise_key`（= 动作 id 字符串）、`exercise_name`（名称快照）、`focus_label`、`sets`、`reps`、`rest`、`completed_at`；`UniqueConstraint(log, exercise_key)`。

`weekday` 字段不再存储，由 `date` 推算。

### 4.2 细分肌群

16 个 id，前后端共用同一份清单：
`chest, front-delts, side-delts, rear-delts, biceps, triceps, forearms, abs, traps, erectors, lats, glutes, thighs-front, thighs-back, calves-front, calves-back`

（以旧 `MUSCLE_FILTERS` 的 id 为准，迁移时核对。）

### 4.3 易错本状态机（`feedback/services.py`）

| 操作 | 触发 | 结果 |
| --- | --- | --- |
| `report` | 自检发现问题 | 无记录则新建（`error_count=1`）；有记录则 `error_count += 1`。状态置 `unfixed`，`success_streak = 0`，更新原因与笔记 |
| `review(fixed)` | 复习时做对了 | `review_count += 1`，`success_streak += 1`；连续 ≥ 3 次 → `mastered`，否则 `practicing` |
| `review(recurred)` | 复习时又错了 | `review_count += 1`，`error_count += 1`，`success_streak = 0`，状态 `unfixed` |
| `edit` | 手动改笔记/原因/状态 | 改成 `unfixed` 或 `practicing` 时 `success_streak = 0`；改成 `mastered` 时 `success_streak = max(原值, 3)` |
| `remove` | 移出易错本 | 删除记录 |

全部在事务里执行。视图不直接改这三个计数字段。

### 4.4 训练日志规则（`training/services.py`）

- `complete(date, exercise_id, meta)`：`get_or_create` 当天日志，`update_or_create` 条目，重新计算 `completed_count`。重复提交结果不变（幂等）。
- `uncomplete(date, exercise_id)`：删除条目；当天没有条目了就删除日志。
- `stats(days)`：`days` 限制在 7–90，返回每日序列＋训练天数、完成总数、连续天数。

### 4.5 公共部分（`common/`）

- `user_context.resolve_user(request)`：已登录用已登录用户，否则取/建 `demo` 用户。这是全系统唯一处理"当前用户"的地方，以后加登录只改这里。
- `exceptions.api_exception_handler`：DRF 自定义异常处理，输出统一错误格式。
- `settings`：`TIME_ZONE='Asia/Seoul'`、`CORS_ALLOWED_ORIGINS` 从环境变量读（开发默认 `http://localhost:5173`）、`MEDIA_ROOT=backend/media`。

### 4.6 数据导入命令

`python manage.py import_exercises`（迁移自旧 `import_free_exercise_db.py`）：

- 来源：开源 `yuhonas/free-exercise-db`，保留原有的"每个细分肌群按得分选前 N 个"逻辑与参数 `--limit-per-group`、`--skip-images`。
- 新增写入：`difficulty` ← 源数据 `level`，`equipment` ← `equipment`，`muscle_groups` ← 细分肌群判定结果（把旧前端 `EXERCISE_GROUP_OVERRIDES` 的人工修正并入），`source_*` 三个字段。许可信息以该仓库 LICENSE 文件的实际内容为准。
- 以 `name` 为键 `update_or_create`，可重复执行；图片下载失败只跳过并打印。
- P4 修订：只导入源数据里 `strength` / `powerlifting` 类的动作；按判定出的主肌群分组选前 N 个；另有一份基础动作表（深蹲、卧推、引体向上等）保证导入；`--prune` 删除本命令导入过但这次未选中的动作。

## 5. API 约定

基础路径 `/api/`，全部 JSON。

**响应外壳**

```jsonc
// 成功：HTTP 200 / 201 / 204
{ "data": { ... }, "meta": { ... } }      // meta 可选

// 失败：HTTP 400 / 404 / 500
{ "error": { "code": "validation_error", "message": "...", "fields": { "days": ["..."] } } }
```

`error.code` 取值：`validation_error`、`not_found`、`conflict`、`server_error`。前端按 `code` 显示三语提示，不直接显示服务器的 `message`。

**接口清单**

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/exercises/` | 全部动作（数量小，不分页）。可选 `?group=lats` |
| GET | `/exercises/{id}/` | 动作详情 |
| GET | `/wrong-book/` | 易错本列表，含动作摘要 |
| POST | `/wrong-book/{exercise_id}/report/` | 自检上报。体：`{error_category, user_note}` |
| PATCH | `/wrong-book/{exercise_id}/` | 手动编辑。体：`{error_category?, user_note?, mastery_status?, priority_remind?}` |
| POST | `/wrong-book/{exercise_id}/review/` | 复习结果。体：`{outcome: "fixed" \| "recurred"}` |
| DELETE | `/wrong-book/{exercise_id}/` | 移出易错本 |
| GET | `/training-logs/?from=YYYY-MM-DD&to=YYYY-MM-DD` | 日期区间内的日志（月历、本周完成状态都用它） |
| GET | `/training-logs/{date}/` | 单日详情，没有则 `data: null` |
| PUT | `/training-logs/{date}/items/{exercise_id}/` | 标记完成（幂等）。体：`{title, plan_goal, plan_frequency, total_count, exercise_name, focus_label, sets, reps, rest}` |
| DELETE | `/training-logs/{date}/items/{exercise_id}/` | 取消完成 |
| GET | `/training-logs/stats/?days=28` | 趋势与汇总 |

媒体：`standard_image` 始终返回以 `/media/` 开头的路径，前端只用一个 `mediaUrl()` 拼接基础地址。

## 6. 前端设计

### 6.1 目录

```
src/
├── main.js
├── App.vue                    # 外壳：导航、语言切换、<RouterView>、Toast
├── router/index.js
├── api/
│   ├── http.js                # axios 实例；拆外壳；把失败统一成 ApiError{code, fields}
│   ├── exercises.js
│   ├── wrongBook.js
│   └── trainingLogs.js
├── stores/                    # Pinia
│   ├── exercises.js           # 列表、加载状态、按 id 查
│   ├── wrongBook.js           # 记录、汇总、report/review/edit/remove
│   ├── trainingLog.js         # 区间日志、单日详情、统计、complete/uncomplete
│   ├── plan.js                # goal、frequency（存 localStorage，仅偏好）
│   └── ui.js                  # 语言、toast
├── domain/                    # 纯函数，不依赖 Vue，全部有单元测试
│   ├── search.js              # 三语同义词归一化与匹配
│   ├── selfCheck.js           # 6 道自检题 → 建议原因与笔记
│   ├── dates.js               # 本地日期格式化、本周周一
│   ├── plan/
│   │   ├── splits.js          # 各目标 × 频率的分化表
│   │   ├── strategies.js      # 四种目标的组数/次数/休息/每日动作数
│   │   ├── score.js           # 动作打分（含易错优先）
│   │   └── generator.js       # generateWeekPlan(goal, frequency, exercises, wrongRecords)
│   └── calculators/
│       ├── calorie.js
│       ├── macro.js
│       ├── oneRm.js
│       └── validate.js        # 输入范围校验
├── data/
│   ├── muscleFilters.js       # 16 个肌群：id、颜色、SVG 部位映射
│   └── searchSynonyms.js
├── i18n/
│   ├── index.js               # t(key, params)，缺键回退中文
│   ├── zh.js  ko.js  en.js    # 界面文字
│   ├── muscleLabels.js
│   ├── exerciseNames.js       # 动作名三语
│   └── exerciseTexts.js       # 动作说明三语
├── views/
│   ├── LibraryView.vue        # /library
│   ├── ExerciseDetailView.vue # /library/:id
│   ├── CorrectionView.vue     # /correction
│   ├── PlanView.vue           # /plans
│   ├── LogView.vue            # /logs
│   └── ToolsView.vue          # /tools
├── components/
│   ├── layout/   AppNav, LanguageMenu, ToastHost, ApiStatusBanner
│   ├── library/  BodyMap, MuscleFilterBar, SearchBox, ExerciseCard
│   ├── feedback/ SelfCheckForm, WrongRecordEditor, WrongRecordCard, ReasonChart
│   ├── plan/     PlanSettings, WeekStrip, PlanDayCard, PlanExerciseRow
│   ├── log/      MonthCalendar, DayLogPanel, TrendChart
│   └── tools/    CalorieTool, MacroTool, OneRmTool
└── styles/       tokens.css, base.css
```

依赖方向只有一条：`views/components → stores → api`，`views/components/stores → domain`。`domain/` 不 import 任何 store、api、Vue。

### 6.2 从旧 `App.vue` 迁移的对照表

| 旧位置（行号） | 内容 | 新位置 |
| --- | --- | --- |
| 78–250 | 动作详情模板（含自检、易错编辑） | `ExerciseDetailView` ＋ `feedback/*` |
| 251–379 | 动作库模板 | `LibraryView` ＋ `library/*` |
| 380–500 | 纠正中心模板 | `CorrectionView` |
| 501–652 | 训练计划模板 | `PlanView` ＋ `plan/*` |
| 653–750 | 训练日志模板 | `LogView` ＋ `log/*` |
| 751–912 | 工具模板 | `ToolsView` ＋ `tools/*` |
| 922–975 | `TOOL_META`、`MACRO_PLANS`、`PLAN_GOALS`、`PLAN_FREQUENCIES`、`WRONG_REASON_OPTIONS`、`SELF_CHECK_QUESTIONS`、`MASTERY_STATUS_OPTIONS` | 各自的 `domain/` 模块 |
| 978–1059 | `PLAN_SPLITS` | `domain/plan/splits.js` |
| 1160–1246、1729–1804 | `SEARCH_SYNONYMS`、`SEARCH_ACTION_SYNONYMS` | `data/searchSynonyms.js` |
| 1262–1728 | 动作名与说明的翻译表、替换规则 | `i18n/exerciseNames.js`、`exerciseTexts.js` |
| 1805–1992 | `MUSCLE_FILTERS` 及索引 | `data/muscleFilters.js` |
| 1993–2034 | `EXERCISE_GROUP_OVERRIDES` | 并入后端导入命令 |
| 2035–2298 | 动作内容翻译 | `i18n/exerciseTexts.js` |
| 2798–3479 | `BASE_TEXT`、`UI_TEXT` | `i18n/zh.js`、`ko.js`、`en.js` |
| 3541–3600 | `MUSCLE_LABELS` | `i18n/muscleLabels.js` |
| 3857–3880、4250–4313 | `generatedPlan`、`planSetRule`、`buildPlanExercises`、`pickExercisesForGroups`、`exercisePlanScore` | `domain/plan/*` |
| 3904–3935 | 三个计算器 | `domain/calculators/*` |
| 5263 以后 | 样式 | 拆到各组件的 `<style scoped>` ＋ `styles/` |
| 1069、2299、3480 起的 `*_OLD` 常量 | 废弃代码 | 不迁移 |

### 6.3 关键逻辑

**搜索（F01）** `search(exercises, term, lang)`：把输入小写、去空格 → 经同义词表归一成规范词（例：`벤치프레스`、`卧推`、`bench press` → 同一规范词）→ 与动作的英文名、当前语言译名、肌群标签匹配。三种语言输入同义词必须得到同一组动作。

**训练计划（F03）** 策略模式：

```js
// strategies.js
export const STRATEGIES = {
  beginner:    { sets: 3, reps: '10-12', rest: { unit: 's',   range: '60-90' }, perDay: 4 },
  hypertrophy: { sets: 4, reps: '8-12',  rest: { unit: 's',   range: '60-90' }, perDay: 4 },
  fatloss:     { sets: 3, reps: '12-15', rest: { unit: 's',   range: '30-60' }, perDay: 5 },
  strength:    { sets: 5, reps: '3-6',   rest: { unit: 'min', range: '2-3'   }, perDay: 4 },
}
```

打分（`score.js`，沿用旧规则）：属于目标肌群 +10；易错且 `unfixed` +8；`practicing` +5；开启优先提醒且未掌握 +2；复合动作 +4；器械/哑铃 +2；有视频 +1。
生成结果里每个动作带 `isReview: true/false`（在易错本且未掌握），界面显示"우선 복습"标记。`generator.js` 返回数据不含翻译文字，文字在组件里用 `t()` 生成。

**完成状态（F03 / N02）**：`PlanView` 进入时请求本周 `from–to` 的日志，用"该日期是否有这个 `exercise_id` 的条目"判断是否完成。点击完成 → 按钮进入等待状态 → 请求成功后用返回数据更新 store；失败则保持原状并提示。不再用 localStorage 存完成状态。

**计算器（F04）**

| 工具 | 公式 | 输入范围（超出则显示字段错误，不计算） |
| --- | --- | --- |
| 卡路里 | Mifflin-St Jeor：`10w + 6.25h − 5a + 5`（男）/ `− 161`（女）；TDEE = BMR × 活动系数；目标 = max(1000, TDEE + 调整) | 年龄 13–100；身高 100–250 cm；体重 20–300 kg |
| 营养素 | 每餐克数 = 热量 × 比例 ÷ (4 / 4 / 9) ÷ 餐数 | 热量 800–10000；餐数 1–10 |
| 1RM | Brzycki：`w × 36 / (37 − reps)`；reps = 1 时即为 w | 重量 > 0；次数 1–30 |

英制输入先换算：1 lb = 0.453592 kg，1 in = 2.54 cm。计算结果只在浏览器里，不上传（N03）。

**错误与离线（N02）**：`http.js` 把网络失败、超时、4xx、5xx 统一成 `ApiError`。动作列表加载失败时显示 `ApiStatusBanner` 和重试按钮；写操作失败用 Toast 提示且界面不变。

**响应式（N01）**：断点 720px、1120px。360px 下导航改为底部标签栏，肌肉图与列表上下排列，所有按钮触控区域 ≥ 44px；1280px 下左侧肌肉图、右侧列表。

## 7. 需求追踪

| ID | 实现位置 | 验证 |
| --- | --- | --- |
| F01 | `exercises` app、`LibraryView`、`domain/search.js` | 单元测试 T1、端到端 E1 |
| F02 | `feedback` app、`SelfCheckForm`、`CorrectionView` | 后端测试 T2、E2 |
| F03 | `domain/plan`、`training` app、`PlanView`、`LogView` | T3、T4、E3 |
| F04 | `domain/calculators`、`ToolsView` | T5 |
| N01 | 各页面样式 | E4（360 / 1280 两种视口） |
| N02 | `common/exceptions.py`、`api/http.js`、唯一约束 | T2、T4、T6 |
| N03 | `Exercise.source_*`、计算器不落库、无注册表单 | T7 |

## 8. 测试与验收（对应 PPT 第13页）

| 编号 | 位置 | 内容 | 通过标准 |
| --- | --- | --- | --- |
| T1 | `frontend/src/domain/search.test.js` | 10 个抽检动作 × 韩/中/英三种写法，共 30 个用例，放在 `search.samples.json` | 30 个全部命中预期动作 |
| T2 | `backend/feedback/tests/` | report → edit → review×3 → recurred 全流程；重复 report | 原因、次数、状态与预期一致；同一动作只有一条记录 |
| T3 | `frontend/src/domain/plan/*.test.js` | 4 目标 × 3 频率都能生成；易错未掌握动作被选入并带 `isReview` | 全部通过 |
| T4 | `backend/training/tests/` | 同一天同一动作 PUT 两次；取消最后一项 | 条目数为 1；日志被删除 |
| T5 | `frontend/src/domain/calculators/*.test.js` | 基准值（如男 25 岁 175 cm 70 kg → BMR 1673.75，取整 1674；100 kg × 5 次 → 112.5）与边界值、英制换算 | 误差 ≤ 1%；越界输入返回错误 |
| T6 | `backend/common/tests/` | 非法参数、不存在的 id、错误的日期格式 | 返回对应 HTTP 状态码与统一错误格式 |
| T7 | `backend/exercises/tests/` | 导入后的每个动作 | `source_name`、`muscle_groups` 非空 |
| E1–E4 | `frontend/e2e/` | E1 搜索与肌肉筛选；E2 自检 → 易错本 → 刷新仍在；E3 易错动作出现在计划 → 完成 → 日志里当天有记录；E4 在 360×740 与 1280×800 下重复 E1–E3 的关键点击 | 全部通过 |

端到端测试的隔离与浏览器范围（收尾阶段修订）：

- 后端读环境变量 `GYM_DB_NAME`（默认 `db.sqlite3`）。Playwright 的 `webServer` 用 `db.e2e.sqlite3` 在 8001 端口启动测试专用后端，每次先删库、`migrate`、离线导入 `e2e/fixtures/exercises.json`（`--skip-images`），前端在 5174 端口。用例里的清数据只会动测试库，开发库不受影响。
- 浏览器项目：`desktop`（Chromium 1280×800）、`mobile`（Chromium 360×740）、`webkit`、`firefox`、`iphone13`（WebKit 的 iPhone 13 模拟）。E1–E3 在 desktop / webkit / firefox 下跑；E4（`responsive.spec.js`）在 desktop / mobile / iphone13 下跑。
- 手机局域网测试用 `scripts/dev-lan`：后端环境变量 `DJANGO_ALLOWED_HOSTS` 追加局域网 IP，`CORS_ALLOWED_ORIGINS` 放行 `http://<IP>:5173`，前端 `VITE_API_BASE` 指向 `http://<IP>:8000`。真机点检表见 `docs/MOBILE_TEST.md`。

结果写入 `docs/TEST_REPORT.md`（韩文，表格：项目、场景、预期、实际、通过与否）。

## 9. 实施阶段

每个阶段结束都要：测试通过 → 提交一次 → 在 `docs/DEVLOG.md` 记下本阶段遇到的问题与解决办法。

| 阶段 | 内容 | 完成标志 |
| --- | --- | --- |
| P0 | 建目录、Django 项目与三个 app、Vite 项目、`.gitignore`、`README` | 前后端都能启动 |
| P1 | `common` ＋ 三个 app 的模型、迁移、服务层、序列化器、视图、admin | T2、T4、T6 通过 |
| P2 | 导入命令与新字段 | T7 通过；本地有动作数据和图片 |
| P3 | 前端骨架：路由、Pinia、`api/http.js`、i18n、把数据常量从旧 `App.vue` 搬出 | 五个空页面可切换、可换语言 |
| P4 | F01：肌肉图、筛选、搜索、详情 | T1、E1 通过 |
| P5 | F02：自检、易错本编辑、纠正中心 | E2 通过 |
| P6 | F03：计划生成、完成标记、日志月历与统计 | T3、E3 通过 |
| P7 | F04：三个计算器与输入校验 | T5 通过 |
| P8 | 响应式打磨、E4、`docs/API.md`、`docs/TEST_REPORT.md` | 全部测试通过 |

如果时间不够，优先级是 P1 → P4 → P5 → P6（PPT 第7页："핵심 흐름을 우선 완성"），P7 可以先直接搬旧计算逻辑。
