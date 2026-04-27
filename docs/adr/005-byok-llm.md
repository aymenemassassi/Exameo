# ADR-005 : BYOK pour les fonctionnalités LLM

- **Date** : 2026-04-27
- **Statut** : Accepté

## Contexte

Le `ai-service` propose deux fonctionnalités basées sur LLM :

1. **Génération automatique de questions** à partir d'un sujet / d'un texte source
2. **Scoring sémantique** des réponses libres

Contraintes :

- Le projet est une vitrine publique sur GitHub. Aucun secret ne doit être committé.
- Aucun budget cloud n'est garanti pour faire tourner la démo en continu.
- Un recruteur ou un contributeur doit pouvoir cloner et lancer le projet sans payer un sou.

## Décision

**Stratégie BYOK (Bring Your Own Key)** :

- Par défaut, le `ai-service` utilise **Ollama local** (modèles `llama3.1:8b-instruct` ou `mistral:7b-instruct`) via une URL configurable dans `.env` (`OLLAMA_BASE_URL`, `OLLAMA_MODEL`).
- Optionnellement, l'utilisateur peut fournir une clé API d'un provider externe (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `MISTRAL_API_KEY`, etc.) via son `.env` local.
- Variable `LLM_PROVIDER` ∈ `{ollama, openai, anthropic, mistral, ...}` pilote le provider à charger côté LangChain.
- **Aucune clé n'est jamais committée.** Le `.env.example` ne contient que des placeholders. Le `.gitignore` inclut `*.env*` sauf `.env.example`.

## Alternatives considérées

- **OpenAI uniquement** : nécessite une clé pour faire tourner le projet → contraire à l'objectif d'accessibilité.
- **Hugging Face Transformers en local pur Python** : coût mémoire (>4 Go) et démarrage plus lent qu'Ollama. Possible en alternative future.
- **Modèles auto-hébergés sur GPU** : hors cadre portfolio (pas de GPU garanti chez l'utilisateur).

## Conséquences

### Positives

- Le projet reste lançable gratuitement, à condition d'avoir Ollama installé localement (gratuit, multiplateforme)
- Démontre la maîtrise d'une abstraction LangChain multi-providers
- Aucune fuite de clé possible dans le repo public

### Négatives

- Ollama nécessite ~6 à 8 Go de RAM dédiés pour un modèle 7B → documenter le pré-requis dans le README
- Qualité des réponses inférieure aux modèles propriétaires haut de gamme → expliciter la mention "qualité dépendante du modèle choisi" dans la doc utilisateur
