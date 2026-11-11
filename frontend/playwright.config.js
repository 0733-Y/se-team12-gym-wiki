import { defineConfig } from '@playwright/test'

// 端到端测试：需要后端已在 127.0.0.1:8000 运行
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:5173' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
})
