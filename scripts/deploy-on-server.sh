#!/usr/bin/env bash
# 在 ECS 上执行（已 ssh 登录后）：bash scripts/deploy-on-server.sh
# 作用：拉代码 → 同步前端静态 → 重启 API → 重载 Nginx（一条命令完成常见发布）
set -euo pipefail

REPO_DIR="${REPO_DIR:-/var/www/ren3}"
SITE_DIR="${SITE_DIR:-/var/www/ren3-site}"
PM2_APP="${PM2_APP:-ninja-api}"

cd "$REPO_DIR"
git pull origin main

# 默认不跑 npm（省内存）；若改了 backend/package.json 再执行：RUN_NPM=1 bash ...
if [[ "${RUN_NPM:-}" == "1" ]] && [[ -d "$REPO_DIR/backend" ]] && [[ -f "$REPO_DIR/backend/package.json" ]]; then
  (cd "$REPO_DIR/backend" && npm install --omit=dev)
fi

pm2 restart "$PM2_APP" --update-env

mkdir -p "$SITE_DIR"
cp -r "$REPO_DIR/frontend/build/"* "$SITE_DIR/"
chown -R www-data:www-data "$SITE_DIR" 2>/dev/null || true

nginx -t && systemctl reload nginx

echo "OK: pull + pm2 + static + nginx"
