ALTER TABLE recipes
    ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE;

-- pick_state ordinal: 0=PICKED, 1=NOT_PICKED, 2=CURRENT
CREATE UNIQUE INDEX idx_recipes_one_current ON recipes (pick_state) WHERE pick_state = 2;

CREATE INDEX idx_recipes_pick_state ON recipes (pick_state);
CREATE INDEX idx_recipes_created_by_username ON recipes (created_by_username);
CREATE INDEX idx_recipes_created_at ON recipes (created_at DESC);
