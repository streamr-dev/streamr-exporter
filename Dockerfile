FROM node:16
WORKDIR /usr/src/app
COPY ./src ./src
COPY package.json .
COPY package-lock.json .
RUN npm ci
ENV port 9099
EXPOSE 9099
CMD ["sh","-c","node /usr/src/app/src/cmd/streamrExporter/main.js -p ${port}"]