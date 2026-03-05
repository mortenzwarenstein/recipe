#!/usr/bin/env bash
set -euo pipefail

OVERLAY=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SECRETS_DIR="$SCRIPT_DIR/overlays/$OVERLAY/secrets"

export SOPS_AGE_KEY_FILE="${SOPS_AGE_KEY_FILE:-$HOME/.config/sops/age/keys.txt}"
export KUBECONFIG="${KUBECONFIG:-$SCRIPT_DIR/../kubeconfig/kubeconfig.yaml}"

echo "Decrypting secrets..."
sops -d "$SECRETS_DIR/postgres.enc.env" > "$SECRETS_DIR/postgres.env"
sops -d "$SECRETS_DIR/keycloak.enc.env" > "$SECRETS_DIR/keycloak.env"

trap 'echo "Cleaning up..."; rm -f "$SECRETS_DIR/postgres.env" "$SECRETS_DIR/keycloak.env"' EXIT

echo "Applying overlay: $OVERLAY"
kustomize build --load-restrictor LoadRestrictionsNone "$SCRIPT_DIR/overlays/$OVERLAY" \
  | kubectl apply -f -

echo "Restarting deployments..."
kubectl rollout restart deployment/recipe-server deployment/recipe-client -n recipe
kubectl rollout status deployment/recipe-server deployment/recipe-client -n recipe --timeout=120s

echo "Done."
