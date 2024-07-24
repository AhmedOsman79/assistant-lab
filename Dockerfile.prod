##################################################
##################### BUILDER ####################
##################################################
FROM node:16.20.2 as builder-deps

WORKDIR /app


#copy files required for installing node_modules packcages
COPY package.json .
COPY yarn.lock .
COPY .yarn/ /app/.yarn
COPY .yarnrc.yml .

# disable the husky postinstall script
RUN npm set-script prepare ""

# Install dependencies
RUN yarn install --immutable

# copy source code files required for the build
COPY ./src/ /app/src/
COPY ./prisma/ /app/prisma/
COPY ./.eslintrc.js .
COPY ./tsconfig.json .
COPY ./nest-cli.json .
# generate prisma client for types as they are also required for the build
RUN yarn prisma generate

# Build the application
RUN yarn build

#####################################################
##################### MAIN STAGE ####################
#####################################################
FROM ubuntu:20.04

LABEL maintainer="my_doctor_service@hotmail.com"

WORKDIR /opt/app


ENV NODE_ENV=production

# Update package lists and install essential tools
RUN apt-get update && \
    apt-get install -y curl wget gnupg && \
    apt-get clean

# Install Node.js 16.x using NodeSource repository
RUN mkdir -p /etc/apt/keyrings; \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
    | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg; \
    NODE_MAJOR=16; \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" \
    > /etc/apt/sources.list.d/nodesource.list; \
    apt-get -qy update; \
    apt-get -qy install nodejs;

ARG DEBIAN_FRONTEND=noninteractive

# Install PostgreSQL 15
RUN apt-get install software-properties-common apt-transport-https gpg -y \
    && curl -fsSl https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor | tee /usr/share/keyrings/postgresql.gpg > /dev/null \
    && echo deb [arch=amd64,arm64,ppc64el signed-by=/usr/share/keyrings/postgresql.gpg] http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main | tee /etc/apt/sources.list.d/postgresql.list \
    && apt-get update -y \
    && apt-get install postgresql-15 postgresql-client-15 -y \
    && apt-get remove software-properties-common apt-transport-https gpg -y

# Clean up cache file
RUN rm -rf \
    /root/.cache \
    /root/.npm \
    /usr/local/share/doc \
    /usr/share/doc \
    /usr/share/man \
    /var/lib/apt/lists/* \
    /tmp/*

VOLUME [ "/tabibi-data" ]

# copy the build
COPY --from=builder-deps /app/dist/ /opt/app/.
COPY --from=builder-deps /app/node_modules/ /opt/app/node_modules/

COPY package.json .
COPY ./prisma/ /opt/app/prisma/
COPY ./tsconfig.json .

COPY ./deploy/templates/ /opt/app/templates/

# copy scripts
COPY ./deploy/scripts/ /opt/app/scripts/

RUN chmod +x ./scripts/entrypoint.sh

# HEALTHCHECK --interval=15s --timeout=15s --start-period=45s CMD "/opt/app/healthcheck.sh"

EXPOSE 3000

ENTRYPOINT [ "/opt/app/scripts/entrypoint.sh" ]
