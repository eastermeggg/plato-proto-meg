---
name: ds-promote
description: Fait entrer dans le design system ce qu'une feature, une app ou le package marketing a inventé hors DS — composant local, variant improvisé, composition répétée, token manquant — ou le refuse. À utiliser pour "remonte ça dans le DS", "promeus ce composant", "on l'a fait trois fois", en sortie de ds-build (Hors DS), ds-review (À remonter) ou sur les issues ds-gap.
---

# ds-promote

Référence : conventions §4 (packages, coexistence), §7 (fiche).

## Entrée
La table « Hors DS » d'un `ds-build`, les issues `ds-gap`, ou un constat
direct. Sans rien : `node scripts/ds-audit.mjs`.

## 1. Trancher chaque item
| Issue | Critère |
|---|---|
| Promouvoir | ≥ 2 usages, ou règle métier, ou vrai manque du DS |
| Garder local | un seul usage, spécifique, sans règle métier → commentaire d'en-tête « pourquoi local » |
| Supprimer | doublon ou contournement d'un existant |

Forme : token (`ds-theme.json`) · clé `css` · variant (`ds-variant`) ·
composition (doc) · composant custom (`ds-decide` d'abord) · convention.
Un composant qui exige un token : le token passe en premier.

## 2. Exécuter dans le DS, jamais dans l'app
Copier le fichier de l'app n'est pas promouvoir : reconstruire selon les règles
du DS, avec démo (`data-demo`), entrée d'inventaire, fiche en `status: beta`.
`ds:doctor` + `build`. Bump `ds.version`, `HANDOFF.md`.

**Extension → source** (`ui-marketing` → `ui-product`) : un token `--mkt-*` ne
remonte pas tel quel. Dans la même PR, l'extension passe à la version du
source et supprime la sienne.

## 3. Nettoyer l'origine
Remplacer les usages, **supprimer** l'ancien, vérifier par `grep`. Fermer les
issues en citant la PR.

## Livrable
`templates/promotion.md`.
