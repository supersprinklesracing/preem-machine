#!/bin/bash
# This script is intended to be run ONLY ONCE after cloning a new repository
# or creating a new git worktree. Its primary goal is to set up initial
# configuration values and environment variables required for development.
#
# It should NOT be used for general development cycle tasks (like starting
# servers or running tests).
set -e

# First argument is the project ID, default to supersprinklesracing-jlapenna
PROJECT_ID=${1:-preem-machine-dev}
TARGET_ENV_FILE=${2:-.env.development.local}
TARGET_E2E_FILE=${3:-.env.e2e}

# Check for gcloud authentication
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" >/dev/null 2>&1; then
  echo "⚠️  No active gcloud account found. Please run: gcloud auth login"
  exit 1
fi

# Ensure Application Default Credentials (ADC) are set up for the CLI/Secret Manager
if [ ! -f "$HOME/.config/gcloud/application_default_credentials.json" ]; then
  echo "⚠️  Application Default Credentials missing. Required for Secret Manager access."
  echo "Please run: gcloud auth application-default login"
  exit 1
fi

# Setup dotenv.
"./tools/dotenv-init.sh" "${PROJECT_ID}" "${TARGET_ENV_FILE}" "${TARGET_E2E_FILE}"

# Ensure Go is installed (required for agent app)
if ! command -v go >/dev/null 2>&1; then
  echo "❌ Go is not installed. Please install Go v1.24+ before running this script."
  exit 1
fi

# Verify Go installation
go version

# Install NX
pnpm add -w -D nx;


# Install Playwright browsers and dependencies for E2E testing.
echo "📥 Installing Playwright browsers..."
pnpm exec playwright install --with-deps
