#!/bin/bash

# A reusable script to push secrets from a specified .env file to GitHub and Google Cloud.

set -eo pipefail

# --- Usage function ---
usage() {
    echo "This script pushes variables from a .env file to GitHub Actions and Google Secret Manager."
    echo ""
    echo "Usage: $0 -e <environment> -f <file> -p <project-id> [-g <principals>] [--dry-run]"
    echo ""
    echo "Options:"
    echo "  -e, --environment     (Required) The name of the GitHub Actions environment."
    echo "  -f, --file            (Required) The path to the .env file containing the secrets."
    echo "  -p, --project         (Required) The Google Cloud Project ID."
    echo "  -g, --grant-access    (Optional) A comma-separated list of principals (e.g., service accounts) to grant access to."
    echo "  -d, --dry-run         (Optional) Perform a dry run without actually setting the secrets."
    echo ""
    exit 1
}

# --- Initialize variables ---
dry_run=false
environment_name=""
env_file=""
project_id=""
grant_access_list=""
declare -a secret_keys=() # Array to store keys for the final grant-access call

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
        -p|--project) {
            if [[ -n "$2" && "$2" != -* ]]; then
                project_id="$2"
                shift 2
            else
                echo "Error: Missing value for --project flag" >&2
                usage
            fi
            } ;;
        -g|--grant-access) {
             if [[ -n "$2" && "$2" != -* ]]; then
                grant_access_list="$2"
                shift 2
            else
                echo "Error: Missing value for --grant-access flag" >&2
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
if [ -z "${environment_name}" ] || [ -z "${env_file}" ] || [ -z "${project_id}" ]; then
    echo "Error: --environment, --file, and --project flags are all required." >&2
    usage
fi

if [ ! -f "$env_file" ]; then
    echo "Error: File not found at '$env_file'" >&2
    exit 1
fi

# --- Prerequisite Checks ---
if ! gh auth status &>/dev/null; then
    echo "Authentication Error: Not logged into the GitHub CLI. Please run 'gh auth login'." >&2
    exit 1
fi

if ! gcloud config get-value account &>/dev/null; then
    echo "Authentication Error: Not logged into the Google Cloud CLI. Please run 'gcloud auth login'." >&2
    exit 1
fi

if [ -n "$grant_access_list" ] && ! command -v firebase &> /dev/null; then
    echo "Dependency Error: Firebase CLI is required for --grant-access. Please install it ('npm install -g firebase-tools')." >&2
    exit 1
fi

# --- Main script logic ---
if [ "$dry_run" = true ]; then
    echo "--- DRY RUN MODE ---" >&2
fi
echo "Reading secrets from '$env_file' for environment '$environment_name'." >&2

# --- GitHub Section ---
echo "" >&2
echo "--- GitHub: (ci.yaml snippet) ---" >&2
echo "------------------------------------------------------------------" >&2
sed 's/\r$//' "$env_file" | grep -vE '^\s*(#|$)' | while IFS= read -r line || [[ -n "$line" ]]; do
    key="${line%%=*}"
    echo "                $key: \${{ secrets.$key }}"
done
echo "------------------------------------------------------------------" >&2

if [ "$dry_run" = false ]; then
    echo "Setting all GitHub secrets from '$env_file'..." >&2
    gh secret set -f "$env_file" --env "$environment_name"
else
    echo "(Dry Run) Would set all GitHub secrets from '$env_file'." >&2
fi

# --- Google Cloud Section ---
echo "" >&2
echo "--- Firebase: (apphosting.yaml snippet) ---" >&2
echo "------------------------------------------------------------------" >&2
# This loop handles GCP secret creation/updates and collects secret keys
sed 's/\r$//' "$env_file" | grep -vE '^\s*(#|$)' | while IFS= read -r line || [[ -n "$line" ]]; do
    key="${line%%=*}"
    value="${line#*=}"

    if [ -z "$value" ]; then
        continue
    fi

    # Add key to our array for the grant-access step later
    secret_keys+=("$key")

    echo -e "  - variable: $key\n    secret: $key"

    if [ "$dry_run" = false ]; then
        if ! gcloud secrets describe "$key" --project="$project_id" &>/dev/null; then
            echo "Creating GCP secret for '$key'..." >&2
            gcloud secrets create "$key" --project="$project_id" --data-file=- --replication-policy="automatic" >&2 <<< "$value"
        else
            current_value=$(gcloud secrets versions access latest --secret="$key" --project="$project_id")
            if [[ "$current_value" == "$value" ]]; then
                echo "GCP secret for '$key' is already up-to-date. Skipping." >&2
            else
                echo "Updating existing GCP secret for '$key'..." >&2
                gcloud secrets versions add "$key" --project="$project_id" --data-file=- >&2 <<< "$value"
            fi
        fi
    fi
done

echo "------------------------------------------------------------------" >&2

# Join the array of secret keys with a comma for the single command
IFS=','
secrets_to_grant="${secret_keys[*]}"
unset IFS

if [ "$dry_run" = false ]; then
    echo "Granting principals access to secrets..." >&2
    firebase apphosting:secrets:grantaccess --project "$project_id" --backend "main" "$secrets_to_grant"
fi
echo "------------------------------------------------------------------" >&2

# --- Final Status ---
echo "" >&2
if [ "$dry_run" = true ]; then
    echo "Dry run complete. No secrets were changed." >&2
else
    echo "All non-empty secrets from '$env_file' have been pushed." >&2
fi
