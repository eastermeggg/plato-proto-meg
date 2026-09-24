---
name: ds-figma-build
description: Implémente un écran ou un composant custom à partir d'un nœud Figma, avec uniquement le DS — la maquette donne l'intention, les tokens et l'inventaire donnent le rendu. À utiliser quand une URL Figma arrive avec "fais cet écran", "implémente cette maquette", "crée le composant de ce nœud", "design to code". Refuse si figma.mode vaut none.
---

# ds-figma-build

Référence : conventions §6. Le pixel-perfect n'est pas l'objectif.

## Pré-requis
`figma.mode: intent` · une URL avec `?node-id=` · pour un composant :
`ds-decide` a conclu « créer ».

## Lire le nœud (3 appels max)
`get_screenshot` (intention) · `get_design_context` (structure) ·
`get_variable_defs` (les tokens que le design voulait — mieux que des hex).
Les composants de librairie Figma nommés sont des indices de mapping, pas des
ordres de construction.

## Écran
Zones → table des rôles → `ds-build`. Livrer les cinq états même si la
maquette n'en montre qu'un.

## Composant
Chaque valeur → le token le plus proche. Valeur sans token plausible →
`SIGNALEMENTS.md`, s'arrêter sur ce point. Composer des primitives `ui/`.
Variants Figma → variants cva. Les états absents de la maquette se livrent
quand même. Démo, inventaire, fiche.

## Livrable
En plus du relevé de `ds-build`, les écarts assumés :

| Zone | Figma | Rendu DS | Raison |
|---|---|---|---|

Un écart ne se corrige ni dans le code ni dans Figma de sa propre initiative.

Interdits : valeur arbitraire « pour être fidèle », reconstruire un composant
existant parce que Figma le dessine autrement, toucher les fichiers protégés.
