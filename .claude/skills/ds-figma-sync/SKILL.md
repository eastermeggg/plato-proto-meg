---
name: ds-figma-sync
description: Compare les Variables Figma au thème du code (ds-theme.json), produit un rapport de dérive, et n'applique que les lignes validées une par une. Sert aussi au premier relevé de thème d'un DS. À utiliser pour "relève les tokens du Figma", "le Figma a changé, répercute", "drift check", "est-ce que maquette et code sont synchro". Refuse si figma.mode vaut none.
---

# ds-figma-sync

Référence : conventions §6. Le code est la vérité ; une dérive n'est pas un bug.

## 1. Relever
Nœud de référence des tokens (`figma.tokensNode`). `get_variable_defs` d'abord ;
`get_design_context` seulement sur les sections douteuses. Quand un label de
cellule contredit la Variable résolue, **la Variable fait foi**. Hex résolus,
light et dark, jamais un alias seul. Une valeur manquante se liste, ne
s'invente pas.

Premier relevé (pas encore de `ds-theme.json`) : écrire
`docs/figma-theme-releve.md` et suivre `docs/playbook-figma-bootstrap.md`.

## 2. Rapport de dérive
| Token | Code | Figma | Lecture | Reco |
|---|---|---|---|---|

Lecture : identique · Figma a bougé · code a bougé (`git log`) · jamais
réconcilié. Reco : appliquer · documenter · resynchroniser Figma · ignorer.
Un token code sans équivalent Figma est normal : ne pas le présenter comme un
problème.

## 3. Point d'arrêt
Attendre un oui/non **par ligne ou par famille**. « Applique ce qui te semble
bien » n'est pas une validation. Sans validation : le rapport est la sortie.

## 4. Appliquer
`ds-theme.json` seulement, sur `main`. `ds:doctor`, `build`, contrôle sur le
kitchen-sink. Lignes refusées mais réelles : bloc pour `ECARTS.md`.
