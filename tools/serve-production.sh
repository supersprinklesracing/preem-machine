#!/usr/bin/env bash
set -e

if [ -z "$WORKSPACE_ROOT" ]; then
  echo "ERROR: WORKSPACE_ROOT is not set" >&2
  exit 1
fi

# The bundle target already copies static and public into the standalone directory.
# Structure: dist/apps/web/.next/standalone/apps/web/server.js
#            dist/apps/web/.next/standalone/apps/web/public/
#            dist/apps/web/.next/standalone/apps/web/.next/static/

export TARGET_APP=${TARGET_APP:-main}
export HOSTNAME=${HOSTNAME:-127.0.0.1}
export PORT=${PORT:-4200}

ENV_FILE="$WORKSPACE_ROOT/apps/$TARGET_APP/.env.development.local"
if [ ! -f "$ENV_FILE" ]; then
  ENV_FILE="$WORKSPACE_ROOT/.env.development.local"
fi

exec pnpm exec dotenv -e "$ENV_FILE" -- node "$WORKSPACE_ROOT/dist/apps/$TARGET_APP/.next/standalone/apps/$TARGET_APP/server.js"
