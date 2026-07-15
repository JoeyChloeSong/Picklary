#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js was not found. Install Node.js LTS and run this file again."
  exit 1
fi
node build.js
OPEN_PATH=/clip-lite/ node start-local.js
