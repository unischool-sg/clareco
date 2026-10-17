FROM docker.io/library/node:22-slim AS build
WORKDIR /srv/frontend
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# root で動かさないよう unprivileged 版を使う（8080 で待ち受け）
FROM docker.io/nginxinc/nginx-unprivileged:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /srv/frontend/dist /usr/share/nginx/html
