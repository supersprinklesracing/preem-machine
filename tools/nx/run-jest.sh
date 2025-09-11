#!/bin/bash
# This script executes jest with all forwarded arguments,
# then pipes the output to sed to remove ANSI color codes.
set -eo pipefail
./tools/nx/nx "$@"
