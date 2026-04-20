FROM node:20-alpine

ENV PORT=3000 \
    MONGO_URL=mongodb://admin:password@mongodb:27017/?authSource=admin \
    MONGO_DB_NAME=user-account

RUN mkdir -p /home/app

WORKDIR /home/app

COPY package*.json ./
RUN npm install

COPY . /home/app

EXPOSE 3000

CMD ["node", "server.js"]
