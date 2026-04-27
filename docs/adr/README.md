# Architecture Decision Records (ADR)

Toutes les décisions structurantes sur Exameo sont consignées ici, suivant le format MADR léger.

| # | Titre | Statut |
|---|---|---|
| [ADR-001](./001-polyglot-microservices.md) | Architecture polyglotte microservices | Accepté |
| [ADR-002](./002-keycloak-iam.md) | Keycloak comme IAM | Accepté |
| [ADR-003](./003-postgres-per-service.md) | Une base PostgreSQL par service | Accepté |
| [ADR-004](./004-valkey-vs-redis.md) | Valkey 8 plutôt que Redis 7 | Accepté |
| [ADR-005](./005-byok-llm.md) | LLM en mode BYOK (Bring Your Own Key) | Accepté |

## Format

Chaque ADR contient :

- **Contexte** : situation et forces qui poussent à la décision
- **Décision** : ce qui est tranché
- **Alternatives** : options envisagées et pourquoi rejetées
- **Conséquences** : effets attendus, dette potentielle
- **Statut** : Proposé / Accepté / Déprécié / Remplacé par
