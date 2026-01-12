#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This script must run on macOS." >&2
  exit 1
fi

if ! command -v rustup >/dev/null 2>&1; then
  echo "rustup is required. Install Rust first." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Install Node.js first." >&2
  exit 1
fi

rustup target add aarch64-apple-darwin x86_64-apple-darwin

npm run tauri build -- --target universal-apple-darwin --bundles dmg

echo "DMG output: src-tauri/target/universal-apple-darwin/release/bundle/dmg/"
