#!/bin/bash
set -e

PROJECT_ID=${1:-preem-machine-dev}
TARGET_ENV_FILE=${2:-.env.development.local}
TARGET_E2E_FILE=${3:-.env.e2e}

echo "Using Project ID: $PROJECT_ID"
echo "Target ENV file: $TARGET_ENV_FILE"
echo "Target E2E file: $TARGET_E2E_FILE"

# Download development secrets
PROJECT_ID=$PROJECT_ID ./tools/nx run @preem-machine/cli:run:development -- dotenv download --force --file "$TARGET_ENV_FILE"

# Download E2E shared secrets
PROJECT_ID=$PROJECT_ID ./tools/nx run @preem-machine/cli:run:development -- dotenv download --force --file "$TARGET_E2E_FILE"
