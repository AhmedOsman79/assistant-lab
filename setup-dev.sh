#!/bin/bash

set -e

# make sure the node version is starting with 16 from node -v
if ! [[ $(node -v) =~ ^v16.* ]]; then
    echo "Please install node version 16"
    exit 1
fi

# see if yarn is installed
if ! [ -x "$(command -v yarn)" ]; then
    echo "Please install yarn"
    exit 1
fi

# if there is no .env file, copy the example
if ! [ -f .env ]; then
    cp .env.example .env
fi

# run the db from docker-compose
docker compose up -d

# install dependencies
yarn install --immutable

# run the migrations and generate prisma client
yarn setup:db

echo "Setup complete!"
