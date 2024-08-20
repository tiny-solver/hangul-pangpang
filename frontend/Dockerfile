ARG SHORT_SHA

FROM node:lts-alpine
# yarn available with this image

ENV SHORT_SHA=${SHORT_SHA}

RUN echo "SHORT_SHA: ${SHORT_SHA}"

RUN ls -al

WORKDIR /app
COPY . .

RUN yarn

RUN yarn build

ENTRYPOINT [ "yarn", "preview", "--", "--host" ]
# CMD [ "/bin/sh" ]