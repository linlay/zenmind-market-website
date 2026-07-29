FROM node:25-alpine AS build

WORKDIR /src

ARG VITE_MARKET_API_BASE=/market/api/v1
ARG BRAND=zenmind
ENV VITE_MARKET_API_BASE=$VITE_MARKET_API_BASE
ENV BRAND=$BRAND

COPY package.json ./
RUN npm install

COPY index.html vite.config.js ./
COPY src ./src
RUN npm run build

FROM nginx:1.29-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/dist /usr/share/nginx/html

EXPOSE 80
