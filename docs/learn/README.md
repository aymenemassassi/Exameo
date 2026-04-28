# Apprendre Exameo

> Cours-tutoriels complets pour apprendre la stack Exameo en partant de zéro, écrits pour quelqu'un qui découvre les technologies (Spring Boot moderne, Docker, Keycloak, Next.js 15, Kafka, observabilité OpenTelemetry...).

Ce dossier est ton **livre de cours personnel** versionné dans Git. Il accompagne le projet Exameo et te permet de **comprendre ce qui a été construit** au lieu de juste l'utiliser.

## Comment lire ce dossier ?

Trois portes d'entrée selon ton besoin :

| Tu veux... | Lis... |
|---|---|
| Comprendre le dispositif, la pédagogie, les conventions | [HOW-TO-USE.md](./HOW-TO-USE.md) |
| Un terme défini rapidement (acronyme, jargon) | [00-vocabulaire.md](./00-vocabulaire.md) |
| Apprendre une techno **déjà en place** dans Exameo | Cours numérotés `01-` à `10-` (voir progression ci-dessous) |
| Suivre le développement **session par session** d'une nouvelle feature | [sessions/README.md](./sessions/README.md) |

## Carte de progression — Cours rétroactifs

Les 10 cours rétroactifs couvrent l'existant d'Exameo, dans un ordre conçu pour bâtir tes connaissances brique par brique.

> Coche les cases au fur et à mesure. C'est ton tableau de bord d'apprentissage.

| # | Cours | Statut | Pré-requis |
|---|---|---|---|
| 01 | [Docker & Docker Compose](./01-docker.md) | À écrire | Aucun |
| 02 | [Spring Boot 3 moderne (vs Java EE)](./02-spring-boot.md) | À écrire | Notions Java |
| 03 | [PostgreSQL + Flyway (migrations versionnées)](./03-postgres-flyway.md) | À écrire | 02 |
| 04 | [Keycloak + OIDC + JWT](./04-keycloak-oidc.md) | À écrire | 01 |
| 05 | [API Gateway + Spring Security Resource Server](./05-spring-security-resource-server.md) | À écrire | 02, 04 |
| 06 | [Next.js 15 App Router + RSC](./06-nextjs-app-router.md) | À écrire | Notions JS/HTML |
| 07 | [NextAuth + Keycloak côté front](./07-nextauth-keycloak.md) | À écrire | 04, 06 |
| 08 | [Apache Kafka (concepts producteur/consommateur)](./08-kafka.md) | À écrire | 01 |
| 09 | [Observabilité OTel/Prometheus/Grafana/Loki/Tempo](./09-observabilite-otel.md) | À écrire | 01 |
| 10 | [Gradle Kotlin DSL multi-module](./10-gradle-multimodule.md) | À écrire | 02 |

**Progression : 0 / 10**

Chaque cours est conçu pour une session de **30 à 60 minutes** : lecture + mini-exercice sur la branche `learn/sandbox`. Tu peux les enchaîner ou en faire un par jour, l'important c'est de cocher.

## Sessions de développement guidé

À partir de `exam-service` (Sprint 1), chaque feature est développée en mode **cours + code** : un mini-cours pré-lecture, j'implémente en commentant, tu reproduis sur sandbox, je rédige un rapport.

Voir la timeline : [sessions/README.md](./sessions/README.md).

## Conventions

- **Langue** : français, avec les **termes techniques en anglais entre parenthèses** la première fois (ex : "instance immuable (immutable instance)") pour faciliter la transition vers la doc officielle.
- **Style** : tutoriel from-zero, on suppose que tu n'as jamais vu la techno.
- **Code** : tous les extraits viennent du **vrai code Exameo**, annotés ligne par ligne.
- **Exercices** : à faire sur la branche Git `learn/sandbox` pour ne jamais casser `main`.
- **Mises à jour** : si une techno évolue (ex: Spring Boot 3.4 → 3.5), le cours est mis à jour, l'historique reste dans Git.

## Pourquoi ce dossier existe ?

Exameo n'est pas qu'un projet livrable : c'est aussi une **vitrine pédagogique**. Un recruteur, un collègue ou toi-même dans 6 mois doit pouvoir comprendre **pourquoi** chaque choix a été fait, pas seulement **lire le code**. Ce dossier répond à ce besoin.

C'est aussi un **artefact de portfolio** : la capacité à expliquer simplement ce qu'on a construit est l'une des compétences les plus valorisées en entretien technique.

## Pour aller plus loin

- [`docs/adr/`](../adr/) : décisions d'architecture (pourquoi Valkey plutôt que Redis, pourquoi Keycloak, etc.) — complémentaire des cours
- [`docs/architecture.md`](../architecture.md) : diagrammes C4 (contexte, conteneurs, composants) — vue d'ensemble
- [`README.md`](../../README.md) : démarrage rapide du projet
