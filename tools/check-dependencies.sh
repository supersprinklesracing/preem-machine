#!/bin/bash
set -e

# This script performs critical workspace health checks:
# 1. Workspace Mandate: Ensure sub-modules don't have their own dependencies.
# 2. Lockfile Sync: Ensure pnpm-lock.yaml matches package.json.
# 3. Tree Integrity: Ensure no logical errors (missing/invalid) in the tree.

echo "Running workspace health checks..."

# --- 1. Workspace Dependency Mandate ---
echo "Checking workspace dependency mandate..."
violations=0
# Find all package.json files excluding the root one and those in dist/ or node_modules/
files=$(find "apps" "libs" -name "package.json" -not -path "*/dist/*" -not -path "*/node_modules/*")
for file in $files; do
  # Check for dependencies that are NOT workspace-local (@members/*).
  # We allow workspace-local dependencies to facilitate Nx dependency detection
  # and deployment platform requirements (like Firebase App Hosting).
  offending_deps=$(jq -r '(.dependencies // {}) + (.devDependencies // {}) | keys[] | select(startswith("@members/") | not)' "$file")

  if [ -n "$offending_deps" ]; then
    echo "VIOLATION: $file contains external dependencies:"
    echo "$offending_deps" | sed 's/^/  - /'
    violations=$((violations + 1))
  fi
done

if [ $violations -gt 0 ]; then
  echo "❌ Error: Found $violations violation(s). All dependencies must be managed in the root package.json."
  exit 1
fi
echo "✅ Workspace mandate respected."


# --- 2. Lockfile Synchronization ---
echo "Verifying pnpm-lock.yaml synchronization..."
if ! command -v pnpm &> /dev/null; then
    echo "Error: pnpm command not found."
    exit 1
fi

# Run pnpm install with frozen-lockfile to check for mismatches
if ! CI_OUTPUT=$(pnpm install --frozen-lockfile --lockfile-only --ignore-scripts 2>&1); then
    echo "❌ Error: pnpm-lock.yaml is out of sync with package.json or invalid."
    echo "This will cause Cloud Build deployments to fail."
    echo ""
    echo "pnpm output:"
    echo "$CI_OUTPUT" | sed 's/^/  /'
    echo ""
    echo "Please run the following command to fix it:"
    echo "  pnpm install"
    echo ""
    echo "Then commit the changes to pnpm-lock.yaml."
    exit 1
fi
echo "✅ pnpm-lock.yaml is in sync."


# --- 3. Dependency Tree Integrity ---
echo "Verifying dependency tree integrity..."
# Unset NPM_CONFIG_REGISTRY to avoid 403 errors with private registries
unset NPM_CONFIG_REGISTRY

# Check for problems using pnpm ls.
# We focus on "invalid" (version mismatches) and "missing" dependencies.
# Depth 10 should be enough to catch most nested issues.
LS_OUTPUT=$(pnpm ls --depth=10 2>&1) || true
CRITICAL_ISSUES=$(echo "$LS_OUTPUT" | grep -E "invalid:|missing:" || true)

if [ -n "$CRITICAL_ISSUES" ]; then
    echo "❌ Error: Logical issues found in dependency tree:"
    echo "$CRITICAL_ISSUES" | sed 's/^/  /'
    echo ""
    echo "This indicates a version mismatch or missing dependency that could"
    echo "cause Cloud Build failures or runtime errors."
    echo ""
    echo "Common fixes:"
    echo "1. Align root package.json versions with framework requirements."
    echo "2. Use targeted 'overrides' in package.json for transitive dependencies."
    echo "3. Run 'pnpm install' and 'pnpm dedupe' to resolve conflicts."
    exit 1
fi

echo "✅ Dependency tree is healthy."

echo ""
echo "✨ All workspace health checks passed!"
