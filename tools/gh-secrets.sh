#!/bin/bash

# A reusable script to push secrets from a specified .env file to a specific GitHub environment.

# --- Usage function ---
usage() {
    echo "This script pushes variables from a .env file to GitHub Actions secrets for a specific environment."
    echo ""
    echo "Usage: $0 -e <environment> -f <file> [--dry-run]"
    echo ""
    echo "Options:"
    echo "  -e, --environment    (Required) The name of the GitHub Actions environment (e.g., 'production')."
    echo "  -f, --file           (Required) The path to the .env file containing the secrets."
    echo "  -d, --dry-run        (Optional) Perform a dry run without actually setting the secrets."
    echo ""
    exit 1
}

# --- Initialize variables ---
dry_run=false
environment_name=""
env_file=""

# --- Parse command-line flags ---
while [[ $# -gt 0 ]]; do
    case "$1" in
        -e|--environment) {
            if [[ -n "$2" && "$2" != -* ]]; then
                environment_name="$2"
                shift 2
            else
                echo "Error: Missing value for --environment flag" >&2
                usage
            fi
            } ;;
        -f|--file) {
            if [[ -n "$2" && "$2" != -* ]]; then
                env_file="$2"
                shift 2
            else
                echo "Error: Missing value for --file flag" >&2
                usage
            fi
            } ;;
        -d|--dry-run|--dryrun) {
            dry_run=true
            shift
            } ;;
        *) {
            echo "Error: Unknown option $1" >&2
            usage
            } ;;
    esac
done

# --- Validate inputs ---
if [ -z "${environment_name}" ] || [ -z "${env_file}" ]; then
    echo "Error: Both --environment and --file flags are required." >&2
    usage
fi

if [ ! -f "$env_file" ]; then
    echo "Error: File not found at '$env_file'" >&2
    exit 1
fi

# --- Main script logic ---
if [ "$dry_run" = true ]; then
    echo "--- DRY RUN MODE ---" >&2
fi
echo "Reading secrets from '$env_file' for environment '$environment_name'." >&2
echo "------------------------------------------------------------------" >&2

grep -v '^#' "$env_file" | grep -v '^$' | while IFS= read -r line ; do
    key=$(echo "$line" | cut -d '=' -f 1)
    value=$(echo "$line" | cut -d '=' -f 2-)

    if [ -z "$value" ]; then
        continue
    fi

    echo "          $key: \${{ secrets.$key }}"

    if [ "$dry_run" = false ]; then
        echo "$value" | gh secret set "$key" --env "$environment_name"
    fi
done

echo "------------------------------------------------------------------" >&2

if [ "$dry_run" = true ]; then
    # Redirect final status to stderr
    echo "Dry run complete. No secrets were changed." >&2
else
    echo "All non-empty secrets from '$env_file' have been pushed to the '$environment_name' environment." >&2
fi
