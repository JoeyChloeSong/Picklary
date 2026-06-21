#!/usr/bin/env sh
cd "$(dirname "$0")" || exit 1
node build.js || exit 1
node start-local.js
