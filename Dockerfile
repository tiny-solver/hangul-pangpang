FROM node:lts-alpine
# yarn available with this image

RUN ls -al

WORKDIR /app
COPY . .

RUN yarn

ENTRYPOINT [ "/bin/sh" ]
# CMD [ "/bin/sh" ]