FROM node:18-alpine3.15

WORKDIR "/home/node/app"

COPY . /home/node/app
RUN npm install

VOLUME [ "/home/node/notes" ]
EXPOSE 8080

ENTRYPOINT [ "npm", "start" ]