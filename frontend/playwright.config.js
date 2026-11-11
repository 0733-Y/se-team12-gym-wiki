import { defineConfig, devices } from '@playwright/test'

// 端到端测试：需要后端已在 127.0.0.1:8000 运行，并且已执行 import_exercises
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1, // 测试共用同一个后端数据库，串行执行
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:5173',
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
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})
