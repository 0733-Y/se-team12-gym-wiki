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
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})
