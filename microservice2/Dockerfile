FROM node:latest

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY microservice-m2.js ./
COPY .env ./

CMD ["bash", "-c", "sleep 10 && node microservice-m2.js"]
