---
name: ds-figma-screen
description: Implémente un écran ou une page à partir d'une frame Figma en utilisant UNIQUEMENT le design system du repo — la maquette donne l'intention et la structure, l'inventaire et les tokens donnent le rendu. À utiliser dès qu'un utilisateur partage une URL Figma avec "fais cet écran", "implémente cette maquette", "code this Figma screen", "design to code", "intègre cette page". Traduit la frame en rôles, mappe sur l'inventaire, délègue la construction à ds-build et liste les écarts Figma/DS au lieu de les corriger. Le pixel-perfect n'est pas l'objectif — la conformité se juge contre le DS et le kitchen-sink, jamais contre la maquette. Pour un composant isolé plutôt qu'un écran, c'est ds-figma-component.
compatibility: Nécessite ds.manifest.json à la racine du projet et le script ds:doctor. La skill officielle shadcn/skills est recommandée si disponible — sinon la mécanique CLI est couverte par CLAUDE.md.
---

# ds-figma-screen — la maquette donne l'intention, le DS donne le rendu

> **Conventions communes** — chemins, `ds.manifest.json`, `SIGNALEMENTS.md` / `ECARTS.md`, commandes (`<pm>`), `ds:doctor`, mode Figma : lire `_shared/conventions.md` avant d'agir. Si `shadcn/skills` est installée, elle porte la mécanique CLI ; sinon voir `CLAUDE.md` et le §7 des conventions.

Cette skill est le mode d'entrée Figma de `ds-build` : elle traduit la frame
en matière exploitable (rôles, données, actions), puis `ds-build` fait ce
qu'il fait toujours. Un écran conforme au DS mais différent du Figma est
**conforme** — la question « faut-il faire évoluer le DS ou la maquette ? »
appartient à `ds-promote`, pas à cette skill.

## Mode Figma — vérifier avant tout

Lire `figma.mode` dans `ds.manifest.json` :

| Mode | Cette skill |
|---|---|
| `none` | **Refuse de tourner.** Répondre : le projet est code-first sans Figma ; la demande passe par `ds-explore` / `ds-build`. |
| `intent` | Tourne normalement : le Figma est une intention datée, le code reste la vérité. |
| `mirror` | **Non disponible dans ce set** (à l'étude, set v2) — traiter comme `intent`. |

## Pré-requis

- Une URL Figma avec le `?node-id=` de la frame. Pas de fichier entier.
- Si les skills officielles Figma sont installées : charger
`figma-design-to-code` avant `get_design_context`.
- Les fichiers du DS lisibles (`CLAUDE.md`, `demos/index.ts`,
`docs/design-system.md`, fiches) — mêmes défauts de chemins que `ds-build`
(`ds.manifest.json` s'il existe).

## Étape 1 — lire la frame

- `get_screenshot` : la vue d'ensemble, l'intention.
- `get_metadata` : l'arborescence — zones, node-ids. C'est la carte, pas le
territoire.
- `get_design_context` sur la frame, ou par grande zone si elle est dense.

Si la frame instancie des composants de librairie Figma nommés (Button,
Table, Badge…), les noter : ce sont des **indices de mapping** vers
l'inventaire, pas des ordres de construction.

## Étape 2 — zones → rôles

Traduire chaque zone en **rôle** (qui, fait quoi, pourquoi), pas en
apparence — c'est la table de l'étape 1 de `ds-build` :

| # | Rôle | Contenu | Importance |
|---|---|---|---|
| 1 | Titre + action principale | … | primaire |
| 2 | Filtres | … | secondaire |

Le piège que cette étape empêche : partir du Figma pixel par pixel et
reconstruire des composants qui existent déjà dans l'inventaire.

Extraire aussi ce que la maquette ne dit pas : données affichées et leur
absence possible, action principale (une seule), contraintes. Ce qui manque
est une question posée à l'utilisateur ou une hypothèse **écrite**, jamais
une invention silencieuse.

## Étape 3 — dérouler ds-build

Invoquer `ds-build` avec la table des rôles et le screenshot comme
intention : inventaire → mapping (`ds-decide` sur tout ce qui ne mappe pas)
→ composition → **cinq états** → vérification. La maquette n'en montre en
général qu'un (l'idéal) : livrer vide, chargement, erreur et partiel quand
même.

## Étape 4 — le relevé d'écarts Figma

En plus du relevé de composition de `ds-build`, une section dédiée :

```
### Écarts maquette ↔ rendu (assumés)
| Zone | Figma | Rendu DS | Raison |
|---|---|---|---|
| En-tête | padding 13px | p-3 (12px) | valeur hors échelle → token le plus proche |
| CTA | vert #00a37b | bg-brand-full | approximation Figma du token |
| Carte | ombre custom | shadow-md | pas d'effet équivalent dans le thème |
```

Ces écarts ne sont ni des bugs ni des trahisons : c'est la doctrine
(`docs/figma-reference.md`). Si un écart révèle un manque réel du DS
(composant, variant, token), il passe par `SIGNALEMENTS.md` / `ds-decide` —
pas par un contournement local.

## Interdits

- Le pixel-perfect : une valeur arbitraire est un échec de `ds:doctor`
déguisé en fidélité.
- Reconstruire un composant de l'inventaire parce que « le Figma le dessine
autrement » — l'écart se signale, le composant existant s'utilise.
- Modifier des tokens, `ui/` ou le Figma pour faire coller maquette et rendu.
- Juger la conformité finale contre la maquette : c'est `/design-system` et
`ds-review` qui tranchent.
