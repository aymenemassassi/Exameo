# ADR-001 : Architecture polyglotte microservices

- **Date** : 2026-04-27
- **Statut** : Accepté
- **Décideurs** : Aymene Massassi (tech lead)

## Contexte

Exameo refond une application Java EE legacy (`GestionExam`) en plateforme moderne. Trois forces sont en jeu :

1. **Vitrine technique** : le repo doit démontrer la maîtrise de plusieurs stacks 2025-2026 (Java moderne, frontend RSC, IA, realtime).
2. **Charge fonctionnelle** : le domaine couvre IAM, banque de questions, passage temps réel, correction, IA, anti-triche, analytics.
3. **Évolutivité** : les composants ont des SLA et des trajectoires d'évolution différents (le moteur de passage doit absorber des pics, la correction batch peut être asynchrone, l'IA est intermittente).

## Décision

Architecture **polyglotte microservices** structurée par bounded contexts :

- **api-gateway** : Spring Cloud Gateway (BFF, OIDC, routing, rate limit, CORS)
- **user-service / exam-service / grading-service / notification-service** : Spring Boot 3.4 sur Java 21 (Virtual Threads), JPA, Flyway, Testcontainers
- **ai-service** : Python 3.12 + FastAPI + LangChain + Pydantic v2 (génération QCM, scoring sémantique)
- **proctoring-service** : Node 22 + Fastify + Socket.IO (telemetrie webcam temps réel)
- **web** : Next.js 15 App Router (RSC) + TypeScript strict + Tailwind + shadcn/ui

Communication : HTTP/JSON synchrones via api-gateway, événements asynchrones via **Apache Kafka** (KRaft).

## Alternatives considérées

- **Monolithe Spring Boot** : plus simple à opérer, mais non démonstratif des compétences microservices et impossible de mélanger Python (IA) et Node (Socket.IO) proprement.
- **Modular Monolith Java pur** : pertinent en équipe réduite mais rate la dimension polyglotte ciblée, et la stack IA reste mal servie (Java peu pertinent pour LangChain).
- **Serverless (AWS Lambda / GCP Cloud Run)** : non retenu : surcoût opérationnel pour un portfolio local, vendor lock-in, démarrages à froid pénalisants pour le passage examen.

## Conséquences

### Positives

- Démonstration multi-langages (Java/TS/Python/Node) crédible
- Scaling indépendant par domaine
- IA et realtime servis par les langages adaptés (Python/Node)
- Pipelines CI matrix par stack (cf. ADR à venir)

### Négatives / dette acceptée

- Complexité opérationnelle locale (~10 conteneurs Docker)
- Boilerplate inter-services (auth, observabilité, contrats OpenAPI)
- Tests d'intégration de bout en bout plus coûteux

Mitigations :

- Convention forte par service (squelette identique : `api/`, `domain/`, `infrastructure/`, `config/`)
- OpenAPI 3.1 généré pour chaque service Spring (springdoc) → contrats lisibles
- Observabilité unifiée OpenTelemetry → un seul Grafana suffit à tout investiguer
