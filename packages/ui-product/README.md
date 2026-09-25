# @plato/ui-product

Le **design system produit** de Plato : la source de vérité (tokens + composants
canoniques) que consomment l'app **et** `@plato/ui-marketing`.

## Statut : package logique (pas encore de split physique)

Le repo est encore **mono-package** (règle `AGENTS.md` 8). Ce dossier **déclare** la
frontière et la surface publique (`index.js` ré-exporte depuis `src/`), sans déplacer
les fichiers. Le split physique (workspaces npm) s'active quand `ui-product` est clean :

- `npm run ds:doctor` à 0 constat bloquant
- `SIGNALEMENTS.md` vidé (`ds-audit --harvest`)
- inventaire stable (plus de primitives `pending` non promues)

## La règle qui rend l'archi saine

**Dépendance à sens unique.** `ui-product` ne dépend d'aucune extension et n'importe
**jamais** `@plato/ui-marketing`. Le marketing hérite du produit, jamais l'inverse.
Gardé par `ds-check-boundaries` (conventions §4). Ce qu'une extension invente et qui
mérite d'entrer au DS remonte via `ds-promote`, pas par un import inverse.

## Surface publique (échantillon)

- **Tokens** : `colors`, `shadows`, `typography` (theme-aware, `var()`).
- **Composants** : `Button`, `PageHeader`, `AppSidebar`, `AssistantComposer`,
  `SuggestionPill`, `ConversationsIndexPage`… (à compléter à l'activation).

La liste canonique fait foi dans `src/data/designSystemInventory.json`.
