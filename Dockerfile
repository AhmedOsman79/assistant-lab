FROM node:16.20.2

WORKDIR /app

ENV NODE_ENV=production

#copy package.json and package-lock.json and yarn.lock
COPY package.json .
COPY yarn.lock .
COPY .yarn/ /app/.yarn
COPY .yarnrc.yml .


# disable the husky postinstall script
RUN npm set-script prepare ""

# install dependencies
RUN yarn install --immutable

COPY . .

# generate prisma client
RUN yarn prisma generate 

# build the app
RUN yarn build

# copy the entrypoint script
COPY ./entrypoint.sh /usr/local/bin/entrypoint.sh

# make the entrypoint script executable
RUN chmod +x /usr/local/bin/entrypoint.sh

# Define non-sudo user
RUN useradd --create-home --home-dir /home/appuser appuser \
    && chown -R appuser:0 /app \
    && chown -R appuser:0 /home/appuser \
    && chmod u+x /app \
    && chmod -R g=u /app

# Set yarn cache directory
ENV yarn_cache_folder /home/appuser/.yarn-cache

ENV HOME=/home/appuser
USER appuser


EXPOSE 3000

ENTRYPOINT [ "entrypoint.sh" ]
