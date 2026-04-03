# 一键：前端生产构建 → 提交 frontend/build → push（在项目根目录执行）
# 用法：
#   .\scripts\build-and-push.ps1
#   .\scripts\build-and-push.ps1 -Message "build: 某次更新"
# 若 push 失败（网络），多执行几次本脚本或单独 git push；已用 SSH 远程时同样适用。

param(
    [string] $Message = "build: 前端生产包"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "==> npm run build (frontend)" -ForegroundColor Cyan
Set-Location (Join-Path $Root "frontend")
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Set-Location $Root
$status = git status --porcelain "frontend/build"
if (-not $status) {
    Write-Host "==> frontend/build 无变化，跳过 commit/push" -ForegroundColor Yellow
    git push origin main 2>$null
    if ($LASTEXITCODE -eq 0) { Write-Host "==> push 成功（无新 build 提交）" -ForegroundColor Green }
    exit 0
}

Write-Host "==> git add frontend/build" -ForegroundColor Cyan
git add frontend/build
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
    Write-Host "==> commit 失败（可能无变更或需处理冲突）" -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "==> git push origin main" -ForegroundColor Cyan
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "==> push 失败：多为网络问题，请稍后重试: git push origin main" -ForegroundColor Red
    Write-Host "    若未配置 SSH，可先: git remote set-url origin git@github.com:toulanxia-max/ren3.git" -ForegroundColor Yellow
    exit $LASTEXITCODE
}

Write-Host "==> 完成" -ForegroundColor Green
