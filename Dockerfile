FROM node:18.12.1-bullseye

WORKDIR "/home/node/app"

COPY . /home/node/app
RUN npm install

VOLUME [ "/home/node/notes" ]
EXPOSE 8080

ENTRYPOINT [ "npm", "start" ]