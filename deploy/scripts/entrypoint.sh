#!/bin/bash

set -e
set -o errexit

stacks_path=/tabibi-data
templates_path="/opt/app/templates"
pg_data_path="$stacks_path/data/postgres"
pg_bin="/usr/lib/postgresql/15/bin"

init_local_postgres() {
        echo ""
        echo "Checking initialized local postgres"

        if [ -e "$pg_data_path/PG_VERSION" ]; then
                echo "Found existing Postgres, Skipping initialization"
        else
                echo "Initializing local postgresql database"

                mkdir -p $pg_data_path

                # Postgres does not allow it's server to be run with super user access, we use user postgres and the file system owner also needs to be the same user postgres
                chown postgres:postgres $pg_data_path

                # Initialize the postgres db file system
                su -m postgres -c "$pg_bin/initdb -D $pg_data_path"

                # Start the postgres server in daemon mode
                su postgres -c "$pg_bin/pg_ctl -D $pg_data_path start"

                psql -U postgres -c "CREATE DATABASE tabibi_db;"

                # Stop the postgres daemon
                su postgres -c "$pg_bin/pg_ctl stop -D $pg_data_path"
        fi

}

init_env_file() {
        CONF_PATH="$stacks_path/configuration"
        ENV_PATH="$CONF_PATH/docker.env"

        echo "Initialize docker.env file"
        if ! [[ -e "$ENV_PATH" ]]; then
                echo "Generating default configuration file"
                mkdir -p "$CONF_PATH"

                local random_db_user_password=$(
                        tr -dc A-Za-z0-9 </dev/urandom | head -c 13
                        echo ""
                )

                local random_jwt_token_secret=$(
                        tr -dc A-Za-z0-9 </dev/urandom | head -c 50
                        echo ""
                )

                local random_jwt_refresh_token_secret=$(
                        tr -dc A-Za-z0-9 </dev/urandom | head -c 50
                        echo ""
                )

                local random_jwt_qr_token_secret=$(
                        tr -dc A-Za-z0-9 </dev/urandom | head -c 50
                        echo ""
                )

                PGUSER="postgres"

                su postgres -c "$pg_bin/pg_ctl -D $pg_data_path start"
                psql -U $PGUSER -c "alter user postgres with password '$random_db_user_password'"
                su postgres -c "$pg_bin/pg_ctl stop -D $pg_data_path"

                bash "$templates_path/docker.env.sh" "$random_db_user_password" "$random_jwt_token_secret" "$random_jwt_refresh_token_secret" "$random_jwt_qr_token_secret" >"$ENV_PATH"
        fi

        echo "Load environment configuration"
        set -o allexport
        . "$ENV_PATH"
        set +o allexport
}

init_local_postgres

init_env_file

su postgres -c "$pg_bin/pg_ctl -D $pg_data_path start"

echo "Sync the DB with the schema"
npx prisma db push

node main.js
