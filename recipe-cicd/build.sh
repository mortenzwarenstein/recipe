#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$SCRIPT_DIR/.."
REGISTRY="ghcr.io/mortenzwarenstein"
SERVICES=("server" "client")

if [[ $# -gt 0 ]]; then
  SERVICES=("$@")
fi

build_and_push() {
  local service=$1
  local image="$REGISTRY/recipe-$service:latest"
  local context="$REPO_DIR/recipe-$service"

  echo "Building $image..."
  docker build --platform linux/amd64 -t "$image" "$context"

  echo "Pushing $image..."
  docker push "$image"

  echo "Done: $image"
}

for service in "${SERVICES[@]}"; do
  build_and_push "$service"
done
