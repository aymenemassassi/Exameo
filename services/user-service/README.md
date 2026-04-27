# user-service

> Spring Boot 3.4 / Java 21. Profils, cohortes, filières.

## Endpoints (Sprint 0)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | Bearer JWT | Retourne ou provisionne le profil local depuis le JWT Keycloak |
| GET | `/swagger-ui.html` | public | UI OpenAPI |
| GET | `/v3/api-docs` | public | spec OpenAPI 3.1 JSON |
| GET | `/actuator/health` | public | Health check |
| GET | `/actuator/prometheus` | privé | Metrics Prometheus |

## Lancer en local

```bash
# Pré-requis : infra/docker-compose.yml UP (Postgres + Keycloak)
cd ../..
./gradlew :services:user-service:bootRun
```

Le service crée la base via Flyway (`V1__init_schema.sql`) au premier démarrage.

## Tests

```bash
./gradlew :services:user-service:test
```

Le test d'intégration `UserProfileRepositoryIT` démarre un container Postgres 17 jetable via Testcontainers (Docker requis).

## Modèle

- `UserProfile` (JPA) indexé par `keycloak_id` (sub du JWT)
- `UserRole` : `STUDENT|TEACHER|PROCTOR|ADMIN`
- Provisionnement paresseux à la 1ère requête `/me`

## Décisions

- Hibernate `ddl-auto=validate` : seules les migrations Flyway créent le schéma
- Stateless : aucun cookie, RS256 JWT validé via JWKS Keycloak
- Mapping rôles JWT (`realm_access.roles`) → `ROLE_*` Spring Security
