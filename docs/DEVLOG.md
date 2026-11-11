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

## P3 前端骨架

- **问题**：Vitest 里 `localStorage` 是 `undefined`，17 个测试报 `Cannot read properties of undefined (reading 'clear')`。
  **原因**：Node 22 以后自带全局 `localStorage`，没给 `--localstorage-file` 时值为 `undefined`，并且盖住了 jsdom 的实现（P0 记下的那条警告就是它）。
  **解决**：加 `src/test/setup.js`，测试时把 `globalThis.localStorage` 换成内存版，在 `vite.config.js` 的 `setupFiles` 里引入。只影响测试，浏览器里用的是真实的 localStorage。
- **问题**：导航切换的测试里路由停在 `/library`，并打印 `Not implemented: window.scrollTo`。
  **原因**：除动作库外的页面是懒加载的，点一次再 `flushPromises()` 等不到组件加载完；jsdom 没实现 `scrollTo`，而路由的 `scrollBehavior` 会调用它。
  **解决**：测试改用 `vi.waitFor` 等路由和标题都更新；`setup.js` 里给 `scrollTo` 一个空实现。
- **问题**：`trainingLog` store 要记住"正在进行的请求"来防重复提交，但 Promise 放进 Pinia 的响应式状态后不能直接用。
  **原因**：Vue 的响应式代理包住 Promise 后，调用 `.then` 会因接收者不对而报错。
  **解决**：存入前用 `markRaw()` 包一下。
- **问题**：从 7612 行的旧 `App.vue` 搬常量，手抄容易出错。
  **解决**：写了一次性脚本按 6.2 节的行号整段切出来（界面文字、肌群标签、分化表、同义词、动作名与说明翻译），再用测试核对：三种语言各 223 个键完全一致、16 个肌群标签齐全、分化表里的肌群 id 都合法。`*_OLD` 常量没有迁移。肌肉图部位表手工改写：`MUSCLE_FILTERS` 只留 16 个 id 和颜色，另设 `BODY_REGIONS` 记录正反面区域，小臂两块区域都指向 `forearms`。
- **问题**：`domain/` 的纯度约束靠人记容易漏。
  **解决**：加 `domain/purity.test.js`，扫描 `domain/` 下所有文件，出现 `vue`、`pinia`、`stores/`、`api/`、`i18n/`、`localStorage`、`t(` 就失败。
- **未做**：动作名与说明的本地化函数（旧 `localizedExerciseName` 等）留到 P4 和详情页一起做，P3 只搬了翻译表；`TOOL_META` 只有三个 id，留到 P7。新增了 10 个界面文字键（语言、重试、关闭、加载中、页面建设中、5 种错误提示），三种语言都有。

## P4 动作库（F01）

- **问题**：P2 导入的 118 个动作里有大量拉伸、泡沫轴放松动作，没有引体向上、高位下拉、腿举、箭步蹲、提踵；`Plate Pinch` 被判成背阔肌。
  **原因**：旧选取逻辑不看源数据的类别，并且按"第一个命中的分组"归类；旧规则里的 `lat`、`row` 没有词边界，会命中 Plate、Lateral、Narrow。
  **解决**：先更新了 ARCHITECTURE.md 4.6，再改导入：只取 `strength` / `powerlifting` 类；按判定出的主肌群分组选前 N 个；加基础动作表；`lat`、`row` 加词边界；`Close-Grip` 里的 grip 不再算握力；新增 `--prune`。重新导入后是 132 个动作，16 个肌群都有。
- **问题**：旧搜索用"包含"匹配同义词，`卧推` 会把所有 press 都带出来，三种语言的结果也不保证一致。
  **解决**：`data/searchSynonyms.js` 整理成"动作词 → 规范词"和"肌群词 → 肌群 id"两张表，输入与任一写法相同（忽略大小写、空格、连字符）就归到同一个规范词。T1 的 30 个用例全部命中，并额外断言三种语言结果集相同。
- **问题**：旧动作名翻译表只覆盖旧数据库里的动作，新的 132 个里只有 29 个有人工译名，其余按规则生成，31 个动作挤在 12 个重名上。
  **解决**：新增 `i18n/exerciseNamesExtra.js` 补了 103 个动作的中文和韩文名；测试保证每个动作的译名不含英文、同一语言内不重名。
- **问题**：大腿、小腿的前后两个肌群标签同名，筛选按钮上分不清。
  **原因**：旧界面里它们分别显示在正面图和背面图旁边。
  **解决**：标签改为前侧 / 后侧，并加了"标签不重名"的测试。
- **问题**：没有人工翻译的动作，中文和韩文下只能显示按模板生成的通用说明。
  **解决**：这种情况在详情页标注"通用练习提示"，并可展开查看英文原文。大部分动作目前属于这种情况。
- **结果**：前端单元测试 108 个、后端 38 个、E1（Playwright，10 个用例）全部通过。E1 只跑了 1280×800，360px 的端到端留到 P8 的 E4。

## P5 自检与易错本（F02）

- **问题**：在详情页只改笔记再保存，"连续纠正次数"会被清零。
  **原因**：4.3 节规定手动把状态改成 `unfixed` / `practicing` 时 `success_streak = 0`，后端只要请求里带了 `mastery_status` 就按这条规则处理；编辑表单一开始把四个字段全部提交，没变的状态也带上了。
  **解决**：`WrongRecordEditor` 只提交和服务器记录不同的字段。E2 里有"只改笔记不会清零连续纠正次数"的用例。
- **问题**：每次自检都往笔记里追加一行"训练后自检：…"，重复自检后笔记越积越长，换语言后还会混着三种语言。
  **原因**：旧代码靠在界面里同步文字来处理，逻辑分散。
  **解决**：`domain/selfCheck.js` 的 `composeNote` 先去掉旧的自检行（三种语言的开头都认），再接上这次的；手写的内容保留。
- **问题**：`domain/` 不能调用翻译函数，但自检结果和笔记都需要文字。
  **解决**：`evaluateSelfCheck` 只返回题目 id 和建议的原因 id，文字由 `SelfCheckForm` 按当前语言生成后再传给 `composeNote`。
- **问题**：端到端测试会往开发数据库里写易错记录。
  **解决**：`e2e/helpers.js` 在每个用例前后通过接口清空 demo 用户的易错本。因此跑 E2 会清掉本机手动加的易错记录。
- **问题**：加了自检后，`App.test.js` 开始真的请求后端，打印 `ECONNREFUSED`。
  **原因**：动作库和详情页现在会加载易错本。
  **解决**：单元测试里把 `api/wrongBook.js` 也 mock 掉。
- **取舍**：纠正中心把"待复盘动作"放在统计和建议模板之前（旧界面相反），因为复盘是这个页面的主要操作。移出易错本没有加二次确认。新增 7 个界面文字键，三种语言都有；韩文沿用已有的"실수 노트"。
- **结果**：前端单元测试 119 个、后端 38 个、端到端 18 个（E1 10 个 + E2 8 个）全部通过。E2 只跑了 1280×800，360px 手动看过。
