# api-gateway

> Spring Cloud Gateway 3.4 - point d'entrée HTTP unique pour le frontend Exameo.

## Rôles

- Validation des access tokens OIDC (Keycloak)
- Token relay vers les microservices (`Authorization: Bearer ...` propagé)
- Routing par préfixe (`/api/users/**` → `user-service`, etc.)
- CORS, rate limiting (Resilience4j), retries idempotents
- Endpoints actuator/Prometheus + OpenTelemetry tracing

## Lancer en local

```bash
cd ../..
./gradlew :services:api-gateway:bootRun
```

Pré-requis : `infra/docker-compose.yml` lancé (Keycloak doit être joignable à `http://localhost:8081`).

## Routes (Sprint 0)

| Pattern | Cible | Strip prefix |
|---|---|---|
| `/api/me` | `user-service` | `/api` |
| `/api/users/**` | `user-service` | `/api` |
| `/api/exams/**` | `exam-service` | `/api` |
| `/api/grades/**` | `grading-service` | `/api` |
| `/api/notifications/**` | `notification-service` | `/api` |
| `/api/ai/**` | `ai-service` | `/api` |
| `/api/proctoring/**` | `proctoring-service` | `/api` |

## Tests

```bash
./gradlew :services:api-gateway:test
```
