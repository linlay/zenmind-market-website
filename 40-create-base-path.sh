#!/bin/sh
set -e

base_path="${NGINX_BASE_PATH%/}"
html_root="${MARKET_WEBSITE_HTML_ROOT:-/usr/share/nginx/html}"

case "$base_path" in
  ""|"/")
    base_path=""
    ;;
  /*)
    case "$base_path" in
      *[!A-Za-z0-9_./-]*)
        echo "40-create-base-path: NGINX_BASE_PATH contains unsupported characters" >&2
        exit 1
        ;;
    esac
    ;;
  *)
    echo "40-create-base-path: NGINX_BASE_PATH must be empty or start with /" >&2
    exit 1
    ;;
esac

# Create a symlink so the same image works at any sub-path without rebuild.
# e.g. NGINX_BASE_PATH=/market
#   → /usr/share/nginx/html/market  →  symlink to /usr/share/nginx/html/
# nginx with root /usr/share/nginx/html will then resolve
#   /market/index.html   →  /usr/share/nginx/html/market/index.html  →  symlink  →  html/index.html
#   /market/assets/x.js →  /usr/share/nginx/html/market/assets/x.js  →  symlink  →  html/assets/x.js
if [ -n "$base_path" ]; then
  target="${html_root}${base_path}"
  mkdir -p "$(dirname "$target")"
  ln -sfn "$html_root" "$target"
  echo "40-create-base-path: created symlink ${target} -> ${html_root}"
fi

# Vite builds relative asset URLs so one image can be mounted anywhere. A base
# element makes those assets resolve from the deployment root even when a nested
# client route (for example /market/creator) is refreshed. The inline value is
# also consumed by BrowserRouter and the runtime API base.
index_file="${html_root}/index.html"
if [ -f "$index_file" ] && ! grep -q "__MARKET_BASE_PATH__" "$index_file"; then
  sed -i.bak "s#<head>#<head>\\
    <base href=\"${base_path}/\" />\\
    <script>window.__MARKET_BASE_PATH__='${base_path}';</script>\\
#" "$index_file"
  rm -f "${index_file}.bak"
fi
