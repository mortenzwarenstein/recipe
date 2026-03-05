#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/../.."

echo "Building recipe-server..."
docker build -t recipe-server:latest "$ROOT/recipe-server"

echo "Building recipe-client..."
docker build -t recipe-client:latest "$ROOT/recipe-client"

echo "Importing images into k3s..."
K3S_CONTAINER=$(docker compose --project-directory "$SCRIPT_DIR/.." ps -q k3s)

if [ -z "$K3S_CONTAINER" ]; then
  echo "k3s container is not running. Start it with: docker compose --profile k3s up -d k3s"
  exit 1
fi

docker save recipe-server:latest | docker exec -i "$K3S_CONTAINER" k3s ctr images import -
docker save recipe-client:latest | docker exec -i "$K3S_CONTAINER" k3s ctr images import -

echo "Done. Images are available in k3s."
