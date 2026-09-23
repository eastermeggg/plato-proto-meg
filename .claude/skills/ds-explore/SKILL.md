---
name: ds-explore
description: Propose 2 à 3 alternatives UX réellement différentes pour un même besoin, toutes constructibles avec le DS, avec leur coût DS. À utiliser pour "des alternatives", "d'autres options", "explore des pistes", "plusieurs versions", "comment on pourrait présenter…", "show me options", ou quand une spec est claire sur le quoi mais pas sur le comment. Diverge sur la structure, jamais sur le style.
---

# ds-explore

## 1. Fixer ce qui ne bouge pas
Le besoin en rôle · les contraintes dures · l'inventaire. Un Figma éventuel est
une intention, il ne limite pas l'exploration. Besoin flou : clarifier d'abord.

## 2. Références (si le MCP Mobbin est disponible)
`search_flows` (parcours), `search_screens` (écran), `search_sections` (page
marketing). Chercher par rôle. Garder 3 à 5 références, chacune résumée en
**une décision structurelle** (« le prix n'apparaît qu'après le choix du
volume »). Le style est ignoré. Sans Mobbin : le dire en une ligne, continuer.

## 3. Un axe principal par option
Hiérarchie · densité · flux (un écran / étapes) · interaction (inline,
panneau, modale, page) · point de décision · progressive disclosure ·
granularité (item / lot). Interdits : couleur, typo, radius, ombre, espacement.

## 4. Chaque option
```
### Option A — [nom] — axe : [x]
[wireframe ASCII, composants DS nommés]
Coût DS : 0 composant · 1 variant · 1 custom
Pour / Contre : une ligne chacun
Gagne si : [contexte]
Référence : [produit — décision reprise] / aucune
```

## 5. Recommandation
Trois lignes, et ce qu'il faudrait savoir pour trancher autrement.

Jamais plus de 3 options. Pas de mockup pixel : l'option retenue part dans
`ds-build`, son wireframe sert de table des rôles.
