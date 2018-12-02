FROM node:10-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN yarn build

COPY docker-entrypoint.sh /usr/local/bin/

CMD ["yarn", "start"]

ENTRYPOINT ["docker-entrypoint.sh"]
