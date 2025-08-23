#!/bin/bash

# A reusable script to push secrets from a specified .env file to GitHub and Google Cloud,
# and optionally remove secrets that are not present in the file.

set -eo pipefail

# --- Usage function ---
usage() {
    echo "This script pushes variables from a .env file to GitHub Actions and Google Secret Manager."
    echo "It can also remove remote secrets that are not present in the local file."
    echo ""
    echo "Usage: $0 -f <file> -p <project-id> [-e <environment>] [-a <keys>] [--dry-run]"
    echo ""
    echo "Options:"
    echo "  -f, --file                 (Required) The path to the .env file containing the secrets."
    echo "  -p, --project              (Required) The Google Cloud Project ID."
    echo "  -e, --environment          (Optional) The name of the GitHub Actions environment. If omitted, secrets are set at the repository level."
    echo "  -a, --allow-unlisted-keys  (Optional) Comma-separated list of secret keys to NOT remove, even if they are not in the .env file."
    echo "  -d, --dry-run              (Optional) Perform a dry run without actually setting the secrets."
    echo ""
    exit 1
}

# --- Helper function to check if an element is in an array ---
# Usage: containsElement "element" "${array[@]}"
containsElement () {
  local e match="$1"
  shift
  for e; do [[ "$e" == "$match" ]] && return 0; done
  return 1
}

# --- Initialize variables ---
dry_run=false
environment_name=""
env_file=""
project_id=""
allow_unlisted_keys_str=""
declare -a secret_keys=() # Array to store keys from the .env file
declare -a allow_unlisted_keys=() # Array to store keys from the allowlist

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
        -a|--allow-unlisted-keys) {
            if [[ -n "$2" && "$2" != -* ]]; then
                allow_unlisted_keys_str="$2"
                shift 2
            else
                echo "Error: Missing value for --allow-unlisted-keys flag" >&2
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
if [ -z "${env_file}" ] || [ -z "${project_id}" ]; then
    echo "Error: --file and --project flags are required." >&2
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

# --- Main script logic ---
if [ "$dry_run" = true ]; then
    echo "--- DRY RUN MODE ---" >&2
fi
echo "Reading secrets from '$env_file'." >&2

# Convert allowlist string to an array
if [ -n "$allow_unlisted_keys_str" ]; then
    IFS=',' read -r -a allow_unlisted_keys <<< "$allow_unlisted_keys_str"
fi

# --- GitHub Section ---
echo "" >&2
echo "--- GitHub: Syncing secrets... ---" >&2
echo "------------------------------------------------------------------" >&2

# Prepare conditional arguments for GitHub CLI commands
declare -a gh_env_args=()
if [ -n "${environment_name}" ]; then
    gh_env_args=("--env" "$environment_name")
fi

# Get the list of existing GitHub secrets
echo "Fetching existing GitHub secrets..." >&2
mapfile -t remote_gh_secrets < <(gh secret list "${gh_env_args[@]}" --json name -q '.[].name')

# Create or update secrets from the local file
while IFS= read -r line || [[ -n "$line" ]]; do
    key="${line%%=*}"
    secret_keys+=("$key") # Add key to our list of local keys
done < <(sed 's/\r$//' "$env_file" | grep -vE '^\s*(#|$)')

if [ "$dry_run" = false ]; then
    echo "Setting all GitHub secrets from '$env_file'..." >&2
    gh secret set -f "$env_file" "${gh_env_args[@]}"
else
    echo "(Dry Run) Would set all GitHub secrets from '$env_file'." >&2
fi

# Remove secrets from GitHub that are not in the local file or allowlist
echo "Checking for stale GitHub secrets to remove..." >&2
for secret in "${remote_gh_secrets[@]}"; do
    if ! containsElement "$secret" "${secret_keys[@]}" && ! containsElement "$secret" "${allow_unlisted_keys[@]}"; then
        if [ "$dry_run" = false ]; then
            echo "Removing stale GitHub secret: $secret" >&2
            gh secret delete "$secret" "${gh_env_args[@]}"
        else
            echo "(Dry Run) Would remove stale GitHub secret: $secret" >&2
        fi
    fi
done
echo "------------------------------------------------------------------" >&2


# --- Google Cloud Section ---
echo "" >&2
echo "--- Google Cloud: Syncing secrets... ---" >&2
echo "------------------------------------------------------------------" >&2

# Get the list of existing GCP secrets managed by this script
echo "Fetching existing Google Cloud secrets with 'dotenv=managed' label..." >&2
mapfile -t remote_gcp_secrets < <(gcloud secrets list --project="$project_id" --filter="labels.dotenv=managed" --format="value(name)")

# Create or update secrets from the local file
while IFS= read -r line || [[ -n "$line" ]]; do
    key="${line%%=*}"
    value="${line#*=}"

    # Remove enclosing quotes from the secret value, if they exist.
    if [[ "$value" == \"*\" || "$value" == \'*\' ]]; then
        value="${value:1:-1}"
    fi

    if [ -z "$value" ]; then
        continue
    fi

    if [ "$dry_run" = false ]; then
        if ! gcloud secrets describe "$key" --project="$project_id" &>/dev/null; then
            echo "Creating GCP secret for '$key' with label 'dotenv=managed'..." >&2
            gcloud secrets create "$key" --project="$project_id" --data-file=- --replication-policy="automatic" --labels="dotenv=managed" >&2 <<< "$value"
        else
            # Secret exists, check value and labels
            current_value=$(gcloud secrets versions access latest --secret="$key" --project="$project_id")
            if [[ "$current_value" != "$value" ]]; then
                echo "Updating existing GCP secret for '$key'..." >&2
                gcloud secrets versions add "$key" --project="$project_id" --data-file=- >&2 <<< "$value"
            fi
            # Ensure the label is present
            current_label=$(gcloud secrets describe "$key" --project="$project_id" --format="value(labels.dotenv)")
            if [[ "$current_label" != "managed" ]]; then
                echo "Adding 'dotenv=managed' label to existing secret '$key'..." >&2
                gcloud secrets update "$key" --project="$project_id" --update-labels="dotenv=managed"
            fi
        fi
    else
        echo "(Dry Run) Would create or update GCP secret for '$key' with label 'dotenv=managed'." >&2
    fi
done < <(sed 's/\r$//' "$env_file" | grep -vE '^\s*(#|$)')

# Remove secrets from GCP that are not in the local file or allowlist
echo "Checking for stale Google Cloud secrets to remove..." >&2
for secret in "${remote_gcp_secrets[@]}"; do
    if ! containsElement "$secret" "${secret_keys[@]}" && ! containsElement "$secret" "${allow_unlisted_keys[@]}"; then
        if [ "$dry_run" = false ]; then
            echo "Removing stale GCP secret: $secret" >&2
            gcloud secrets delete "$secret" --project="$project_id" --quiet
        else
            echo "(Dry Run) Would remove stale GCP secret: $secret" >&2
        fi
    fi
done

# Grant access for all secrets that should exist (local + allowlist)
all_secrets_to_grant=("${secret_keys[@]}" "${allow_unlisted_keys[@]}")
# Remove duplicates
all_secrets_to_grant=($(printf "%s\n" "${all_secrets_to_grant[@]}" | sort -u))

if [ ${#all_secrets_to_grant[@]} -gt 0 ]; then
    IFS=','
    secrets_to_grant_str="${all_secrets_to_grant[*]}"
    unset IFS

    if [ "$dry_run" = false ]; then
        echo "Granting App Hosting backend access to secrets..." >&2
        firebase apphosting:secrets:grantaccess --project "$project_id" --backend "main" "$secrets_to_grant_str"
    else
        echo "(Dry Run) Would grant App Hosting access to: $secrets_to_grant_str" >&2
    fi
else
    echo "No secrets to grant access to." >&2
fi
echo "------------------------------------------------------------------" >&2

# --- Final Status ---
echo "" >&2
if [ "$dry_run" = true ]; then
    echo "Dry run complete. No secrets were changed." >&2
else
    echo "Secret synchronization complete." >&2
fi
