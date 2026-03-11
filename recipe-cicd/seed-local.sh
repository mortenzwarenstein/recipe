#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load POSTGRES_PASSWORD from .env if present
if [[ -f "$SCRIPT_DIR/.env" ]]; then
  export $(grep -v '^#' "$SCRIPT_DIR/.env" | xargs)
fi

PGPASSWORD="${POSTGRES_PASSWORD:-}" \
docker compose -f "$SCRIPT_DIR/compose.yml" exec -T postgres \
  psql -U recipe -d recipedb <<'SQL'

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM recipes LIMIT 1) THEN
    RAISE NOTICE 'recipes table already has data, skipping seed';
    RETURN;
  END IF;

  INSERT INTO recipes (name, book, page_number, created_by_username, created_at, pick_state) VALUES
    ('Spaghetti Bolognese',    'Jamie Oliver 5 Ingredients', 42,  'admin', NOW(), 0),
    ('Chicken Tikka Masala',   'Ottolenghi Simple',          88,  'admin', NOW(), 0),
    ('Caesar Salad',           NULL,                         NULL,'admin', NOW(), 0),
    ('Beef Tacos',             NULL,                         NULL,'admin', NOW(), 0),
    ('Vegetable Stir Fry',     'Plenty',                     134, 'admin', NOW(), 0),
    ('Margherita Pizza',       'The Silver Spoon',           210, 'admin', NOW(), 0),
    ('Lemon Risotto',          'Ottolenghi Simple',          62,  'admin', NOW(), 0),
    ('Thai Green Curry',       NULL,                         NULL,'admin', NOW(), 0),
    ('Greek Salad',            NULL,                         NULL,'admin', NOW(), 0),
    ('Mushroom Pasta',         'Jamie Oliver 5 Ingredients', 76,  'admin', NOW(), 0),
    ('Shakshuka',              'Jerusalem',                  48,  'admin', NOW(), 0),
    ('Fish and Chips',         'The Hairy Bikers',           96,  'admin', NOW(), 0),
    ('Ratatouille',            'French Country Cooking',     158, 'admin', NOW(), 0),
    ('Korean Bibimbap',        NULL,                         NULL,'admin', NOW(), 0),
    ('Lamb Kofta',             'Jerusalem',                  112, 'admin', NOW(), 0);

  RAISE NOTICE 'Seeded 15 example recipes';
END $$;
SQL
