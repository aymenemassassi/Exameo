# ADR-002 : Keycloak comme Identity Provider

- **Date** : 2026-04-27
- **Statut** : Accepté

## Contexte

Exameo doit gérer authentification et autorisation pour 4 rôles (étudiant, enseignant, surveillant, admin), avec :

- OIDC + PKCE pour le frontend SPA-RSC
- MFA TOTP obligatoire pour les enseignants/admins (F1)
- SSO optionnel Google/GitHub
- RBAC fine-grained mappable côté Spring Security
- Comptes seedés par script déterministe (démo recruteur)
- Self-hosting gratuit, pas de SaaS payant

## Décision

Utiliser **Keycloak 26** self-hosted, dans le `docker-compose.yml`, avec :

- Realm `exameo` provisionné via `infra/keycloak/realms/exameo-realm.json` (import au démarrage)
- 2 clients OIDC : `web` (confidentiel + PKCE) et `api-gateway` (bearer-only resource server)
- 4 rôles realm + 4 utilisateurs seed (`student`, `teacher`, `proctor`, `admin`)
- Backend Postgres pour la persistence des sessions Keycloak (DB dédiée `keycloak`)
- Tokens RS256, JWKS exposé sur `/realms/exameo/protocol/openid-connect/certs`

## Alternatives considérées

- **Auth0 / Cognito / Okta** : SaaS, prix, vendor lock-in. Hors cadre portfolio gratuit.
- **Authentik** : alternative open-source crédible mais écosystème Spring/Next moins documenté.
- **Spring Authorization Server "maison"** : faisable mais réinvente la roue (UI gestion utilisateurs, SSO, MFA…).

## Conséquences

### Positives

- IAM industriel (Linux Foundation), production-ready
- UI de gestion des utilisateurs prête à l'emploi (admin console)
- Spring Security `oauth2-resource-server` : intégration en quelques lignes
- NextAuth provider Keycloak natif

### Négatives

- Conteneur lourd (~500 Mo RAM en idle)
- Configuration via JSON parfois rigide (mais versionnable, donc reproductible)
- Mises à jour majeures parfois cassantes → pinning strict de la version
