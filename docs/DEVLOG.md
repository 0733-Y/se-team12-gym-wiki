# 开发日志

## P0 项目骨架

- **问题**：本机没有安装 Node.js（bash 与 PowerShell 都找不到 `node`/`npm`）。
  **原因**：开发环境只装了 Python 3.13。
  **解决**：后端按计划建好并验证（`manage.py check`、5 个测试通过、`runserver` 返回 200）；前端 Vite 骨架手工写出（未用 `npm create vue`），依赖版本沿用旧仓库并加 Pinia / Vitest / Playwright。之后经用户同意用 `winget install OpenJS.NodeJS.LTS` 装了 Node v26.13.0，`npm install`、`npm run test`（1 个通过）、`vite` 开发服务器与 `vite build` 均验证通过。新开的终端会话需要重开才能拿到 PATH。
- **问题**：`git commit` 提示 LF 将被替换为 CRLF。
  **原因**：Windows 上 git 默认 `core.autocrlf=true`。
  **解决**：只是警告，不影响内容，暂不处理。
- **问题**：Vitest 运行时打印 `ExperimentalWarning: localStorage is not available`。
  **原因**：Node 26 内置的 Web Storage 需要 `--localstorage-file` 参数，jsdom 环境下触发该警告。
  **解决**：不影响测试结果，暂不处理；P3 用到 localStorage 时再确认 jsdom 提供的实现可用。

## P1 后端模型、服务层与接口

- **问题**：P1 测试第一次运行即全部通过（27 个），过程中没有遇到失败用例；以下是实现时做出的取舍。
- **问题**：`?group=lats` 需要按 `muscle_groups`（JSON 列表）筛选，SQLite 不支持 `JSONField` 的 `contains` 查询。
  **原因**：Django 在 SQLite 后端上不实现 JSON 包含查找。
  **解决**：动作数量小（不分页），在 `exercises/services.py` 里取全部后用 Python 过滤；`group` 取值先用序列化器校验，非法值返回 400。
- **问题**：`stats?days=` 越界时是夹紧还是报错，4.4 节只写了"限制在 7–90"。
  **原因**：旧代码直接夹紧，但非数字会抛异常；N02 要求非法参数返回 400。
  **解决**：非数字与越界统一返回 400 `validation_error`（`fields.days`），前端只会传合法值。
- **问题**：`DEBUG=True` 时 `/api/` 下未匹配的路径会返回 Django 的 HTML 404 页，不符合统一错误外壳。
  **原因**：`handler404` 只在 `DEBUG=False` 时生效。
  **解决**：在 `config/urls.py` 末尾加 `re_path(r'^api/', ...)` 兜底，返回 `{"error": {"code": "not_found"}}`。
- **问题**：`PUT`/`DELETE /training-logs/{date}/items/{id}/` 的返回内容 5 节没有规定。
  **原因**：前端需要用服务器返回值更新 store（6.3 节"收到成功响应才更新"）。
  **解决**：两者都返回 200 和当天日志；删除最后一项后返回 `data: null`。`exercises` 模型的新字段（`difficulty`、`muscle_groups`、`source_*` 等）在 P1 一次建好，P2 只负责导入填充。

## P2 动作导入命令

- **问题**：旧前端 `MUSCLE_FILTERS` 有 17 个 id（`forearms-front` 与 `forearms-back` 分开），ARCHITECTURE.md 4.2 是 16 个（只有 `forearms`）。
  **原因**：旧代码按肌肉图正反面各建一个小臂筛选项，两者对应的动作完全相同。
  **解决**：以 4.2 的 16 个为准，导入时小臂统一写 `forearms`；P3 的 `muscleFilters.js` 让正反面两块 SVG 区域都映射到 `forearms`。小腿 `calves-front` / `calves-back` 两个都保留，导入时一起写入。
- **问题**：`Palms-Up Barbell Wrist Curl Over A Bench` 被判定为二头肌，分类却是胸部。
  **原因**：旧动作名规则里 `curl → biceps` 排在 `wrist → forearms` 前面；旧选取逻辑用分组的分类，而这个名字含 `bench`，先命中胸部分组。
  **解决**：`wrist|forearm|grip…` 规则移到 `biceps|curl` 之前；分类改为按源数据的肌肉判定（`map_category`），判定不出时才用分组的分类。T7 里有对应用例。
- **问题**：旧导入命令会跳过数据库里已有的动作名，不满足"可重复执行"。
  **原因**：旧逻辑是"只追加新动作"。
  **解决**：去掉跳过逻辑，以 `name` 为键 `update_or_create`；`reviewed`（人工抽检）和 `video` 不在更新字段里，重复导入不覆盖。另外把 `EXERCISE_GROUP_OVERRIDES` 中源数据里有的动作也一并选入，保证 Barbell Squat、Face Pull 等核心动作在库里。
- **问题**：许可信息要以源仓库 LICENSE 文件的实际内容为准，但 `LICENSE` 路径返回 404。
  **原因**：该仓库的文件名是 `LICENSE.md`。
  **解决**：读了 `LICENSE.md`，内容为 The Unlicense（公有领域），`source_license` 写 `Unlicense (public domain)`。
- **问题**：T7 不能依赖网络。
  **解决**：新增 `--data-file` 参数读本地 JSON；测试用从源数据截取的 8 条真实记录（`exercises/tests/fixtures/sample_exercises.json`），配合 `--skip-images` 离线运行。
- **结果**：实际导入 118 个动作、118 张图片（约 7 MB，在 `backend/media/`，不进 git）；16 个肌群都有动作；第二次运行显示 0 created、118 updated。
