ARG source
FROM node:lts-alpine as app

WORKDIR /app
COPY dist/ .
COPY package.json .
COPY package-lock.json .

ENV NODE_ENV=production

RUN npm install


CMD ["npm", "start"]
