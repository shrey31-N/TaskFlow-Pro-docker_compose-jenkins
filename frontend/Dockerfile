# syntax=docker/dockerfile:1

# ---- Build stage: install deps and produce a static build ----
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# No VITE_API_BASE_URL is set here on purpose: axios.js already defaults to
# the relative "/api" path, which nginx below proxies to api-gateway. Baking
# an internal Docker hostname (e.g. api-gateway:8080) into the bundle would
# break in the browser, since the browser can't resolve Docker service names.
RUN npm run build

# ---- Runtime stage: serve the static build with nginx ----
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
