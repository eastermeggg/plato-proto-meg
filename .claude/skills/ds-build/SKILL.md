---
name: ds-build
description: Construit une page, un écran, une feature ou un prototype avec UNIQUEMENT le design system du repo, et liste ce qui a dû être introduit hors DS. À utiliser dès qu'on demande de créer, coder, implémenter, maquetter ou prototyper une page, une vue, un formulaire, un tableau, une modale, un dashboard, une section marketing — "fais-moi la page…", "implémente cette spec", "build this screen" — même sans mentionner le DS.
---

# ds-build

Référence : `CLAUDE.md` (règles dures), conventions §4 (packages).

## 1. Extraire de la demande
Rôle de l'écran (une phrase) · données et ce qui peut manquer · action
principale (une) · contraintes. Ce qui n'est pas dit : une question, ou une
hypothèse **écrite** dans le relevé. Forme ouverte (le quoi est clair, pas le
comment) : `ds-explore` d'abord.

## 2. Table des rôles
| # | Rôle | Contenu | Importance |
|---|---|---|---|

Décrire des rôles, pas des apparences.

## 3. Mapper chaque rôle
Composant existant → composition documentée → variant existant. En extension :
le source d'abord. Rien ne mappe : **s'arrêter sur cette ligne**, `ds-decide`.
Pas de JSX maison « temporaire ».

## 4. Composer
Suivre `CLAUDE.md`. Les compositions documentées s'appliquent telles quelles.

## 5. Cinq états
| État | Typique |
|---|---|
| Vide | composition « Empty state » |
| Chargement | `Skeleton` à la structure finale |
| Erreur | `Alert destructive` + action de reprise |
| Partiel | badge ou note « en attente » — c'est normal, pas une erreur |
| Idéal | l'écran nominal |

## 6. Vérifier
`<pm> run ds:doctor && <pm> run lint && <pm> run build`. Si un composant a été
modifié : `<pm> run ds:visual` — un diff hors des composants touchés est une
régression. Comparer la page au kitchen-sink : un composant qui diffère de sa
démo cache une classe en trop. Puis `ds-review`.

## Livrable
Le code + `templates/composition.md`. La table « Hors DS » alimente
`ds-promote` : vide, c'est un bon signe ou des écarts cachés dans des
`className`.
