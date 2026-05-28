#!/bin/bash
# Reusable script to clean up remote branches.
# Deletes remote branches that are not 'main' and NOT associated with an open PR.

set -e

# Fetch latest and prune remote-tracking branches
git fetch --prune

# 1. Clean up REMOTE branches
# Get all remote branches except main
REMOTE_BRANCHES=$(git branch -r | grep -v 'origin/main' | grep -v 'origin/HEAD' | sed 's/origin\///' | xargs)

if [ -n "$REMOTE_BRANCHES" ]; then
  # Get head branches of all open PRs
  PR_BRANCHES=$(gh pr list --state open --json headRefName --jq '.[].headRefName' | xargs)

  # Filter branches to delete
  TO_DELETE_REMOTE=""
  for branch in $REMOTE_BRANCHES; do
    is_pr=false
    for pr_branch in $PR_BRANCHES; do
      if [ "$branch" == "$pr_branch" ]; then
        is_pr=true
        break
      fi
    done
    if [ "$is_pr" = false ]; then
      TO_DELETE_REMOTE="$TO_DELETE_REMOTE $branch"
    fi
  done

  if [ -n "$TO_DELETE_REMOTE" ]; then
    echo "Deleting remote branches: $TO_DELETE_REMOTE"
    # Use --no-verify to bypass hooks that might trigger builds on deletion
    echo "$TO_DELETE_REMOTE" | xargs git push origin --delete --no-verify
  else
    echo "No remote branches to delete (all branches have open PRs)."
  fi
else
  echo "No remote branches found (besides main)."
fi

# Helper to parse ISO 8601 date to Unix timestamp (handles Linux/GNU and macOS/BSD)
parse_date_to_ts() {
  local dt=$1
  if [[ "$OSTYPE" == "darwin"* ]]; then
    date -j -f "%Y-%m-%dT%H:%M:%SZ" "$dt" "+%s" 2>/dev/null || echo ""
  else
    date -d "$dt" +%s 2>/dev/null || echo ""
  fi
}

# 2. Clean up LOCAL branches
echo "Checking local branches..."
CURRENT_BRANCH=$(git branch --show-current)

# Pre-fetch PR status for local branches to avoid N network calls
# We fetch the last 1000 PRs and filter for merged/closed as a reasonable heuristic for stale branches.
PR_MAP_FILE=$(mktemp)
gh pr list --state all --limit 1000 --json headRefName,state,closedAt --jq '.[] | select(.state == "MERGED" or .state == "CLOSED") | .headRefName + " " + .state + "|" + .closedAt' > "$PR_MAP_FILE"

TO_DELETE_LOCAL=""
# Get all local branches except main, using while read to handle spaces safely
git branch --format='%(refname:short)' | grep -v '^main$' | while read -r branch; do
  if [ "$branch" == "$CURRENT_BRANCH" ]; then
    continue
  fi

  # 1. Check if it's merged into main (handles non-squash merges)
  if git branch --merged main | grep -q "^[ *]*$branch$"; then
    echo "$branch" >> "$PR_MAP_FILE.delete"
    continue
  fi

  # 2. Check if the upstream is gone (indicates remote branch was deleted)
  if git branch -vv | grep "^[ *]*$branch " | grep -q ": gone]"; then
    echo "$branch" >> "$PR_MAP_FILE.delete"
    continue
  fi

  # 3. Check if there's a merged or closed PR for this branch in our pre-fetched map
  # This handles squash merges where the remote branch is already gone but was not tracked.
  # SAFETY: Check dates to avoid deleting reused branch names with new work.
  PR_ENTRY=$(grep "^$branch " "$PR_MAP_FILE" | head -n 1 || true)
  
  if [ -n "$PR_ENTRY" ]; then
    PR_INFO=$(echo "$PR_ENTRY" | cut -d' ' -f2)
    PR_STATE=$(echo "$PR_INFO" | cut -d'|' -f1)
    PR_CLOSED_AT=$(echo "$PR_INFO" | cut -d'|' -f2)

    if [ "$PR_STATE" == "MERGED" ] || [ "$PR_STATE" == "CLOSED" ]; then
      # Check timestamps
      LOCAL_COMMIT_TS=$(git show -s --format=%ct "$branch")
      PR_CLOSED_TS=$(parse_date_to_ts "$PR_CLOSED_AT")

      if [ -z "$PR_CLOSED_TS" ]; then
        echo "Warning: Could not parse PR date for $branch. Skipping deletion to be safe."
        continue
      fi

      if [ "$LOCAL_COMMIT_TS" -gt "$PR_CLOSED_TS" ]; then
        echo "Skipping $branch: Branch has commits newer than the associated PR ($PR_STATE at $PR_CLOSED_AT)."
        continue
      fi

      echo "$branch" >> "$PR_MAP_FILE.delete"
      continue
    fi
  fi
done

if [ -f "$PR_MAP_FILE.delete" ]; then
  TO_DELETE_LOCAL=$(cat "$PR_MAP_FILE.delete" | xargs)
  echo "Deleting local branches: $TO_DELETE_LOCAL"
  # Use -D to force delete since squash-merged branches might not be seen as 'merged' by git
  cat "$PR_MAP_FILE.delete" | xargs git branch -D
else
  echo "No local branches to delete."
fi

rm -f "$PR_MAP_FILE" "$PR_MAP_FILE.delete"
