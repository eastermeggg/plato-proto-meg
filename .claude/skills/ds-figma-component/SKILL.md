---
name: ds-figma-component
description: Crée un composant custom du design system à partir d'un nœud Figma précis (URL avec node-id) — contexte visuel via le MCP Figma, valeurs mappées sur les tokens les plus proches, variants cva, trois livrables (démo, index, fiche) et référence Figma datée. À utiliser quand ds-decide a conclu "créer" et qu'une maquette du composant existe, ou quand un utilisateur dit "implémente ce composant depuis Figma", "crée le composant de ce nœud", "build this Figma component in code". Jamais sur un fichier entier — un nœud précis. Si le besoin est un écran complet, c'est ds-figma-screen ; si le composant existe et qu'il manque une déclinaison, c'est ds-variant.
compatibility: Nécessite ds.manifest.json à la racine du projet et le script ds:doctor. La skill officielle shadcn/skills est recommandée si disponible — sinon la mécanique CLI est couverte par CLAUDE.md.
---

# ds-figma-component — un custom depuis un nœud, pas depuis un fichier

> **Conventions communes** — chemins, `ds.manifest.json`, `SIGNALEMENTS.md` / `ECARTS.md`, commandes (`<pm>`), `ds:doctor`, mode Figma : lire `_shared/conventions.md` avant d'agir. Si `shadcn/skills` est installée, elle porte la mécanique CLI ; sinon voir `CLAUDE.md` et le §7 des conventions.

Le Figma fournit ici sa seule contribution légitime côté composants : le
contexte visuel d'un custom qui n'existe pas encore
(`docs/figma-reference.md`). Le travail est une **traduction** vers le DS,
pas une transcription de la maquette.


## Mode Figma — vérifier avant tout

Lire `figma.mode` dans `ds.manifest.json` :

| Mode | Cette skill |
|---|---|
| `none` | **Refuse de tourner.** Répondre : le projet est code-first sans Figma ; la demande passe par `ds-explore` / `ds-build`. |
| `intent` | Tourne normalement : le Figma est une intention datée, le code reste la vérité. |
| `mirror` | **Non disponible dans ce set** (à l'étude, set v2) — traiter comme `intent`. |

## Pré-requis — dans cet ordre

1. **`ds-decide` a conclu « créer ».** Sinon, y passer d'abord : le biais
par défaut est contre la création, et la moitié des « customs » demandés
sont des compositions ou des variants.
2. **Une URL Figma avec `?node-id=` précis.** Un fichier ou une page entière
n'est pas un contexte, c'est du bruit — demander le nœud exact.
3. Si les skills officielles Figma sont installées : charger
`figma-design-to-code` avant `get_design_context`.

## Étape 1 — lire le contexte Figma, trois appels max

- `get_screenshot` du nœud : l'intention visuelle.
- `get_design_context` du nœud : structure, valeurs, hiérarchie.
- `get_variable_defs` du nœud : les Variables réellement câblées — elles
disent quels tokens le design **voulait** utiliser, ce qui vaut mieux que
deviner depuis des hex.

## Étape 2 — traduire en DS, pas transcrire

- **Chaque valeur passe par la question : quel token existant est le plus
proche ?** Le token gagne, toujours. Un padding de 13px hors échelle →
le token le plus proche, et l'écart noté au livrable.
- **Une valeur sans token plausible = un besoin de token** →
`SIGNALEMENTS.md`, s'arrêter sur ce point. Jamais de `bg-[#...]` « pour
être fidèle » : une valeur arbitraire est un échec, pas une fidélité.
- **Composer des primitives `ui/` partout où c'est possible.** La
justification d'existence du custom va en commentaire d'en-tête (exigence
de `CLAUDE.md`) : aucun composant ni composition shadcn ne couvrait le
besoin.
- **Variants Figma → variants cva** du même nom si le rôle est identique.
Les états que la maquette statique ne montre pas (hover, focus, disabled,
loading, error) se livrent quand même — un état absent du Figma n'est pas
un état optionnel.
- **Portabilité** : React + Tailwind + Radix pur, zéro import `next/*`,
liens et images par props. `"use client"` seulement si état, handler ou
primitive Radix interactive.

## Étape 3 — les trois livrables, sans exception

1. La démo dans `src/app/design-system/demos/` (tous variants, tous états)
+ l'entrée dans `demos/index.ts`. Jamais `page.tsx`.
2. La fiche `docs/components/<nom>.md` (+ index) : rôle, quand
l'utiliser/éviter, props, exemple minimal — et la section :

```markdown
## Référence Figma
Nœud : https://www.figma.com/design/[fileKey]/[nom]?node-id=[id]
Relevé le : [date du jour] · État : conforme
```

Toujours datée, toujours avec un statut, jamais bloquante
(`docs/figma-reference.md` §4).
3. Optionnel, si l'équipe utilise Code Connect : mapper le nœud vers
`src/components/custom/<Nom>.tsx` (`add_code_connect_map`).

## Étape 4 — vérifier

`<pm> run ds:doctor && <pm> lint && <pm> build`, puis le rendu de
`/design-system` **à côté** du screenshot Figma : on cherche la même
intention, pas le même pixel. Un écart visible entre la maquette et le rendu
se **liste** dans le message final (et `SIGNALEMENTS.md` s'il est bloquant)
— il ne se corrige ni côté code ni côté Figma de sa propre initiative.

## Interdits

- Créer sans passer par `ds-decide`.
- `get_design_context` sur un fichier ou une page entière.
- Reproduire une valeur hors échelle « pour être fidèle ».
- Éditer `ui/`, `globals.css`, `ds-theme.json`.
- Livrer sans les trois livrables — un composant sans fiche est invisible
pour la prochaine décision, c'est ainsi que naissent les doublons.
