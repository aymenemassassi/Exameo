# ADR-003 : Une base PostgreSQL par service

- **Date** : 2026-04-27
- **Statut** : Accepté

## Contexte

Architecture microservices (cf. ADR-001) → règle d'or : pas de couplage par la base. Mais :

- Démo locale doit rester légère (pas un cluster Postgres par service)
- Migrations doivent être versionnées et reproductibles
- Faible cardinalité d'équipe (1 dev) → pas besoin de bases physiques séparées en local

## Décision

**Une instance Postgres unique** en local (Docker Compose), mais **une base logique par service** :

| Service | Database |
|---|---|
| Keycloak | `keycloak` |
| user-service | `user_service` |
| exam-service | `exam_service` |
| grading-service | `grading_service` |
| notification-service | `notification_service` |

- Chaque service a son propre user Postgres (à venir Sprint 1) → isolation logique stricte
- Un service ne lit jamais les tables d'un autre service. Toute donnée partagée passe par API ou événement Kafka.
- Migrations gérées par **Flyway** dans `src/main/resources/db/migration` de chaque service.
- Provisioning des bases : `infra/postgres/init/01-create-databases.sh`, exécuté par l'image officielle Postgres au premier démarrage.

En production : facilement remplaçable par autant d'instances RDS/CloudSQL distinctes (pas de changement applicatif, juste config DSN).

## Alternatives considérées

- **Schémas Postgres au lieu de bases** : plus léger mais frontière de sécurité plus floue, et moins représentatif d'une vraie prod.
- **Bases séparées physiquement dès le local** : surcoût RAM (chaque Postgres ~50 Mo idle), bootstrap plus long, complexité Docker injustifiée.
- **MongoDB / NoSQL** : non adapté aux données fortement relationnelles d'Exameo (utilisateurs ↔ cours ↔ examens ↔ tentatives ↔ corrections).

## Conséquences

### Positives

- Démarrage local rapide (~10s pour Postgres seul)
- Migrations Flyway claires, par service
- Frontière de bounded context matérialisée

### Négatives

- Risque qu'un dev oublie la règle et fasse une jointure cross-DB → mitigation : revue stricte et lints custom (à mettre en place Sprint 2)
- En cas de scaling extrême, migration vers DB physiques séparées nécessaire (estimé acceptable, sans dette technique majeure)
