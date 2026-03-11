CREATE TABLE meal_plan_entries
(
    id           bigserial PRIMARY KEY,
    recipe_id    bigint REFERENCES recipes (id),
    planned_date date NOT NULL,
    created_by   varchar(255),

    UNIQUE (planned_date)
)