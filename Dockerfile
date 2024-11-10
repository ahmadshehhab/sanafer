FROM ghcr.io/puppeteer/puppeteer:23.7.1

ENV CHROME_BIN = /opt/render/.cache/puppeteer/chrome 

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
CMD ["node" , "index.js"]