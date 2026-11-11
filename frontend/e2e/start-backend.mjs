// 端到端测试专用后端：用单独的数据库 db.e2e.sqlite3，每次从空库开始。
// 由 playwright.config.js 的 webServer 调用，不需要手动运行。
//   1. 删除上一次的测试库  2. migrate  3. 导入测试用动作清单（离线，不下载图片）  4. runserver
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const backend = path.resolve(here, '../../backend')
const DB_NAME = 'db.e2e.sqlite3'
const port = process.env.E2E_BACKEND_PORT || '8001'

const python = [path.join(backend, '.venv/Scripts/python.exe'), path.join(backend, '.venv/bin/python')].find(existsSync)
if (!python) {
  console.error('backend/.venv not found. Run scripts/setup first.')
  process.exit(1)
}

const env = {
  ...process.env,
  GYM_DB_NAME: DB_NAME,
  CORS_ALLOWED_ORIGINS: process.env.E2E_FRONTEND_ORIGIN || 'http://localhost:5174',
}

for (const suffix of ['', '-journal', '-wal', '-shm']) rmSync(path.join(backend, DB_NAME + suffix), { force: true })

function manage(...args) {
  const result = spawnSync(python, ['manage.py', ...args], { cwd: backend, env, stdio: 'inherit' })
  if (result.status !== 0) process.exit(result.status ?? 1)
}

manage('migrate', '--no-input', '-v', '0')
manage('import_exercises', '--data-file', path.join(here, 'fixtures/exercises.json'), '--skip-images')

const server = spawn(python, ['manage.py', 'runserver', `127.0.0.1:${port}`, '--noreload'], {
  cwd: backend,
  env,
  stdio: 'inherit',
})
const stop = () => server.kill()
process.on('SIGTERM', stop)
process.on('SIGINT', stop)
process.on('exit', stop)
server.on('exit', (code) => process.exit(code ?? 0))
