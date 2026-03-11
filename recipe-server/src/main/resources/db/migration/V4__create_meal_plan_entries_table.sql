CREATE TABLE meal_plan_entries
(
    id                      bigserial      PRIMARY KEY,
    recipe_id               bigint         REFERENCES recipes (id) ON DELETE RESTRICT NOT NULL,
    planned_date            date           NOT NULL,
    created_by_username     varchar        NOT NULL,

    UNIQUE (planned_date)
);

CREATE INDEX meal_plan_entries_recipe_id_idx ON meal_plan_entries (recipe_id);