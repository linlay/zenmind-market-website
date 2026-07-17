FROM harbor.gtjaqh.io/library/node:22 AS build

WORKDIR /src

ARG BRAND=zenmind
ENV BRAND=$BRAND

COPY package.json ./
RUN npm install

COPY index.html vite.config.js ./
COPY src ./src
RUN npm run build

FROM harbor.gtjaqh.io/library/nginx:1.25-alpine

# All sub-path configuration is done at RUNTIME via environment variables.
# No build args needed — the same image works at any sub-path.
#   NGINX_BASE_PATH    — sub-path prefix, e.g. /market  (default: empty = root)
#   NGINX_BACKEND_HOST — backend Service name for K8s DNS resolution
#   NGINX_BACKEND_PORT — backend port (default: 8088)
ENV NGINX_BACKEND_HOST=zenmind-market-server \
    NGINX_BACKEND_PORT=8088 \
    NGINX_BASE_PATH=

COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY 40-create-base-path.sh /docker-entrypoint.d/40-create-base-path.sh
RUN chmod +x /docker-entrypoint.d/40-create-base-path.sh
COPY --from=build /src/dist /usr/share/nginx/html

EXPOSE 80
