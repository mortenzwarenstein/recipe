CREATE TABLE recipes (
    id                  BIGSERIAL    PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    book                VARCHAR(255) NOT NULL,
    page_number         INT          NOT NULL,
    created_by_username VARCHAR(50)  NOT NULL,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
