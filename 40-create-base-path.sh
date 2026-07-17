#!/bin/sh
set -e

# Create a symlink so the same image works at any sub-path without rebuild.
# e.g. NGINX_BASE_PATH=/market
#   → /usr/share/nginx/html/market  →  symlink to /usr/share/nginx/html/
# nginx with root /usr/share/nginx/html will then resolve
#   /market/index.html   →  /usr/share/nginx/html/market/index.html  →  symlink  →  html/index.html
#   /market/assets/x.js →  /usr/share/nginx/html/market/assets/x.js  →  symlink  →  html/assets/x.js
if [ -n "$NGINX_BASE_PATH" ] && [ "$NGINX_BASE_PATH" != "/" ]; then
  target="/usr/share/nginx/html${NGINX_BASE_PATH}"
  mkdir -p "$(dirname "$target")"
  ln -sfn /usr/share/nginx/html "$target"
  echo "40-create-base-path: created symlink ${target} -> /usr/share/nginx/html"
fi
