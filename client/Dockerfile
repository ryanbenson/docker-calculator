# multibuild process for node to build the app
# then take the build and put it into the nginx app

# build our app so we get a "build" dir with our prod build
FROM node:alpine as builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

# second phase to build nginx with our build from react
FROM nginx
# expose the port, which is used by our parent nginx
EXPOSE 3000
# copy our custom config to update how it's configured
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
# copy our build from react
COPY --from=builder /app/build /usr/share/nginx/html
# the default command will start up nginx
# so you don't need a specific command to be defined