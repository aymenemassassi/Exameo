# Vocabulaire Exameo

> Glossaire transverse des termes que tu vas croiser dans Exameo et dans les cours. À garder ouvert dans un onglet pendant la lecture.

Convention : **Terme français** *(English term)* — définition simple, suivie d'un exemple concret tiré d'Exameo (quand c'est utile).

## Table des matières

- [Architecture & paradigmes](#architecture--paradigmes)
- [Conteneurs & infrastructure](#conteneurs--infrastructure)
- [Backend Java / Spring](#backend-java--spring)
- [Bases de données](#bases-de-donn%C3%A9es)
- [Sécurité & identité](#s%C3%A9curit%C3%A9--identit%C3%A9)
- [Web & frontend](#web--frontend)
- [Messaging & événementiel](#messaging--%C3%A9v%C3%A9nementiel)
- [Observabilité](#observabilit%C3%A9)
- [Build, dépendances, CI/CD](#build-d%C3%A9pendances-cicd)
- [Méthodes & qualité de code](#m%C3%A9thodes--qualit%C3%A9-de-code)

---

## Architecture & paradigmes

- **Microservice** *(microservice)* — Petite application autonome qui couvre **un seul domaine métier** (ex : `user-service` ne s'occupe que des profils utilisateurs). À l'opposé du **monolithe** où tout est dans une seule appli. Avantage : déploiement indépendant. Inconvénient : complexité réseau.

- **Monolithe** *(monolith)* — Une seule application qui contient toute la logique métier. C'est ce qu'était `GestionExam`. Plus simple à développer au début, plus dur à faire évoluer à grande échelle.

- **Polyglotte** *(polyglot)* — Architecture qui mélange plusieurs langages/frameworks selon le besoin (Exameo : Java pour le métier, Python pour l'IA, Node.js pour le temps réel, TypeScript pour le front).

- **API REST** *(REST API)* — Interface web où chaque ressource (un examen, un utilisateur) a une URL, et chaque action est un verbe HTTP (`GET`, `POST`, `PUT`, `DELETE`). Format de données : généralement JSON.

- **API Gateway** *(API gateway)* — Service qui sert de **porte d'entrée unique** à tous les microservices. Il route, sécurise, limite le trafic. Chez Exameo : `services/api-gateway/`.

- **BFF** *(Backend For Frontend)* — Couche serveur dédiée à un type de client (ex : un BFF pour le mobile, un autre pour le web). Évite que le frontend appelle 10 microservices directement.

- **DDD** *(Domain-Driven Design)* — Méthode de conception qui place le **vocabulaire métier** au centre du code. Tu vas voir des "entités", "agrégats", "value objects" qui parlent d'examens, de notes, de cohortes — pas de "User1Manager" ou "ExamHelper".

- **Architecture hexagonale** *(hexagonal architecture / ports & adapters)* — Pattern où la logique métier (le "noyau") est isolée des détails techniques (DB, HTTP, Kafka). Permet de remplacer Postgres par Mongo sans réécrire le métier.

## Conteneurs & infrastructure

- **Conteneur** *(container)* — Mini-environnement isolé qui contient une appli + ses dépendances (ex : un conteneur Postgres = Postgres + ses libs + sa conf). Plus léger qu'une VM, plus reproductible qu'une install.

- **Image** *(image)* — Le "modèle" figé d'un conteneur. Une image est immuable. Quand tu lances une image, tu obtiens un conteneur. Analogie : image = recette, conteneur = plat cuisiné.

- **Docker** — Le runtime de conteneurs le plus utilisé. Permet de construire, lancer, partager des images.

- **Docker Compose** — Outil pour orchestrer **plusieurs conteneurs** ensemble (Postgres + Keycloak + Kafka...) via un fichier YAML. Chez Exameo : `infra/docker-compose.yml`.

- **Volume** *(volume)* — Espace de stockage **persistant** monté dans un conteneur. Sans volume, les données sont perdues au redémarrage. Chez Exameo : `postgres-data` survit aux restarts.

- **Réseau Docker** *(Docker network)* — Réseau virtuel qui connecte les conteneurs entre eux. Chez Exameo : tous les services partagent le réseau `exameo`, ils s'appellent par leur nom (`http://keycloak:8080`).

- **Healthcheck** — Petite commande qui répond "je suis prêt / je suis cassé". Compose attend que les services dépendants soient "healthy" avant de démarrer les suivants.

- **Image registry** *(container registry)* — Dépôt d'images publiques ou privées. Le plus connu : Docker Hub. Quand tu écris `image: postgres:17`, Docker va la chercher là-bas.

## Backend Java / Spring

- **JVM** *(Java Virtual Machine)* — La machine virtuelle qui exécute le bytecode Java. Permet "write once, run anywhere".

- **JDK** *(Java Development Kit)* — Le kit complet pour développer et exécuter du Java (compilateur `javac` + JVM `java` + outils). Chez Exameo : Temurin 21 LTS.

- **Spring Boot** — Framework Java qui pré-configure tout (sécurité, web, DB) pour démarrer un service en quelques lignes. Chez Exameo : 3.4.

- **Bean** *(bean)* — Objet géré par Spring (créé, configuré, injecté automatiquement). Annoter une classe avec `@Component`, `@Service`, `@Repository` ou `@Configuration` la transforme en bean.

- **Injection de dépendances** *(dependency injection, DI)* — Mécanisme où Spring "injecte" les beans dont une classe a besoin, plutôt que la classe les crée elle-même. Permet de tester en isolant les composants.

- **Auto-configuration** *(auto-configuration)* — Magie de Spring Boot : détecte les libs présentes (ex : `spring-boot-starter-data-jpa`) et configure tout (DataSource, EntityManager, transactions) sans que tu écrives une ligne.

- **Starter** *(Spring Boot starter)* — Bundle de dépendances + auto-config pour un usage donné (ex : `spring-boot-starter-web` = Tomcat embarqué + Jackson + Spring MVC).

- **Application properties / YAML** — Fichier `application.yml` qui contient la config (URL DB, port, secrets...). Chez Exameo : `services/user-service/src/main/resources/application.yml`.

- **Profile** *(profile)* — Variante de configuration activable (ex : `dev`, `prod`). Spring choisit la conf à charger selon le profile actif.

- **Actuator** *(Spring Boot Actuator)* — Module qui expose des endpoints de monitoring (`/actuator/health`, `/actuator/metrics`) sans coder.

- **Resource Server** *(OAuth2 resource server)* — API qui valide les jetons JWT entrants (sans gérer le login lui-même, qui est délégué à Keycloak). Chez Exameo : `api-gateway` et tous les services Java.

## Bases de données

- **SGBDR** *(RDBMS, Relational Database Management System)* — Base de données relationnelle (tables, colonnes, contraintes). Postgres, MySQL, Oracle. Chez Exameo : PostgreSQL 17.

- **ORM** *(Object-Relational Mapping)* — Couche qui traduit les objets Java en lignes de tables et inversement. Chez Exameo : JPA/Hibernate (l'ORM le plus utilisé en Java).

- **JPA** *(Jakarta Persistence API)* — Standard Java pour l'ORM (annotations `@Entity`, `@Id`, `@Column`).

- **Hibernate** — L'implémentation la plus populaire de JPA.

- **Flyway** — Outil de **migrations versionnées** : tu écris des fichiers SQL numérotés (`V1__init.sql`, `V2__add_column.sql`), Flyway les applique dans l'ordre, garde une trace, garantit que toutes les bases (dev, test, prod) ont le même schéma.

- **Migration** *(migration)* — Un fichier SQL qui modifie le schéma de DB de manière contrôlée et versionnée (vs. modifier la DB à la main, qui est ingérable à plusieurs).

- **Transaction** *(transaction)* — Bloc d'opérations DB qui réussit en totalité ou échoue en totalité (jamais d'état intermédiaire). En Spring : annotation `@Transactional`.

- **DB-per-service** — Stratégie microservices où **chaque service possède sa propre base** (`users`, `exams`, `gradings`...). Aucun service ne lit la DB d'un autre, ils communiquent par API ou événements. Chez Exameo : voir `docs/adr/003-postgres-per-service.md`.

- **Cache** *(cache)* — Stockage temporaire ultra-rapide (souvent en RAM) pour éviter de recalculer / re-requêter. Chez Exameo : Valkey.

- **Valkey** — Fork open-source pur de Redis (créé en 2024 quand Redis a changé sa licence). Compatible Redis. Stocke clé-valeur en mémoire. Usages : cache, sessions, file d'attente, autosave.

## Sécurité & identité

- **IAM** *(Identity and Access Management)* — Système qui gère "qui tu es" (authentification) et "ce que tu as le droit de faire" (autorisation). Chez Exameo : Keycloak.

- **Keycloak** — Serveur d'IAM open-source (Red Hat). Gère utilisateurs, rôles, mots de passe, MFA, SSO, OIDC. Chez Exameo : `infra/keycloak/realms/exameo-realm.json`.

- **Realm** *(Keycloak realm)* — Espace logique isolé dans Keycloak (utilisateurs, rôles, clients propres). Chez Exameo : realm `exameo` (séparé du realm `master` pour l'admin).

- **OIDC** *(OpenID Connect)* — Protocole d'authentification standard qui repose sur OAuth 2.0. C'est ce qu'utilise "Sign in with Google" partout sur le web.

- **OAuth 2.0** — Protocole d'**autorisation** standard. OIDC ajoute la couche **identification** par dessus.

- **JWT** *(JSON Web Token)* — Jeton signé contenant les infos de l'utilisateur (id, rôles, expiration). Lisible mais infalsifiable (signature). Format : `header.payload.signature` en base64.

- **Access token** *(access token)* — Jeton court (15 min chez Exameo) qui prouve l'identité auprès des APIs.

- **Refresh token** *(refresh token)* — Jeton long (heures/jours) servant à obtenir un nouveau access token sans redemander le mot de passe.

- **PKCE** *(Proof Key for Code Exchange)* — Extension OIDC qui sécurise le flow d'auth pour les clients publics (navigateur, mobile). Chez Exameo : activé pour le client `web`.

- **RBAC** *(Role-Based Access Control)* — Modèle d'autorisation basé sur les rôles (étudiant, prof, admin). Chez Exameo : 4 rôles dans le realm.

- **MFA** *(Multi-Factor Authentication)* — Authentification à plusieurs facteurs (mot de passe + code TOTP). Configurable dans Keycloak.

- **TOTP** *(Time-based One-Time Password)* — Code à 6 chiffres généré par une app (Google Authenticator, FreeOTP) qui change toutes les 30s.

- **SSO** *(Single Sign-On)* — Une connexion = accès à plusieurs apps (Keycloak rend ça possible).

- **CSRF** *(Cross-Site Request Forgery)* — Attaque où un site malveillant fait exécuter une action non voulue par un utilisateur connecté ailleurs. Mitigée par tokens CSRF ou SameSite cookies.

- **CORS** *(Cross-Origin Resource Sharing)* — Politique navigateur qui contrôle quels sites peuvent appeler quelle API.

- **CSP** *(Content Security Policy)* — En-tête HTTP qui restreint les ressources que le navigateur peut charger (anti-XSS). Chez Exameo : configuré strict dans `web/next.config.mjs`.

- **PAT** *(Personal Access Token)* — Jeton GitHub utilisé en remplacement de mot de passe pour git/CLI. Préférer les **fine-grained** (scope minimal sur 1 repo).

## Web & frontend

- **HTTP** — Protocole de transport du web. Chez Exameo : tout passe en HTTPS en prod, HTTP en dev local.

- **REST** — Style d'API utilisant les verbes HTTP (`GET`/`POST`/`PUT`/`DELETE`) sur des ressources URL.

- **JSON** *(JavaScript Object Notation)* — Format de données léger, lisible, standard sur le web.

- **Next.js** — Framework React fullstack (rendu serveur, routing, API). Chez Exameo : version 15.

- **React** — Bibliothèque JavaScript pour construire des UI à base de composants.

- **App Router** *(Next.js App Router)* — Nouvelle façon de faire du routing dans Next.js (depuis v13), basée sur des conventions de dossiers (`app/page.tsx`, `app/me/page.tsx`).

- **RSC** *(React Server Components)* — Composants React qui s'exécutent **uniquement sur le serveur**, n'envoient au navigateur que du HTML rendu. Performance + SEO.

- **SSR** *(Server-Side Rendering)* — Rendu HTML côté serveur à chaque requête.

- **SSG** *(Static Site Generation)* — Pré-rendu HTML au moment du build, servi en statique (très rapide, mais contenu figé).

- **Hydration** *(hydration)* — Étape où le navigateur "réveille" le HTML rendu côté serveur en y greffant le JavaScript interactif.

- **Tailwind CSS** — Framework CSS basé sur des classes utilitaires (`flex`, `pt-4`, `text-blue-500`). Évite d'écrire du CSS sur mesure.

- **shadcn/ui** — Bibliothèque de composants React accessibles, copiables dans ton repo (pas une dépendance npm classique). Construits avec Tailwind + Radix UI.

- **TypeScript** — Sur-ensemble de JavaScript ajoutant un système de types. Détecte les erreurs avant l'exécution.

- **NextAuth (Auth.js)** — Bibliothèque NextJS qui gère le login/logout côté navigateur. Connecteurs prêts pour Keycloak, Google, GitHub...

## Messaging & événementiel

- **Broker** *(message broker)* — Serveur intermédiaire qui distribue les messages entre producteurs et consommateurs. Chez Exameo : Kafka.

- **Kafka** — Broker distribué très haute volumétrie. Pensé pour des flux d'événements (event streaming).

- **Topic** *(Kafka topic)* — Canal nommé où on publie/lit des messages (ex : `exam.submitted`, `user.created`).

- **Producteur** *(producer)* — Service qui publie des messages sur un topic.

- **Consommateur** *(consumer)* — Service qui lit les messages d'un topic.

- **Consumer group** *(Kafka consumer group)* — Groupe de consommateurs qui se partagent la lecture d'un topic. Permet le scaling horizontal.

- **KRaft** *(Kafka Raft)* — Mode Kafka 4.0+ qui élimine la dépendance à Zookeeper (l'ancien serveur de coordination). Plus simple à opérer.

- **Event-driven** *(event-driven architecture)* — Architecture où les services réagissent à des événements plutôt que de s'appeler directement. Découplage fort.

- **Pub/sub** *(publish/subscribe)* — Modèle où les producteurs publient sans connaître les consommateurs, et inversement. Kafka est un pub/sub.

- **At-least-once delivery** — Garantie qu'un message est livré au moins une fois (peut être livré plusieurs fois en cas de panne). Standard Kafka.

- **Idempotence** *(idempotency)* — Propriété : appeler une opération N fois donne le même résultat qu'une seule fois. Critique pour les consommateurs Kafka (vu que la livraison peut être doublée).

## Observabilité

- **Observabilité** *(observability)* — Capacité à comprendre l'état interne d'un système depuis ses sorties externes (logs, métriques, traces).

- **Les 3 piliers** — Metrics + Logs + Traces. Trois angles complémentaires pour observer un système.

- **Métrique** *(metric)* — Mesure numérique dans le temps (CPU, RAM, requêtes/sec, latence p95). Stockée dans une time-series DB.

- **Log** *(log)* — Message texte horodaté écrit par un service ("user 42 logged in", "DB connection failed").

- **Trace** *(distributed trace)* — Suivi d'une requête à travers plusieurs services. Permet de voir où le temps est passé.

- **Span** *(trace span)* — Une étape dans une trace (ex : "appel DB user-service" = 1 span). Une trace = un arbre de spans.

- **Prometheus** — Système de collecte de métriques par scraping HTTP. Standard de l'écosystème CNCF.

- **PromQL** — Langage de requêtes de Prometheus.

- **Grafana** — UI de dashboards branchée sur Prometheus, Loki, Tempo et 100+ autres sources.

- **Loki** — Système d'agrégation de logs (équivalent low-cost d'Elasticsearch). Indexe par labels, pas par contenu.

- **Tempo** — Backend de stockage de traces distribuées (créé par Grafana Labs).

- **OpenTelemetry** *(OTel)* — Standard CNCF d'instrumentation : un seul SDK pour metrics + logs + traces, vendor-neutral.

- **OTel Collector** — Agent qui reçoit la télémétrie OTel et la dispatche vers les backends (Prometheus, Loki, Tempo, Datadog...).

- **SLO** *(Service Level Objective)* — Objectif chiffré ("99.9% des requêtes doivent répondre en moins de 500 ms").

- **SLI** *(Service Level Indicator)* — Mesure utilisée pour évaluer un SLO.

## Build, dépendances, CI/CD

- **Gradle** — Build tool Java moderne (alternatif à Maven). Plus rapide grâce au build cache. Chez Exameo : configuration en Kotlin DSL.

- **Kotlin DSL** *(Gradle Kotlin DSL)* — Syntaxe Kotlin pour les fichiers Gradle (`build.gradle.kts`), avec auto-complétion IDE. Vs Groovy DSL legacy (`build.gradle`).

- **Multi-module** *(multi-module project)* — Projet Gradle avec plusieurs sous-projets (chez Exameo : `services/api-gateway`, `services/user-service`...). Partagent les dépendances et la config.

- **Dépendance** *(dependency)* — Bibliothèque externe utilisée par le projet (ex : `spring-boot-starter-web`).

- **Maven Central** — Dépôt de référence des libs Java open-source.

- **npm** *(Node Package Manager)* — Gestionnaire de paquets de Node.js. Utilisé pour le frontend Next.js.

- **package.json** — Fichier qui décrit un projet Node (nom, version, dépendances, scripts).

- **CI** *(Continuous Integration)* — Pratique consistant à tester automatiquement chaque commit (build + tests + lint).

- **CD** *(Continuous Deployment / Delivery)* — Déploiement automatique des changements après CI verte.

- **GitHub Actions** — CI/CD intégrée à GitHub. Définie en YAML dans `.github/workflows/`.

- **Workflow** *(GitHub Actions workflow)* — Fichier YAML qui décrit une série de jobs déclenchés par un événement (push, PR, cron).

- **Job** *(CI job)* — Unité d'exécution d'un workflow, lancée sur un runner (machine virtuelle).

- **Runner** *(GitHub runner)* — Machine qui exécute les jobs CI (hébergée par GitHub ou self-hosted).

- **Trivy** — Scanner de vulnérabilités open-source (Aqua Security). Analyse code, dépendances, images Docker.

- **Dependabot** — Bot GitHub qui ouvre automatiquement des PRs pour les mises à jour de dépendances.

- **Renovate** — Alternative à Dependabot, plus configurable.

- **CVE** *(Common Vulnerabilities and Exposures)* — Identifiant standard pour une vulnérabilité publique (ex : CVE-2025-12345).

## Méthodes & qualité de code

- **TDD** *(Test-Driven Development)* — Écrire le test avant le code de production.

- **Testcontainers** — Bibliothèque qui démarre des conteneurs Docker (Postgres, Kafka...) pendant les tests pour avoir un environnement réaliste. Chez Exameo : utilisé dans les tests d'intégration de `user-service`.

- **JUnit** — Framework de test standard en Java.

- **Mockito** — Bibliothèque de mocks Java (créer des faux objets pour isoler les tests).

- **Vitest** — Framework de test JS moderne (plus rapide que Jest), utilisé dans le frontend Next.js.

- **Playwright** — Outil de test end-to-end (E2E) qui pilote un vrai navigateur.

- **ADR** *(Architecture Decision Record)* — Document court qui acte une décision d'architecture importante (contexte, options, choix, conséquences). Chez Exameo : `docs/adr/`.

- **C4 model** — Convention de diagrammes d'architecture à 4 niveaux (Contexte, Conteneurs, Composants, Code). Chez Exameo : `docs/architecture.md`.

- **Conventional Commits** — Convention de format de message de commit (`feat:`, `fix:`, `docs:`, `chore:`). Permet de générer le changelog automatiquement.

- **Semantic Versioning** *(SemVer)* — Convention de numérotation `MAJOR.MINOR.PATCH` : MAJOR = breaking change, MINOR = feature, PATCH = bugfix.

- **OpenAPI** — Standard de description de contrats d'API REST (anciennement Swagger). Permet de générer client/server code.

- **OWASP** *(Open Web Application Security Project)* — Fondation qui publie les bonnes pratiques sécurité (Top 10 des vulnérabilités web).

- **WCAG** *(Web Content Accessibility Guidelines)* — Standard d'accessibilité web (Exameo cible le niveau AA 2.2).

- **i18n** *(internationalization)* — Préparer une app pour supporter plusieurs langues. Chez Exameo : FR/EN/AR.

- **a11y** *(accessibility)* — Accessibilité (le `11` représente les 11 lettres entre `a` et `y`).

---

## Tu as croisé un terme qui n'est pas ici ?

Crée une issue GitHub ou ajoute-le toi-même via une PR. Le glossaire grandit avec le projet.
