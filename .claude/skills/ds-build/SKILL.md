---
name: ds-build
description: Construit une page, un écran ou une feature à partir d'une spec, d'une user story, d'un wireframe ou d'une description, en utilisant UNIQUEMENT le design system du repo — et produit un rapport de tout ce qui a dû être introduit en dehors du DS (composants, variants, compositions, tokens, ajustements). À utiliser dès qu'un utilisateur demande de créer, coder, implémenter, maquetter ou prototyper une page, une vue, un écran, un formulaire, un tableau, une modale, un dashboard, une feature, ou dit "build this screen", "implémente cette spec", "fais-moi la page…", "ajoute une vue…", même sans mentionner le design system. Impose inventaire → mapping → composition → cinq états → vérification → rapport des nouveautés.
compatibility: Nécessite ds.manifest.json à la racine du projet et le script ds:doctor. La skill officielle shadcn/skills est recommandée si disponible — sinon la mécanique CLI est couverte par CLAUDE.md.
---

# ds-build — construire avec le DS, et rien d'autre

> **Conventions communes** — chemins, `ds.manifest.json`, `SIGNALEMENTS.md` / `ECARTS.md`, commandes (`<pm>`), `ds:doctor`, mode Figma : lire `_shared/conventions.md` avant d'agir. Si `shadcn/skills` est installée, elle porte la mécanique CLI ; sinon voir `CLAUDE.md` et le §7 des conventions.

L'objectif n'est pas seulement que la page soit jolie : c'est qu'un lecteur du
code ne puisse pas distinguer cette page d'une page écrite par la personne qui a
conçu le système. Zéro invention, zéro valeur en dur, zéro composant fantôme.


## Lire d'abord — obligatoire, à chaque tâche

1. `CLAUDE.md` — règle d'or, tokens, portabilité, RSC
2. `src/app/design-system/demos/index.ts` — l'inventaire : ce qui existe vraiment
3. `docs/design-system.md` — compositions canoniques, contrats des customs,
conventions (icônes, densité)
4. `docs/components/` — la fiche du composant visé avant de l'utiliser : elle dit
quand l'employer et quand l'éviter. Accessible aussi depuis le kitchen-sink
(bouton « Doc » de chaque composant)
5. `/design-system` en local si le serveur tourne — voir les composants rendus
vaut mieux que lire leur code

Un composant absent de l'inventaire n'existe pas, même s'il existe dans la doc
shadcn. Il faut alors passer par `ds-decide`.

## Entrée — ce qu'on reçoit

Une spec, une user story, un lien Figma, un wireframe ASCII sorti de
`ds-explore`, ou trois phrases. Quelle que soit la forme, en extraire d'abord :

- **Le rôle de l'écran** : qui, fait quoi, pourquoi (une phrase).
- **Les données** : ce qui est affiché, d'où ça vient, ce qui peut manquer.
- **Les actions** : la principale (une seule), les secondaires.
- **Les contraintes** : légales, métier, techniques.

Ce qui n'est pas dans la spec n'est pas inventé : c'est une question posée à
l'utilisateur, ou une hypothèse **écrite** dans le relevé de composition.

**Si la spec est un Figma** : c'est une intention, pas une liste de composants à
reconstruire ni un référentiel de valeurs. Le code est la source de vérité.
Concrètement : traduire chaque zone en composant de l'inventaire, prendre le
token le plus proche quand une valeur Figma ne tombe pas sur l'échelle (jamais
de valeur arbitraire « pour être fidèle »), et signaler dans le relevé tout
écart visible entre la maquette et ce que le DS permet. Ne pas chercher le
pixel-perfect : c'est un échec de `ds:doctor` déguisé en fidélité.

Si la spec est ouverte sur la forme (le quoi est clair, le comment ne l'est
pas), passer d'abord par `ds-explore` : construire une option sans l'avoir
comparée à deux autres coûte souvent une réécriture.

## Étape 1 — Décomposer la demande en rôles

Avant tout JSX, lister les éléments de l'écran comme des **rôles**, pas des
apparences :

| # | Rôle | Contenu | Importance |
|---|---|---|---|
| 1 | Titre de page + action principale | … | primaire |
| 2 | Filtres | … | secondaire |
| 3 | Liste des dossiers | … | primaire |

Cette table est le contrat de la page. Elle évite le piège classique : partir du
Figma pixel par pixel et reconstruire des composants qui existent déjà.

## Étape 2 — Mapper chaque rôle sur l'inventaire

Pour chaque ligne : composant existant → composition canonique → variant existant.
Si rien ne mappe, **s'arrêter sur cette ligne** et invoquer `ds-decide`. Ne pas
« temporairement » écrire du JSX maison en attendant : le temporaire devient le
permanent.

Résultat attendu : chaque rôle a un composant ou une recette nommés. Aucune
ligne « à créer » non passée par `ds-decide`.

## Étape 3 — Composer

- **Compositions canoniques d'abord.** Si la doc dit « carte = `Card` +
`CardHeader` + … », c'est cette recette et pas une autre. Une recette
réinventée localement est une dette, même si elle rend pareil aujourd'hui.
- **Tokens sémantiques uniquement.** `bg-card`, `text-muted-foreground`,
`border-border`. Jamais de couleur Tailwind brute (`bg-gray-100`), jamais de
valeur arbitraire. Si un token manque, c'est une demande dans `SIGNALEMENTS.md`,
pas un `bg-[#f4f4f5]`.
- **Un seul niveau d'action primaire par écran.** Un `Button` default par vue ;
le reste est `secondary`, `outline` ou `ghost`. Deux boutons primaires
côte à côte est une erreur de hiérarchie, pas un choix de style.
- **Icônes selon la convention** documentée (taille, épaisseur, librairie
unique). Pas de mélange de sets.
- **Portabilité.** Aucun `next/*` dans `src/components/`. Dans `src/app/`, Next
est permis, mais un composant réutilisable n'y naît pas — il va dans
`components/custom/` après `ds-decide`.
- **Frontière RSC.** `"use client"` seulement là où il y a état, handler ou
primitive Radix interactive. Pas par précaution.

### Après chaque `shadcn add`

`<pm> run ds:doctor` — il purge le piège `cn` du CLI (paquet npm `cn` et imports `from "cn"`), vérifie la portabilité et les chemins protégés. Ne pas le sauter : le piège est silencieux.

## Étape 4 — Les cinq états, sans exception

Tout écran qui affiche des données existe en cinq états. Les livrer tous, pas
seulement l'état idéal :

| État | Ce qu'il montre | Composant typique |
|---|---|---|
| Vide | Aucune donnée, quoi faire ensuite | composition « Empty state » de la doc |
| Chargement | Structure en attente | `Skeleton` aligné sur la mise en page finale |
| Erreur | Ce qui a échoué, comment réessayer | `Alert variant="destructive"` + action |
| Partiel | Données incomplètes, ce qui manque | badge ou note « en attente » |
| Idéal | Tout est là | l'écran nominal |

L'état partiel est le plus souvent oublié et le plus fréquent en production —
une comparaison avec 2 dossiers sur 5 est un état partiel, pas une erreur.

## Étape 5 — Vérifier avant de rendre la main

```bash
<pm> run ds:doctor
<pm> run build
<pm> run lint
```

Puis, visuellement, la page **à côté** de `/design-system` : les composants
doivent être identiques à leur démo. Un `Button` qui a l'air différent de celui
du kitchen-sink signale une classe ajoutée à la main qui n'aurait pas dû l'être.

Enfin, passer `ds-review` sur la page. C'est la revue qu'un pair ferait ; la
faire soi-même avant coûte moins cher.

## Livrable

- Le code de la page.
- Le **relevé de composition**, en tête de la PR ou du message. Il a deux
parties, et la seconde est la plus importante : c'est ce qui permet au
steward du DS de voir ce que la feature a dû inventer.

Remplir `templates/composition.md` (le set de skills le fournit ; ne pas le réécrire de mémoire).

La table « Nouveautés » est la matière première de `ds-promote`. Si elle est
vide, c'est soit un très bon signe, soit le signe qu'on a caché des écarts dans
des `className` — `ds-review` tranchera.

## Interdits absolus

- Créer un composant sans `ds-decide`.
- Écrire une valeur arbitraire, même « juste pour cet écran ».
- Modifier `ui/`, `globals.css`, `ds-theme.json` ou `design-system/page.tsx`
dans un workspace — ces fichiers ne se modifient que sur `main`. Signaler dans
`SIGNALEMENTS.md`.
- Livrer un seul état sur cinq.
- Importer `next/*` dans `src/components/`.
