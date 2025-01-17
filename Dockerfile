##base image##
FROM node:20.11.0 AS base

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY prisma/ ./prisma/
COPY src/ ./src/
COPY nodemon.json ormconfig.json tsconfig.json ./

FROM base AS builder

WORKDIR /usr/src/app

RUN npm i -g prisma \
  && prisma generate \
  && npm run build

FROM node:20.11.0-alpine3.19 AS runtime

WORKDIR /usr/src/app

COPY package*.json ./
COPY .env.production /app/.env

RUN npm install --only=production \
  && npm i -g prisma

COPY --from=builder /usr/src/app/build ./
COPY --from=builder /usr/src/app/prisma ./

RUN prisma generate

ENTRYPOINT ["node","./app.js"]
