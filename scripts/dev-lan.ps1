# 手机测试用：让同一局域网里的手机能打开前后端（Windows PowerShell）。
#   后端  0.0.0.0:8000，ALLOWED_HOSTS 和 CORS 放行电脑的局域网 IP
#   前端  vite --host，VITE_API_BASE 指向 http://<IP>:8000
# 最后打印手机要打开的地址和二维码。按 Ctrl+C 同时停掉前后端。
#   用法：powershell -ExecutionPolicy Bypass -File scripts\dev-lan.ps1
#   IP 选错时：$env:LAN_IP = '192.168.0.5'; 再运行
# 注意：开发服务器没有登录保护，只在可信的 Wi-Fi 上用。
$ErrorActionPreference = 'Stop'
# 二维码用方块字符画。中文、韩文 Windows 的控制台默认代码页（936 / 949）画不出来，会变成乱码、扫不了
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
$Root = Split-Path -Parent $PSScriptRoot
$BackendPort = if ($env:BACKEND_PORT) { $env:BACKEND_PORT } else { '8000' }
$FrontendPort = if ($env:FRONTEND_PORT) { $env:FRONTEND_PORT } else { '5173' }

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Missing: node. Run scripts\setup.ps1 first.' }
$Python = Join-Path $Root 'backend\.venv\Scripts\python.exe'
if (-not (Test-Path $Python)) { throw 'backend\.venv not found. Run scripts\setup.ps1 first.' }
if (-not (Test-Path (Join-Path $Root 'frontend\node_modules'))) { throw 'frontend\node_modules not found. Run scripts\setup.ps1 first.' }

$Ip = (& node (Join-Path $Root 'scripts\lan-info.mjs') ip)
if ($LASTEXITCODE -ne 0 -or -not $Ip) { throw 'No LAN address found. Connect to Wi-Fi / Ethernet, or set $env:LAN_IP.' }
$Url = "http://${Ip}:$FrontendPort"
$Api = "http://${Ip}:$BackendPort"

Write-Host "LAN address : $Ip"
Write-Host "Backend     : $Api"
Write-Host "Frontend    : $Url"

# 后端放到后台，环境变量只对它生效
$env:DJANGO_ALLOWED_HOSTS = $Ip
$env:CORS_ALLOWED_ORIGINS = "$Url,http://localhost:$FrontendPort"
$backend = Start-Process -FilePath $Python `
    -ArgumentList @('manage.py', 'runserver', "0.0.0.0:$BackendPort", '--noreload') `
    -WorkingDirectory (Join-Path $Root 'backend') -PassThru -NoNewWindow
Remove-Item Env:DJANGO_ALLOWED_HOSTS, Env:CORS_ALLOWED_ORIGINS

try {
    Write-Host ''
    Write-Host 'On your phone (same Wi-Fi), open:'
    Write-Host ''
    Write-Host "    $Url"
    Write-Host ''
    & node (Join-Path $Root 'scripts\lan-info.mjs') qr $Url
    Write-Host ''
    Write-Host 'If the page does not open, see docs\MOBILE_TEST.md (firewall section).'
    Write-Host 'Press Ctrl+C to stop both servers.'
    Write-Host ''

    Push-Location (Join-Path $Root 'frontend')
    try {
        $env:VITE_API_BASE = $Api
        & npm run dev -- --host --port $FrontendPort --strictPort
    }
    finally {
        Remove-Item Env:VITE_API_BASE -ErrorAction SilentlyContinue
        Pop-Location
    }
}
finally {
    if ($backend -and -not $backend.HasExited) { Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue }
}
