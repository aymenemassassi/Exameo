# ADR-004 : Valkey 8 plutôt que Redis 7

- **Date** : 2026-04-27
- **Statut** : Accepté

## Contexte

Besoin d'un store clé/valeur en mémoire pour :

- Cache HTTP (réponses idempotentes côté api-gateway / user-service)
- Sessions utilisateurs côté gateway
- Autosave des réponses lors du passage d'examen (TTL court, lecture/écriture haute fréquence)
- Pub/sub léger pour le proctoring (signaux temps réel)

## Décision

Utiliser **Valkey 8** plutôt que Redis 7.

**Pourquoi pas Redis ?** Depuis mars 2024, Redis a basculé sa licence de BSD vers SSPL/RSALv2, qui n'est plus considérée comme open-source par l'OSI. Le projet **Valkey**, hébergé par la Linux Foundation, est un fork direct de Redis 7.2 sous licence BSD-3-Clause, maintenu par AWS/Google/Oracle/Ericsson, et reste **API-compatible**. C'est aujourd'hui le successeur recommandé pour les nouveaux projets ouverts.

## Alternatives considérées

- **Redis 7.x sous SSPL** : techniquement excellent mais incompatible avec l'objectif "100 % open-source" du projet vitrine.
- **DragonflyDB** : très performant mais BSL (Business Source License), pas pleinement libre.
- **KeyDB** : multi-thread, mais moins activement maintenu, écosystème plus restreint.
- **Memcached** : trop limité (pas de pub/sub, pas de structures).

## Conséquences

### Positives

- Licence BSD-3-Clause claire, compatible portfolio public
- API Redis-compatible : tous les drivers existants (Lettuce, ioredis…) fonctionnent
- Communauté forte, support cloud croissant

### Négatives

- Écosystème "Valkey" encore jeune en 2026 (mais maturité confirmée par les versions 8.x)
- Image officielle moins ubiquitaire que `redis` sur Docker Hub → utilisation de `valkey/valkey:8`
