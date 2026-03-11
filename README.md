# Recipe

A personal cookbook app. Track your recipe collection, plan meals for the week, and let the bowl pick what you cook next.

## Stack

| Layer | Tech |
|---|---|
| Backend | Spring Boot 4 · Kotlin · PostgreSQL · Flyway |
| Frontend | Angular 21 · Tailwind CSS v4 |
| Auth | Keycloak 26 (PKCE) |
| Infra | Kubernetes · SOPS/age · GitHub Actions |
| Observability | Prometheus · Grafana |

## Local development

**Prerequisites:** Docker, Java 24, Node 22

```bash
# Start PostgreSQL + Keycloak
cd recipe-cicd
docker compose up -d

# Backend (localhost:8080)
cd recipe-server
./gradlew bootRun

# Frontend (localhost:4200)
cd recipe-client
npm install
npm start
```

Default Keycloak admin: `admin` / `admin` (change on first login).
Default app user: configured in Keycloak admin at `localhost:8180`.

### Monitoring (optional)

```bash
cd recipe-cicd
docker compose --profile monitoring up -d
# Prometheus → localhost:9090
# Grafana    → localhost:3000  (admin / admin)
```

## Running tests

```bash
# Backend
cd recipe-server && ./gradlew test

# Frontend
cd recipe-client && npm test
```

## Deployment

Images are built and pushed to GHCR, then deployed to Kubernetes via Kustomize.

```bash
cd recipe-cicd

# Build & push all images (server, client, keycloak)
bash build.sh

# Deploy to production
KUBECONFIG=~/Downloads/config-k8gdc.yml bash k8s/apply.sh prod
```

Secrets are encrypted with [SOPS](https://github.com/getsops/sops) + age.
The age key lives at `~/.config/sops/age/keys.txt` (not in this repo).

## Environment variables

| Variable | Used by | Description |
|---|---|---|
| `SPOONACULAR_API_KEY` | recipe-server | Calorie lookup via Spoonacular |
| `ANTHROPIC_API_KEY` | recipe-server | Dutch→English recipe name translation |
| `KEYCLOAK_ADMIN_PASSWORD` | recipe-cicd | Keycloak admin password |
| `POSTGRES_PASSWORD` | recipe-cicd | Database password |
