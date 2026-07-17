FROM harbor.gtjaqh.io/library/node:22 AS build

WORKDIR /src

ARG VITE_MARKET_API_BASE=/api/v1
ARG BRAND=zenmind
ENV VITE_MARKET_API_BASE=$VITE_MARKET_API_BASE
ENV BRAND=$BRAND

COPY package.json ./
RUN npm install

COPY index.html vite.config.js ./
COPY src ./src
RUN npm run build

FROM harbor.gtjaqh.io/library/nginx:1.25-alpine

# Backend upstream is configurable via env vars so the same image works
# both in docker-compose (defaults below) and on Kubernetes/Alauda Cloud
# (set NGINX_BACKEND_HOST to the backend Service name).
ENV NGINX_BACKEND_HOST=zenmind-market-server \
    NGINX_BACKEND_PORT=8088

COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /src/dist /usr/share/nginx/html

EXPOSE 80
