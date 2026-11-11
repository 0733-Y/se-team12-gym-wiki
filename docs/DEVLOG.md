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
