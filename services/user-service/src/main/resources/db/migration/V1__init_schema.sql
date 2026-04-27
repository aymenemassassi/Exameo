-- =============================================================================
-- user-service - V1 : profil utilisateur, miroir local des comptes Keycloak
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS user_profiles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_id     VARCHAR(64)  NOT NULL UNIQUE,
    username        VARCHAR(128) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    first_name      VARCHAR(128),
    last_name       VARCHAR(128),
    primary_role    VARCHAR(32)  NOT NULL CHECK (primary_role IN ('STUDENT','TEACHER','PROCTOR','ADMIN')),
    locale          VARCHAR(8)   NOT NULL DEFAULT 'fr',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles (email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role  ON user_profiles (primary_role);
