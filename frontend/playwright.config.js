import { defineConfig, devices } from '@playwright/test'

// 端到端测试自己启动一套前后端，和开发环境互不影响：
//   后端 127.0.0.1:8001，数据库 backend/db.e2e.sqlite3（每次运行前重建，见 e2e/start-backend.mjs）
//   前端 localhost:5174，VITE_API_BASE 指向上面的后端
// 用例里的清数据操作都发往 8001，所以只会动测试库，不会动开发库 db.sqlite3。
const BACKEND_PORT = 8001
const FRONTEND_PORT = 5174
const FRONTEND_ORIGIN = `http://localhost:${FRONTEND_PORT}`
const BACKEND_ORIGIN = `http://127.0.0.1:${BACKEND_PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1, // 测试共用同一个后端数据库，串行执行
  reporter: [['list']],
  use: {
    baseURL: FRONTEND_ORIGIN,
    trace: 'retain-on-failure',
  },
  projects: [
    // E1–E3 在 1280×800 下跑；E4（responsive.spec.js）在两种视口下各跑一遍
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    {
      name: 'mobile',
      testMatch: /responsive\.spec\.js/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 740 }, hasTouch: true },
    },
  ],
  webServer: [
    {
      command: 'node e2e/start-backend.mjs',
      url: `${BACKEND_ORIGIN}/api/exercises/`,
      // 不复用已有进程：保证连的一定是测试库
      reuseExistingServer: false,
      timeout: 120_000,
      env: { E2E_BACKEND_PORT: String(BACKEND_PORT), E2E_FRONTEND_ORIGIN: FRONTEND_ORIGIN },
    },
    {
      command: `npm run dev -- --port ${FRONTEND_PORT} --strictPort`,
      url: FRONTEND_ORIGIN,
      reuseExistingServer: false,
      env: { VITE_API_BASE: BACKEND_ORIGIN },
    },
  ],
})
