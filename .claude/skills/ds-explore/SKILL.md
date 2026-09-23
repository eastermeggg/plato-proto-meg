---
name: ds-explore
description: Propose 2 à 3 alternatives UX/UI réellement différentes pour un même besoin, toutes constructibles avec le design system existant, avec leurs compromis et leur coût pour le DS. À utiliser dès qu'un utilisateur demande "des alternatives", "d'autres options", "explore des pistes", "propose-moi plusieurs versions", "comment on pourrait présenter…", "show me options", ou quand une spec est ouverte sur la forme (le quoi est clair, le comment ne l'est pas). Diverge sur la structure, jamais sur le style — le style est fixé par le DS. Produit des wireframes ASCII comparables, pas des mockups.
compatibility: Nécessite ds.manifest.json à la racine du projet et le script ds:doctor. La skill officielle shadcn/skills est recommandée si disponible — sinon la mécanique CLI est couverte par CLAUDE.md.
---

# ds-explore — des alternatives qui divergent sur la structure, pas sur le style

> **Conventions communes** — chemins, `ds.manifest.json`, `SIGNALEMENTS.md` / `ECARTS.md`, commandes (`<pm>`), `ds:doctor`, mode Figma : lire `_shared/conventions.md` avant d'agir. Si `shadcn/skills` est installée, elle porte la mécanique CLI ; sinon voir `CLAUDE.md` et le §7 des conventions.

Le DS fixe l'apparence. Ce qu'il ne fixe pas, c'est la **structure** : ce qu'on
montre d'abord, comment on navigue, ce qu'on cache, où se prend la décision.
C'est là que les alternatives ont du sens. Trois versions du même écran avec des
couleurs différentes ne sont pas des alternatives, c'est du bruit.


## Étape 1 — Fixer ce qui ne bouge pas

Avant de diverger, écrire ce que toutes les options partageront :
- **Le besoin** en une phrase, formulé comme un rôle (qui, fait quoi, pourquoi).
- **Les contraintes dures** : légales, métier, techniques, données disponibles.
- **L'inventaire** : lire `inventory` et `docs` — toutes les options se
construisent avec ça.
- **Le Figma s'il existe** : utile comme intention et comme trace de ce qui a
été écarté, mais il ne limite pas l'exploration et ne l'arbitre pas. Le code
est la source de vérité ; une option n'est pas meilleure parce qu'elle
ressemble davantage à une maquette.

Si le besoin est flou, s'arrêter et le clarifier. Explorer un besoin mal posé
produit des options toutes à côté.

## Étape 2 — Choisir des axes de divergence

Prendre 2 ou 3 axes parmi ceux-ci, et faire varier **un axe principal par
option**. Deux options qui diffèrent sur tout sont incomparables.

| Axe | Ce qu'il fait varier |
|---|---|
| Hiérarchie | ce qui est visible d'abord vs ce qui demande un geste |
| Densité | vue d'ensemble compacte vs lecture guidée |
| Flux | tout sur un écran vs étapes séquentielles |
| Modèle d'interaction | édition inline vs panneau latéral vs modale vs page |
| Point de décision | l'utilisateur choisit tôt vs le système propose et l'utilisateur valide |
| Progressive disclosure | résumé + détail à la demande vs tout exposé |
| Granularité | par item vs par lot |

Axes **interdits** : couleur, typo, radius, ombre, icônes, espacement. Ils sont
fixés par les tokens. Une option qui « aurait besoin d'un autre style » est hors
sujet.

## Étape 3 — Produire les options

Pour chaque option, dans cet ordre :

```
### Option [A/B/C] — [nom en trois mots] — axe : [hiérarchie / flux / …]

[Wireframe ASCII : structure, zones, composants DS nommés, pas de détail visuel]

┌──────────────────────────────────────────────────────┐
│ PageHeader : titre + Button(default) « Nouvelle … » │
├──────────────┬───────────────────────────────────────┤
│ Filters │ Table (Badge statut, actions ghost) │
│ (Select ×3) │ … │
└──────────────┴───────────────────────────────────────┘

**Composants DS** : PageHeader (composition), Select, Table, Badge, Button.ghost
**Coût DS** : 0 nouveau composant / 1 variant à demander (Badge.warning) / 1 composant custom
**Pour** :
- …
**Contre** :
- …
**Choisir cette option si** : [le contexte où elle gagne]
**Cinq états** : ce qui change pour vide / chargement / erreur / partiel
```

Le **coût DS** est la colonne qui manque toujours et qui décide souvent : une
option élégante qui demande deux composants custom coûte plus qu'une option
sobre à zéro composant. Le dire explicitement.

## Étape 4 — La recommandation

Terminer par une recommandation argumentée en trois lignes, **et** par ce qu'il
faudrait savoir pour trancher autrement (« si les utilisateurs travaillent surtout
sur mobile, B l'emporte »). L'exploration sert la décision, elle ne la remplace
pas.

## Ce que cette skill refuse

- Produire des options qui divergent sur le style.
- Produire plus de 3 options : au-delà, on ne compare plus, on feuillette.
- Produire une option non constructible avec l'inventaire sans afficher son
coût DS.
- Faire des mockups pixel avant que l'option soit choisie. Le wireframe ASCII
suffit à comparer des structures ; le pixel vient avec `ds-build`.

## Après le choix

L'option retenue va dans `ds-build`, avec son wireframe comme table des rôles
déjà remplie. Les composants ou variants listés en coût DS passent par
`ds-decide` et `ds-variant` avant construction.
