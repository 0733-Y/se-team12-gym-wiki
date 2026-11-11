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
