FROM harbor.gtjaqh.io/library/node:22 AS build

WORKDIR /src

# BASE_PATH sets the sub-path for deploying under an existing domain.
# Examples: BASE_PATH=         (root, default)
#           BASE_PATH=/market  (served at https://example.com/market/)
# No trailing slash. Vite base, API base, nginx routes and static file
# layout are all derived from this single value.
ARG BASE_PATH=
ARG BRAND=zenmind
ENV VITE_BASE_PATH=$BASE_PATH/
ENV VITE_MARKET_API_BASE=$BASE_PATH/api/v1
ENV BRAND=$BRAND

COPY package.json ./
RUN npm install

COPY index.html vite.config.js ./
COPY src ./src
RUN npm run build

FROM harbor.gtjaqh.io/library/nginx:1.25-alpine

# Re-declare so the build-arg is available in this stage too.
ARG BASE_PATH=

# Backend upstream is configurable via env vars so the same image works
# both in docker-compose (defaults below) and on Kubernetes/Alauda Cloud
# (set NGINX_BACKEND_HOST to the backend Service name).
# NGINX_BASE_PATH mirrors the build-time BASE_PATH (no trailing slash) so
# nginx location blocks pick up the same sub-path at runtime.
ENV NGINX_BACKEND_HOST=zenmind-market-server \
    NGINX_BACKEND_PORT=8088 \
    NGINX_BASE_PATH=$BASE_PATH

COPY default.conf.template /etc/nginx/templates/default.conf.template
# When BASE_PATH is set (e.g. /market) files go to html/market/ so that
# vite's base-aware asset URLs resolve correctly.
COPY --from=build /src/dist /usr/share/nginx/html${BASE_PATH}/

EXPOSE 80
