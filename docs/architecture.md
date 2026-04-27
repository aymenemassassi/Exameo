# Architecture Exameo

> Vue d'ensemble C4 (contexte, conteneurs, composants) de la plateforme Exameo.
> Diagrammes en Mermaid pour rendu natif sur GitHub.

## Sommaire

1. [Niveau 1 — Contexte système](#niveau-1--contexte-systeme)
2. [Niveau 2 — Conteneurs](#niveau-2--conteneurs)
3. [Niveau 3 — Composants `exam-service`](#niveau-3--composants-exam-service)
4. [Flux clés](#flux-cles)
5. [Choix structurants](#choix-structurants)

---

## Niveau 1 — Contexte système

```mermaid
graph TB
  student[Étudiant<br/>navigateur web]
  teacher[Enseignant<br/>conçoit examens]
  proctor[Surveillant<br/>monitore passages]
  admin[Administrateur<br/>gère organisation]

  exameo[(Exameo<br/>Plateforme de gestion d'examens)]

  llm[Provider LLM<br/>Ollama local ou cloud BYOK]
  smtp[SMTP<br/>MailHog en dev / SES prod]
  oauth[OAuth providers<br/>Google, GitHub]

  student -->|Passe des examens<br/>HTTPS| exameo
  teacher -->|Conçoit, corrige<br/>HTTPS| exameo
  proctor -->|Surveille realtime<br/>WebSocket| exameo
  admin -->|Configure<br/>HTTPS| exameo

  exameo -->|Génération QCM,<br/>scoring sémantique| llm
  exameo -->|Notifications email| smtp
  exameo -->|SSO optionnel| oauth

  classDef person fill:#357bff,stroke:#1a47b8,color:#fff
  classDef system fill:#1c3573,stroke:#0a1530,color:#fff
  classDef external fill:#888,stroke:#444,color:#fff
  class student,teacher,proctor,admin person
  class exameo system
  class llm,smtp,oauth external
```

**Acteurs** :

- **Étudiant** : crée un compte, s'inscrit à un cours, passe les examens dans une fenêtre temporelle, consulte ses résultats.
- **Enseignant** : crée des cours, conçoit des examens (QCM, vrai/faux, ouvert), corrige les réponses libres, publie des résultats.
- **Surveillant** : suit en temps réel les passages, reçoit des alertes anti-triche, valide les anomalies.
- **Administrateur** : gère utilisateurs, rôles, organisations, audit log, paramètres globaux.

---

## Niveau 2 — Conteneurs

```mermaid
graph TB
  user((Utilisateur<br/>web))

  subgraph frontend [Frontend]
    web[web<br/>Next.js 15 RSC<br/>Port 3000]
  end

  subgraph identity [Identité]
    keycloak[Keycloak 26<br/>OIDC + RBAC<br/>Port 8081]
  end

  subgraph backend [Backend Spring Boot 3.4]
    gateway[api-gateway<br/>Spring Cloud Gateway<br/>Port 8080]
    userSvc[user-service<br/>Profils & rôles<br/>Port 8082]
    examSvc[exam-service<br/>Cours, examens, passage<br/>Port 8083]
    gradingSvc[grading-service<br/>Correction batch<br/>Port 8084]
    notifSvc[notification-service<br/>Emails, in-app<br/>Port 8085]
  end

  subgraph polyglot [Services polyglottes]
    aiSvc[ai-service<br/>FastAPI Python 3.12<br/>Port 8086]
    proctorSvc[proctoring-service<br/>Node Fastify + Socket.IO<br/>Port 8087]
  end

  subgraph data [Stockages]
    pg[(PostgreSQL 17<br/>Port 5432)]
    valkey[(Valkey 8<br/>Port 6379)]
    minio[(MinIO S3<br/>Port 9000)]
  end

  subgraph messaging [Messaging]
    kafka{{Apache Kafka<br/>Port 9092}}
  end

  subgraph observability [Observabilité]
    otel[OTel Collector]
    prom[Prometheus]
    loki[Loki]
    tempo[Tempo]
    grafana[Grafana 11<br/>Port 3001]
  end

  user --> web
  web -->|OIDC PKCE| keycloak
  web -->|REST + JWT| gateway

  gateway -->|JWT validation| keycloak
  gateway --> userSvc
  gateway --> examSvc
  gateway --> aiSvc
  gateway -->|WebSocket upgrade| proctorSvc
  gateway --> notifSvc

  userSvc --> pg
  examSvc --> pg
  examSvc --> valkey
  examSvc --> minio
  gradingSvc --> pg
  notifSvc --> pg

  examSvc -->|Events| kafka
  gradingSvc -->|Events| kafka
  notifSvc -->|Events| kafka
  aiSvc -->|Events| kafka

  examSvc -.->|OTLP| otel
  userSvc -.->|OTLP| otel
  gradingSvc -.->|OTLP| otel
  aiSvc -.->|OTLP| otel
  proctorSvc -.->|OTLP| otel
  gateway -.->|OTLP| otel
  otel --> prom
  otel --> loki
  otel --> tempo
  prom --> grafana
  loki --> grafana
  tempo --> grafana

  classDef java fill:#5a9fff,stroke:#1a47b8,color:#000
  classDef poly fill:#22c55e,stroke:#15803d,color:#000
  classDef data fill:#a855f7,stroke:#6b21a8,color:#fff
  classDef obs fill:#f97316,stroke:#9a3412,color:#fff
  classDef ident fill:#ef4444,stroke:#7f1d1d,color:#fff
  class gateway,userSvc,examSvc,gradingSvc,notifSvc java
  class aiSvc,proctorSvc,web poly
  class pg,valkey,minio data
  class otel,prom,loki,tempo,grafana obs
  class keycloak ident
```

**Conteneurs Spring Boot 3.4 / Java 21** : `api-gateway`, `user-service`, `exam-service`, `grading-service`, `notification-service`. Tous exposent `actuator/prometheus` et `actuator/health`. Auth via `oauth2-resource-server` + JWT JWKS.

**Conteneurs polyglottes** : `web` (Next.js 15 RSC), `ai-service` (FastAPI / LangChain), `proctoring-service` (Fastify / Socket.IO).

**Stockages** :

- **Postgres 17** : 1 base par service (cf. ADR-003).
- **Valkey 8** : cache HTTP, sessions, autosave examen, pub/sub léger (cf. ADR-004).
- **MinIO** : assets uploadés (sujets PDF, captures webcam de proctoring, exports CSV).

**Bus d'événements** : Kafka KRaft. Topics typés (`exam.attempt.started`, `exam.attempt.submitted`, `grading.completed`, `notification.email.requested`).

**Observabilité** : tous les services exportent traces/metrics/logs via OTLP au Collector. Stockage Prom + Loki + Tempo. Visualisation Grafana 11.

---

## Niveau 3 — Composants `exam-service`

`exam-service` est le cœur métier (planning, passage, autosave, soumission). Sprint 1+ — esquisse :

```mermaid
graph TB
  subgraph examService [exam-service]
    subgraph api [api/]
      coursesApi[CoursesController<br/>/api/courses]
      examsApi[ExamsController<br/>/api/exams]
      attemptsApi[AttemptsController<br/>/api/attempts]
      questionsApi[QuestionsController<br/>/api/questions]
    end

    subgraph application [application/]
      examPlanner[ExamPlannerService<br/>plage horaire, contraintes]
      attemptOrchestrator[AttemptOrchestrator<br/>start/submit/timeout]
      autosaveSvc[AutosaveService<br/>écrit Valkey toutes les 10s]
      antiCheatPub[AntiCheatPublisher<br/>publie Kafka events]
    end

    subgraph domain [domain/]
      courseModel[Course]
      examModel[Exam]
      questionModel[Question]
      attemptModel[Attempt]
      answerModel[Answer]
    end

    subgraph infra [infrastructure/]
      jpaRepo[JPA Repositories<br/>Postgres]
      valkeyClient[Valkey Client<br/>Lettuce]
      minioClient[MinIO Client]
      kafkaProducer[Kafka Producer]
    end
  end

  client((web / gateway))
  pg[(Postgres<br/>exam_service)]
  valkey[(Valkey<br/>autosave)]
  kafka{{Kafka}}

  client --> coursesApi
  client --> examsApi
  client --> attemptsApi
  client --> questionsApi

  coursesApi --> examPlanner
  examsApi --> examPlanner
  attemptsApi --> attemptOrchestrator
  questionsApi --> attemptOrchestrator

  attemptOrchestrator --> autosaveSvc
  attemptOrchestrator --> antiCheatPub
  examPlanner --> jpaRepo
  attemptOrchestrator --> jpaRepo
  autosaveSvc --> valkeyClient
  antiCheatPub --> kafkaProducer

  jpaRepo --> pg
  valkeyClient --> valkey
  kafkaProducer --> kafka
```

---

## Flux clés

### Démarrage d'un passage d'examen (Sprint 1)

```mermaid
sequenceDiagram
  participant U as Étudiant
  participant W as web (Next.js)
  participant K as Keycloak
  participant G as api-gateway
  participant E as exam-service
  participant V as Valkey
  participant Kf as Kafka

  U->>W: Clique "Démarrer l'examen"
  W->>K: OIDC tokens valides ?
  K-->>W: Oui (JWT en cookie)
  W->>G: POST /api/attempts {examId}
  G->>K: Valide JWT (JWKS)
  K-->>G: OK + claims
  G->>E: POST /api/attempts {examId, sub, roles}
  E->>E: Vérifie fenêtre, retries, anti-triche pré-conditions
  E->>V: SET attempt:{id} {snapshot}
  E->>Kf: PUBLISH exam.attempt.started
  E-->>G: 201 Created + attemptId + signedToken
  G-->>W: 201 + token
  W-->>U: Redirige vers /exam/run/{attemptId}
```

### Autosave + soumission

```mermaid
sequenceDiagram
  participant U as Étudiant
  participant W as web
  participant G as api-gateway
  participant E as exam-service
  participant V as Valkey
  participant P as Postgres

  loop toutes les 10s
    W->>G: PUT /api/attempts/{id}/answers (delta)
    G->>E: forward + JWT
    E->>V: SET answers:{id} {payload} EX 7200
  end

  U->>W: Clique "Soumettre"
  W->>G: POST /api/attempts/{id}/submit
  G->>E: forward
  E->>V: GET answers:{id}
  E->>P: persist Attempt + Answers (TX)
  E->>V: DEL answers:{id}
  E-->>G: 200 OK
  G-->>W: 200 OK
  W-->>U: Page "Soumis avec succès"
```

---

## Choix structurants

Voir aussi les ADR :

- [ADR-001](./adr/001-polyglot-microservices.md) : Architecture polyglotte microservices
- [ADR-002](./adr/002-keycloak-iam.md) : Keycloak IAM
- [ADR-003](./adr/003-postgres-per-service.md) : Une DB Postgres par service
- [ADR-004](./adr/004-valkey-vs-redis.md) : Valkey 8 plutôt que Redis 7
- [ADR-005](./adr/005-byok-llm.md) : LLM en mode BYOK

### Sécurité (résumé)

- TLS partout en prod (HSTS), HTTP local en dev uniquement
- JWT RS256, JWKS rotation Keycloak
- CSP stricte côté web (cf. `next.config.mjs`)
- RFC 9457 ProblemDetail pour toutes les erreurs API
- Audit log : événements Kafka `audit.*` consommés et stockés (Sprint 2+)
- Secrets : jamais committés, `.env.example` placeholders, vault local possible (Sprint 3)

### Performance (cibles)

| Métrique | Cible |
|---|---|
| TTFB page `/me` (web) | < 200 ms |
| `GET /api/me` p95 | < 80 ms |
| `POST /api/attempts` p95 | < 250 ms |
| Autosave p99 | < 50 ms (Valkey) |
| Concurrent attempts soutenus | 500 sur poste local |

Mesures à instrumenter via OpenTelemetry et Grafana dashboards Sprint 1+.

### Évolutions prévues

- **Sprint 1** : `exam-service` complet, web `/exams`, `/exam/run`
- **Sprint 2** : `grading-service`, `ai-service` génération QCM
- **Sprint 3** : `proctoring-service` realtime, anti-triche scoring
- **Sprint 4** : analytics + RGPD export, déploiement Kubernetes minikube
