FROM node:12.20.0-alpine3.12

WORKDIR /usr/src/app

COPY . .

RUN npm install pm2 -g
RUN npm install --production

CMD [ "pm2-runtime", "npm", "--", "run", "start:prod" ]