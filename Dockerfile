FROM node:lts-buster
WORKDIR /app
COPY package*.json ./
RUN npm install && npm install -g pm2
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
