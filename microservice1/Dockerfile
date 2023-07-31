FROM node:latest

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY microservice-m1.js ./
COPY .env ./

CMD ["node", "microservice-m1.js"]
