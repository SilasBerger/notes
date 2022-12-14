FROM node:18.12.1-bullseye

WORKDIR "/home/node/app"

COPY ./dist /home/node/app
COPY ./package.json /home/node/app
COPY ./package-lock.json /home/node/app

RUN npm install

VOLUME [ "/home/node/notes" ]
EXPOSE 8080

ENTRYPOINT [ "npm", "run", "notes:serve" ]
