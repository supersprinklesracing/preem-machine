#!/bin/bash
#
# Downloads the latest successful artifact from a GitHub Actions workflow.
#
# See: https://gemini.google.com/app/c0ed863f282a94e0
#
# Dependencies: curl, jq
#
# Usage:
# GITHUB_TOKEN=$(gh auth token) ./download_latest_artifact.sh

set -euo pipefail

OWNER="supersprinklesracing"
REPO="preem-machine"
WORKFLOW_ID="ci.yml"
DOWNLOAD_DIR="${HOME}/downloads"

if ! command -v curl &> /dev/null; then
    echo "Error: 'curl' is not installed. Please install it to continue." >&2
    exit 1
fi
if ! command -v jq &> /dev/null; then
    echo "Error: 'jq' is not installed. Please install it to continue." >&2
    exit 1
fi

if [ -z "${GITHUB_TOKEN:-}" ]; then
    echo "Error: The GITHUB_TOKEN environment variable is not set." >&2
    echo "Please create a Personal Access Token with 'repo' scope and set it:" >&2
    echo "export GITHUB_TOKEN='your_token_here'" >&2
    exit 1
fi

mkdir -p "${DOWNLOAD_DIR}"

API_BASE_URL="https://api.github.com"
AUTH_HEADER="Authorization: Bearer ${GITHUB_TOKEN}"
API_VERSION_HEADER="X-GitHub-Api-Version: 2022-11-28"

echo "Looking up workflow: ${OWNER}/${REPO}/${WORKFLOW_ID}"

has_in_progress_runs=false
IN_PROGRESS_RUNS_URL="${API_BASE_URL}/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_ID}/runs?status=in_progress"
IN_PROGRESS_COUNT=$(curl -s -L -H "${AUTH_HEADER}" -H "${API_VERSION_HEADER}" "${IN_PROGRESS_RUNS_URL}" | jq '.total_count')

if [ "${IN_PROGRESS_COUNT}" -gt 0 ]; then
    echo "    Note: ${IN_PROGRESS_COUNT} workflow run(s) are currently in progress."
    has_in_progress_runs=true
fi

# Fetch the latest runs for the repo to find the most recent one for our workflow.
# This queries all repo runs to ensure we search across all branches.
RUNS_URL="${API_BASE_URL}/repos/${OWNER}/${REPO}/actions/runs"

echo "--> Fetching latest run..."
LATEST_RUN=$(curl -s -L -H "${AUTH_HEADER}" -H "${API_VERSION_HEADER}" "${RUNS_URL}" | jq --arg WORKFLOW_ID "${WORKFLOW_ID}" '.workflow_runs | map(select(.path == ".github/workflows/\($WORKFLOW_ID)"))[0]')

if [ -z "${LATEST_RUN}" ] || [ "${LATEST_RUN}" == "null" ]; then
    echo "Error: No workflow runs found for ${WORKFLOW_ID} in the last 30 repo runs." >&2
    exit 1
fi

RUN_ID=$(echo "${LATEST_RUN}" | jq -r '.id')
echo "    Found latest run ID: ${RUN_ID}"

ARTIFACTS_URL="${API_BASE_URL}/repos/${OWNER}/${REPO}/actions/runs/${RUN_ID}/artifacts"

echo "--> Fetching artifacts for run ${RUN_ID}..."
ARTIFACT_INFO=$(curl -s -L -H "${AUTH_HEADER}" -H "${API_VERSION_HEADER}" "${ARTIFACTS_URL}" | jq '.artifacts[0]')

if [ -z "${ARTIFACT_INFO}" ] || [ "${ARTIFACT_INFO}" == "null" ]; then
    echo "Error: No artifacts found for run ID ${RUN_ID}." >&2
    exit 1
fi

ARTIFACT_ID=$(echo "${ARTIFACT_INFO}" | jq -r '.id')
ARTIFACT_NAME=$(echo "${ARTIFACT_INFO}" | jq -r '.name')
ARTIFACT_CREATED_AT=$(echo "${ARTIFACT_INFO}" | jq -r '.created_at')

echo "    Found artifact ID: ${ARTIFACT_ID} (Name: ${ARTIFACT_NAME})"

# Calculate relative time. Requires GNU `date`. Falls back for other systems.
relative_time_str=""
if date -d "${ARTIFACT_CREATED_AT}" >/dev/null 2>&1; then
    current_ts=$(date +%s)
    artifact_ts=$(date -d "${ARTIFACT_CREATED_AT}" +%s)
    age_seconds=$((current_ts - artifact_ts))

    if [ ${age_seconds} -lt 60 ]; then
        relative_time_str="${age_seconds} seconds ago"
    elif [ ${age_seconds} -lt 3600 ]; then
        relative_time_str="$((age_seconds / 60)) minutes ago"
    elif [ ${age_seconds} -lt 86400 ]; then
        relative_time_str="$((age_seconds / 3600)) hours ago"
    else
        relative_time_str="$((age_seconds / 86400)) days ago"
    fi
else
    # Fallback for non-GNU date (like on macOS)
    relative_time_str="on ${ARTIFACT_CREATED_AT}"
fi


DOWNLOAD_URL="${API_BASE_URL}/repos/${OWNER}/${REPO}/actions/artifacts/${ARTIFACT_ID}/zip"
OUTPUT_PATH="${DOWNLOAD_DIR}/artifacts.zip"

echo "--> Downloading artifact to ${OUTPUT_PATH}..."
curl -s -L -o "${OUTPUT_PATH}" \
    -H "${AUTH_HEADER}" \
    -H "${API_VERSION_HEADER}" \
    "${DOWNLOAD_URL}"

echo ""
echo "✅ Success!"
echo "   Artifact downloaded to: ${OUTPUT_PATH}"
echo "   Created: ${relative_time_str}"

if [ "${has_in_progress_runs}" = true ]; then
    echo ""
    echo "   ⚠️  Note: A newer workflow was in progress when this script started."
fi






