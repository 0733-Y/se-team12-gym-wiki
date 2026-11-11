#!/usr/bin/env bash
# 手机测试用：让同一局域网里的手机能打开前后端（macOS / Linux / Git Bash）。
#   后端  0.0.0.0:8000，ALLOWED_HOSTS 和 CORS 放行电脑的局域网 IP
#   前端  vite --host，VITE_API_BASE 指向 http://<IP>:8000
# 最后打印手机要打开的地址和二维码。按 Ctrl+C 同时停掉前后端。
#   用法：bash scripts/dev-lan.sh           （IP 选错时：LAN_IP=192.168.0.5 bash scripts/dev-lan.sh）
# 注意：开发服务器没有登录保护，只在可信的 Wi-Fi 上用。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

command -v node >/dev/null 2>&1 || { echo "Missing: node. Run scripts/setup.sh first." >&2; exit 1; }
if [ -x "$ROOT/backend/.venv/Scripts/python.exe" ]; then PY="$ROOT/backend/.venv/Scripts/python.exe"
elif [ -x "$ROOT/backend/.venv/bin/python" ]; then PY="$ROOT/backend/.venv/bin/python"
else echo "backend/.venv not found. Run scripts/setup.sh first." >&2; exit 1; fi
[ -d "$ROOT/frontend/node_modules" ] || { echo "frontend/node_modules not found. Run scripts/setup.sh first." >&2; exit 1; }

IP="$(node "$ROOT/scripts/lan-info.mjs" ip)"
URL="http://$IP:$FRONTEND_PORT"
API="http://$IP:$BACKEND_PORT"

echo "LAN address : $IP"
echo "Backend     : $API"
echo "Frontend    : $URL"

BACKEND_PID=""
cleanup() {
  [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
  # Git Bash 里 kill 只杀得掉 bash 子进程，Windows 上的 python 要用 taskkill 补一刀
  command -v taskkill >/dev/null 2>&1 && [ -n "$BACKEND_PID" ] && taskkill //PID "$BACKEND_PID" //T //F >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

(
  cd "$ROOT/backend"
  DJANGO_ALLOWED_HOSTS="$IP" \
  CORS_ALLOWED_ORIGINS="$URL,http://localhost:$FRONTEND_PORT" \
  exec "$PY" manage.py runserver "0.0.0.0:$BACKEND_PORT" --noreload
) &
BACKEND_PID=$!

echo
echo "On your phone (same Wi-Fi), open:"
echo
echo "    $URL"
echo
node "$ROOT/scripts/lan-info.mjs" qr "$URL"
echo
echo "If the page does not open, see docs/MOBILE_TEST.md (firewall section)."
echo "Press Ctrl+C to stop both servers."
echo

cd "$ROOT/frontend"
VITE_API_BASE="$API" npm run dev -- --host --port "$FRONTEND_PORT" --strictPort
