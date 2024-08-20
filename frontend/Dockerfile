FROM node:lts-alpine
# yarn available with this image

RUN ls -al

WORKDIR /app
COPY . .

RUN yarn

RUN yarn build

ENTRYPOINT [ "yarn", "preview", "--", "--host" ]
# CMD [ "/bin/sh" ]