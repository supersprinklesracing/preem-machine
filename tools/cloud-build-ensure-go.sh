#!/bin/bash
set -e

# Target Go version
GO_VERSION="1.25.0"
GO_DIR="node_modules/.go"
export GOPATH="$PWD/$GO_DIR/path"
export GOCACHE="$PWD/$GO_DIR/cache"
export GOFLAGS="-modcacherw"

# Check if go is already installed and matches the version
if command -v go >/dev/null 2>&1; then
  CURRENT_VERSION=$(go version | awk '{print $3}')
  if [ "$CURRENT_VERSION" = "go$GO_VERSION" ]; then
    echo "Go $GO_VERSION is already installed."
    return 0 2>/dev/null || exit 0
  fi
fi

# Check if we already downloaded it locally and it matches the version
if [ -x "$GO_DIR/go/bin/go" ]; then
    LOCAL_VERSION=$("$GO_DIR/go/bin/go" version | awk '{print $3}')
    if [ "$LOCAL_VERSION" = "go$GO_VERSION" ]; then
        echo "Go $GO_VERSION found in $GO_DIR."
        export PATH="$PWD/$GO_DIR/go/bin:$PATH"
        return 0 2>/dev/null || exit 0
    fi
    echo "Local Go version $LOCAL_VERSION does not match $GO_VERSION. Re-installing..."
    chmod -R +w "$GO_DIR/go" 2>/dev/null || true
    rm -rf "$GO_DIR/go"
fi

# Only install if running in a CI/Cloud Build environment
if [ -z "$CLOUD_BUILD" ]; then
    echo "Go not found and not in Cloud Build. Skipping auto-install."
    return 0 2>/dev/null || exit 0
fi

echo "Installing Go $GO_VERSION..."
mkdir -p "$GO_DIR"
# Ensure existing files are writable before we try to modify/delete them
if [ -d "$GO_DIR" ]; then
    chmod -R +w "$GO_DIR" 2>/dev/null || true
fi
curl --show-error --silent \
    -L "https://go.dev/dl/go$GO_VERSION.linux-amd64.tar.gz" \
  | tar -C "$GO_DIR" -xz

export PATH="$PWD/$GO_DIR/go/bin:$PATH"
echo "Go $GO_VERSION installed. PATH updated."
go version
