FROM node:12.20.0-alpine3.12

ARG ssh_prv_key

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm install --prod

COPY . .
EXPOSE 8080

CMD ["npm", "run", "start:prod"]