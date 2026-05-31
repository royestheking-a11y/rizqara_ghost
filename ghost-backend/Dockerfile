FROM ghcr.io/puppeteer/puppeteer:latest

# We need to configure the environment to use the installed Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY --chown=pptruser:pptruser package*.json ./
RUN npm install

COPY --chown=pptruser:pptruser . .

EXPOSE 4000

CMD ["node", "server.js"]
