# GYM WIKI — Claude Code 工作规则

本仓库是对旧仓库 https://github.com/shoxx6/10 （提交 `fd7084d`）的重建。设计以 `ARCHITECTURE.md` 为准，开始任何工作前先读它。

## 首次初始化（开始 P0 之前自动检查并执行）

用户只把 `CLAUDE.md` 和 `ARCHITECTURE.md` 放进了一个普通文件夹，没有建仓库。每次开始工作先检查下面三项，缺哪项就补哪项，已有的跳过：

1. **本地 git**：当前文件夹没有 `.git` 时执行
   ```bash
   git init -b main
   ```
2. **旧仓库参考**：`../gym-wiki-legacy/` 不存在时执行
   ```bash
   git clone https://github.com/shoxx6/10.git ../gym-wiki-legacy
   git -C ../gym-wiki-legacy checkout fd7084d8ac0f1f29c08a4aa85e84086a1f46d5cc
   ```
   克隆失败（没有网络或权限）时停下来告诉用户，不要凭记忆重写旧代码。
3. **首次提交**：仓库还没有任何提交时，先建好 `.gitignore`（P0 的一部分），再把这两个文档提交一次，提交信息 `P0: 架构文档`。

推送到 GitHub 不自动做。只有用户明确要求并给出仓库地址时才执行：
```bash
git remote add origin <用户给的地址>
git push -u origin main
```
用户需要先在 GitHub 网站上建一个空仓库（不勾选自动生成 README）。

## 参考旧代码

`../gym-wiki-legacy/` 只读参考，不要修改它，也不要把它复制进本仓库。
迁移数据常量和算法时按 `ARCHITECTURE.md` 6.2 节的行号对照表取，名字以 `_OLD` 结尾的常量不迁移。

## 工作方式

- 按 `ARCHITECTURE.md` 第9节的阶段 P0 → P8 顺序做，一次只做一个阶段。
- 每个阶段：先写该阶段的测试，再实现，测试通过后提交一次，提交信息格式 `P3: 前端骨架`。
- 每个阶段结束时在 `docs/DEVLOG.md` 追加一段：遇到的问题、原因、解决办法。只写实际发生的。
- 需要偏离 `ARCHITECTURE.md` 时，先说明理由并更新该文件，再改代码。

## 硬性约束

- 不做用户注册登录、跨设备同步、AI 姿态评价。
- "当前用户"只能通过 `backend/common/user_context.py` 的 `resolve_user()` 获取。
- `WrongRecord` 的 `error_count`、`review_count`、`success_streak` 只在 `feedback/services.py` 里修改。
- 所有接口遵守第5节的响应外壳与 HTTP 状态码，不返回"HTTP 200 加正文错误码"。
- `frontend/src/domain/` 是纯函数：不 import Vue、store、api，不读写 localStorage，不调用 `t()`。
- 训练完成状态以服务器为准，不存 localStorage。localStorage 只存语言和计划偏好。
- 界面文字一律走 `t()`，三种语言（zh / ko / en）的键必须齐全。
- 计算器的输入和结果不发送到服务器。

## 命令

```bash
# 后端
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py import_exercises
python manage.py test
python manage.py runserver

# 前端
cd frontend && npm install
npm run dev
npm run test        # Vitest
npm run e2e         # Playwright，需要后端在运行
```

## 语言

代码标识符和提交信息前缀用英文；代码注释用中文；`README.md`、`docs/API.md`、`docs/TEST_REPORT.md` 用韩文（课程提交物）。
