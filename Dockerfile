FROM node:14

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3001

CMD ["sh", "-c", "node_modules/.bin/knex migrate:latest --env prod && npm run start"]
