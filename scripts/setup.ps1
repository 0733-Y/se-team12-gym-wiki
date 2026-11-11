# 一键安装（Windows PowerShell）：建 venv、装依赖、migrate、导入动作和图片、npm install。
# 可以重复运行。换机器后要重新运行：动作图片（backend\media\）不在 git 里。
#   用法：powershell -ExecutionPolicy Bypass -File scripts\setup.ps1 [-SkipImages]
param([switch]$SkipImages)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot

function Step($Text) { Write-Host "`n==> $Text" -ForegroundColor Cyan }

# 运行外部命令，失败就停下（PowerShell 5.1 不会因为退出码非 0 自动报错）
function Invoke-Checked {
    param([string]$Exe, [string[]]$Arguments)
    & $Exe @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$Exe $($Arguments -join ' ') failed with exit code $LASTEXITCODE" }
}

function Require($Name, $Hint) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) { throw "Missing: $Name. $Hint" }
}

Require 'python' 'Install Python 3.12 or newer.'
Require 'node' 'Install Node.js 20.19+ or 22.12+ (then reopen the terminal).'
Require 'npm' 'Install Node.js 20.19+ or 22.12+ (then reopen the terminal).'

$Backend = Join-Path $Root 'backend'
$Frontend = Join-Path $Root 'frontend'
$VenvPython = Join-Path $Backend '.venv\Scripts\python.exe'

Step 'Backend: virtual environment'
Push-Location $Backend
try {
    if (-not (Test-Path $VenvPython)) { Invoke-Checked 'python' @('-m', 'venv', '.venv') }

    Step 'Backend: dependencies'
    Invoke-Checked $VenvPython @('-m', 'pip', 'install', '--quiet', '--disable-pip-version-check', '-r', 'requirements.txt')

    Step 'Backend: database migrations'
    Invoke-Checked $VenvPython @('manage.py', 'migrate', '--no-input')

    Step 'Backend: import exercises (downloads data and images; needs internet)'
    $importArgs = @('manage.py', 'import_exercises')
    if ($SkipImages) { $importArgs += '--skip-images' }
    Invoke-Checked $VenvPython $importArgs
}
finally { Pop-Location }

Step 'Frontend: dependencies'
Push-Location $Frontend
try {
    if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env' }
    Invoke-Checked 'npm' @('install', '--no-fund', '--no-audit')
}
finally { Pop-Location }

Write-Host @"

Setup finished.

  Backend :  cd backend; .venv\Scripts\python manage.py runserver
  Frontend:  cd frontend; npm run dev
  Open    :  http://localhost:5173
"@
