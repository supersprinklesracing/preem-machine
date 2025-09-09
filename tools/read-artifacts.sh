#!/bin/bash
# See: https://gemini.google.com/app/34d2856463fd5ebd
set -e

# --- Configuration ---
DOWNLOADS_DIR="${HOME}/downloads"
SOURCE_ZIP="${DOWNLOADS_DIR}/artifacts.zip"
ARTIFACTS_EXTRACT_DIR="${DOWNLOADS_DIR}/artifacts"
# This internal path may need adjustment if your test output structure changes.
REPORT_DATA_PATH="${ARTIFACTS_EXTRACT_DIR}/apps/e2e-main/playwright-report"
E2E_LOG_FILE="${ARTIFACTS_EXTRACT_DIR}/e2e-server.log"


# --- Script Execution ---

if [ "$(basename "$PWD")" != "preem-machine" ]; then
    echo "Error: This script must be run from a directory named 'preem-machine'."
    exit 1
fi

echo "Starting Playwright report setup in 'preem-machine'..."

if [ -f "$SOURCE_ZIP" ]; then
    echo "New report found at $SOURCE_ZIP."

    if [ -d "$ARTIFACTS_EXTRACT_DIR" ]; then
        echo "Removing existing report directory: $ARTIFACTS_EXTRACT_DIR"
        rm -rf "$ARTIFACTS_EXTRACT_DIR"
    fi

    echo "Creating new report directory: $ARTIFACTS_EXTRACT_DIR"
    mkdir -p "$ARTIFACTS_EXTRACT_DIR"

    echo "Unzipping $SOURCE_ZIP into $ARTIFACTS_EXTRACT_DIR..."
    unzip -q "$SOURCE_ZIP" -d "$ARTIFACTS_EXTRACT_DIR"

    echo "Removing source zip file: $SOURCE_ZIP"
    rm "$SOURCE_ZIP"
else
    echo "Notice: Source report file not found at $SOURCE_ZIP."
    echo "Attempting to open the existing report without changes."
fi

if [ ! -d "$REPORT_DATA_PATH" ]; then
    echo "Error: Report data not found at the expected path: $REPORT_DATA_PATH"
    echo "Please ensure a report has been generated or the zip file has been extracted."
    exit 1
fi

# --- Display Server Log ---
echo "--------------------------------------------------"
echo "Checking for e2e-server.log..."

if [ -f "$E2E_LOG_FILE" ]; then
    echo "--- Log Content Start ---"
    cat "$E2E_LOG_FILE"
    echo "--- Log Content End ---"
    echo "Log file path: $E2E_LOG_FILE"
else
    echo "e2e-server.log not found in the report directory."
fi
echo "--------------------------------------------------"


# 'npx' can be run from any directory, so we don't need to 'cd'.
echo "Opening Playwright report from: $REPORT_DATA_PATH"
npx playwright show-report "$REPORT_DATA_PATH"

echo "Script finished successfully."

