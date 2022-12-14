FROM node:17.7.1-alpine3.14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8090

CMD [ "node", "index.js" ]