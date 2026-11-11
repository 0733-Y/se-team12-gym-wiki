#!/usr/bin/env bash
# 一键安装（macOS / Linux / Git Bash）：建 venv、装依赖、migrate、导入动作和图片、npm install。
# 可以重复运行。换机器后要重新运行：动作图片（backend/media/）不在 git 里。
#   用法：bash scripts/setup.sh [--skip-images]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMPORT_ARGS=()
for arg in "$@"; do
  case "$arg" in
    --skip-images) IMPORT_ARGS+=(--skip-images) ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

step() { printf '\n==> %s\n' "$1"; }
need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing: $1. $2" >&2; exit 1; }; }

# 找一个真的能运行、且不低于 3.12 的解释器。
# 不能只看命令是否存在：Windows 上的 python3 可能是微软商店的占位程序，运行后什么都不做。
python_ok() { "$1" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 12) else 1)' >/dev/null 2>&1; }
PYTHON="${PYTHON:-}"
if [ -z "$PYTHON" ]; then
  for candidate in python3 python; do
    if python_ok "$candidate"; then PYTHON="$candidate"; break; fi
  done
fi
[ -n "$PYTHON" ] && python_ok "$PYTHON" || { echo "Missing: Python 3.12 or newer (tried python3, python)." >&2; exit 1; }
need node "Install Node.js 20.19+ or 22.12+."
need npm "Install Node.js 20.19+ or 22.12+."

step "Backend: virtual environment"
cd "$ROOT/backend"
[ -d .venv ] || "$PYTHON" -m venv .venv
if [ -x .venv/Scripts/python.exe ]; then VENV_PY=".venv/Scripts/python.exe"; else VENV_PY=".venv/bin/python"; fi

step "Backend: dependencies"
"$VENV_PY" -m pip install --quiet --disable-pip-version-check -r requirements.txt

step "Backend: database migrations"
"$VENV_PY" manage.py migrate --no-input

step "Backend: import exercises (downloads data and images; needs internet)"
"$VENV_PY" manage.py import_exercises "${IMPORT_ARGS[@]+"${IMPORT_ARGS[@]}"}"

step "Frontend: dependencies"
cd "$ROOT/frontend"
[ -f .env ] || cp .env.example .env
npm install --no-fund --no-audit

cat <<EOF

Setup finished.

  Backend :  cd backend && $VENV_PY manage.py runserver
  Frontend:  cd frontend && npm run dev
  Open    :  http://localhost:5173
EOF
