# web

> Next.js 15 (App Router, RSC) + TypeScript strict + Tailwind + NextAuth Keycloak.

## Lancer en local

```bash
cp .env.example .env.local
npm install
npm run dev
```

Pré-requis : `infra/docker-compose.yml` UP (Keycloak doit être joignable à `http://localhost:8081`).

## Pages

| Path | Description |
|---|---|
| `/` | Page d'accueil, présentation produit |
| `/login` | Page de login (bouton Keycloak) |
| `/me` | Profil utilisateur authentifié, fetch `GET /api/me` via api-gateway |

## Auth

- NextAuth v5 (beta) avec provider Keycloak (OIDC code + PKCE)
- Refresh token automatique 30s avant expiration
- Session JWT côté frontend, access token relayé en `Authorization: Bearer ...` aux APIs

## Tests

```bash
npm run lint        # ESLint Next
npm run type-check  # tsc --noEmit
npm run test        # Vitest unitaires
npm run test:e2e    # Playwright (à venir)
```
