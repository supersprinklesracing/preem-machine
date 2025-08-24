#!/bin/bash

# A reusable script to push secrets from a specified .env file to GitHub and Google Cloud,
# and optionally remove secrets that are not present in the file.

set -eo pipefail

# --- Usage function ---
usage() {
    echo "This script pushes variables from a .env file to GitHub Actions and Google Secret Manager."
    echo "It can also remove remote secrets that are not present in the local file."
    echo ""
    echo "Usage: $0 -f <file> -p <project-id> [-e <environment>] [-a <keys>] [--force-gcp-secrets] [--dry-run]"
    echo ""
    echo "Options:"
    echo "  -f, --file                 (Required) The path to the .env file containing the secrets."
    echo "  -p, --project              (Required) The Google Cloud Project ID."
    echo "  -e, --environment          (Optional) The name of the GitHub Actions environment. If omitted, secrets are set at the repository level."
    echo "  -a, --allow-unlisted-keys  (Optional) Comma-separated list of secret keys to NOT remove, even if they are not in the .env file."
    echo "      --force-gcp-secrets    (Optional) Force a new secret version to be written in GCP, even if the value is unchanged."
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
force_gcp_secrets=false
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
        --force-gcp-secrets) {
            force_gcp_secrets=true
            shift
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

# --- Populate secret keys from file ---
# This loop runs first to build a complete list of keys for deletion checks.
while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip commented out or empty lines
    [[ "$line" =~ ^\s*(#|$) ]] && continue
    key="${line%%=*}"
    secret_keys+=("$key")
done < <(sed 's/\r$//' "$env_file")


# --- GitHub Section ---
echo "" >&2
echo "--- GitHub: Syncing secrets... ---" >&2

# Prepare conditional arguments for GitHub CLI commands
declare -a gh_env_args=()
if [ -n "${environment_name}" ]; then
    gh_env_args=("--env" "$environment_name")
fi

# Get the list of existing GitHub secrets
mapfile -t remote_gh_secrets < <(gh secret list "${gh_env_args[@]}" --json name -q '.[].name')

# Remove secrets from GitHub that are not in the local file or allowlist
for secret in "${remote_gh_secrets[@]}"; do
    # Only remove stale secrets that are all upper-case
    if [[ "$secret" =~ ^[A-Z0-9_]+$ ]] && ! containsElement "$secret" "${secret_keys[@]}" && ! containsElement "$secret" "${allow_unlisted_keys[@]}"; then
        if [ "$dry_run" = false ]; then
            echo "Removing stale, upper-case GitHub secret: $secret" >&2
            gh secret delete "$secret" "${gh_env_args[@]}"
        else
            echo "(Dry Run) Would remove stale, upper-case GitHub secret: $secret" >&2
        fi
    fi
done


# --- Google Cloud Section ---
echo "" >&2
echo "--- Google Cloud: Syncing secrets... ---" >&2

# Get the list of existing GCP secrets managed by this script
mapfile -t remote_gcp_secrets < <(gcloud secrets list --project="$project_id" --filter="labels.dotenv=managed" --format="value(name)")

# Remove secrets from GCP that are not in the local file or allowlist
for secret in "${remote_gcp_secrets[@]}"; do
    # Only remove stale secrets that are all upper-case
    if [[ "$secret" =~ ^[A-Z0-9_]+$ ]] && ! containsElement "$secret" "${secret_keys[@]}" && ! containsElement "$secret" "${allow_unlisted_keys[@]}"; then
        if [ "$dry_run" = false ]; then
            echo "Removing stale, upper-case GCP secret: $secret" >&2
            gcloud secrets delete "$secret" --project="$project_id" --quiet
        else
            echo "(Dry Run) Would remove stale, upper-case GCP secret: $secret" >&2
        fi
    fi
done

# --- Create and Update Secrets Section ---
echo "" >&2
echo "--- Setting secrets on GitHub and Google Cloud... ---" >&2
# This single loop processes each secret for both services.
while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip commented out or empty lines
    [[ "$line" =~ ^\s*(#|$) ]] && continue

    key="${line%%=*}"
    value="${line#*=}"

    # --- Process value for both services ---
    # Trim leading and trailing whitespace
    processed_value="${value#"${value%%[![:space:]]*}"}"
    processed_value="${processed_value%"${processed_value##*[![:space:]]}"}"
    # Remove enclosing quotes
    if [[ "$processed_value" == \"*\" || "$processed_value" == \'*\' ]]; then
        processed_value="${processed_value:1:-1}"
    fi

    # --- Set GitHub Secret ---
    if [ "$dry_run" = false ]; then
        printf "%s" "$processed_value" | gh secret set "$key" --body - "${gh_env_args[@]}"
    else
        echo "(Dry Run) Would set GitHub secret for '$key'." >&2
    fi

    # --- Set Google Cloud Secret ---
    if [ "$dry_run" = false ]; then
        if ! gcloud secrets describe "$key" --project="$project_id" &>/dev/null; then
            echo "Creating GCP secret for '$key' with label 'dotenv=managed'..." >&2
            printf "%s" "$processed_value" | gcloud secrets create "$key" --project="$project_id" --data-file=- --replication-policy="automatic" --labels="dotenv=managed" >&2
        else
            # Secret exists, check value and labels
            current_value=$(gcloud secrets versions access latest --secret="$key" --project="$project_id")
            if [[ "$force_gcp_secrets" = true || "$current_value" != "$processed_value" ]]; then
                echo "Updating existing GCP secret for '$key'..." >&2
                printf "%s" "$processed_value" | gcloud secrets versions add "$key" --project="$project_id" --data-file=- >&2
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
done < <(sed 's/\r$//' "$env_file")


# --- Grant Access & Output YAML ---
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
        firebase apphosting:secrets:grantaccess --project "$project_id" --backend "main" "$secrets_to_grant_str" || echo "Warning: Failed to grant access to some secrets. This can happen if secrets were recently deleted or permissions are insufficient. Continuing..." >&2
    else
        echo "(Dry Run) Would grant App Hosting access to: $secrets_to_grant_str" >&2
    fi
else
    echo "No secrets to grant access to." >&2
fi

# --- YAML Configuration Snippets ---
echo ""
echo "--- GitHub Actions YAML (ci.yaml) ---"
echo "------------------------------------------------------------------"
echo "    secrets:"
for key in "${all_secrets_to_grant[@]}"; do
    echo "      $key: \${{ secrets.$key }}"
done
echo "------------------------------------------------------------------"

echo ""
echo "--- Google App Hosting YAML (apphosting.yaml) ---"
echo "------------------------------------------------------------------"
echo "secrets:"
for key in "${all_secrets_to_grant[@]}"; do
    echo "  - variable: $key"
    echo "    secret: $key"
done
echo "------------------------------------------------------------------"


# --- Final Status ---
echo "" >&2
if [ "$dry_run" = true ]; then
    echo "Dry run complete. No secrets were changed." >&2
else
    echo "Secret synchronization complete." >&2
fi
