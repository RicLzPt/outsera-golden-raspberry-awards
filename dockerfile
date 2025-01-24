FROM node:22-alpine

RUN apk add --no-cache sqlite

WORKDIR /app

COPY package*.json ./

COPY . .

EXPOSE 3000
