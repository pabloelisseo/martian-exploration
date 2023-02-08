FROM node:14-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install pm2 -g
RUN npm install

CMD [ "pm2-runtime", "npm", "--", "run", "start:prod" ]