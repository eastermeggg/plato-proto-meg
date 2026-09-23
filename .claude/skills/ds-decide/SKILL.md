---
name: ds-decide
description: Décide s'il faut créer un nouveau composant, ou si le besoin est couvert par un composant existant, une composition ou un variant. À utiliser SYSTÉMATIQUEMENT avant toute création de composant, dès qu'un utilisateur dit "j'ai besoin d'un composant pour…", "il manque un…", "je crée un…", "est-ce qu'on a déjà…", "should I create a component", ou dès qu'une tâche de build (ds-build) rencontre un élément d'UI qui ne mappe pas immédiatement sur l'inventaire. Le biais par défaut est CONTRE la création. Produit un bloc de décision argumenté (réutiliser / composer / varianter / créer) à coller dans la PR ou SIGNALEMENTS.md.
compatibility: Nécessite ds.manifest.json à la racine du projet et le script ds:doctor. La skill officielle shadcn/skills est recommandée si disponible — sinon la mécanique CLI est couverte par CLAUDE.md.
---

# ds-decide — faut-il créer ce composant ?

> **Conventions communes** — chemins, `ds.manifest.json`, `SIGNALEMENTS.md` / `ECARTS.md`, commandes (`<pm>`), `ds:doctor`, mode Figma : lire `_shared/conventions.md` avant d'agir. Si `shadcn/skills` est installée, elle porte la mécanique CLI ; sinon voir `CLAUDE.md` et le §7 des conventions.

Un design system meurt par accumulation de composants presque identiques. Cette
skill existe pour rendre la création **coûteuse à justifier** et la réutilisation
**facile à prouver**. Le biais par défaut est : ne pas créer.


## Lire d'abord

1. `CLAUDE.md` — la règle d'or et les interdits
2. `src/app/design-system/demos/index.ts` — l'inventaire des composants existants
3. `docs/design-system.md` — section « Compositions canoniques » et « Contrats de composants custom »
4. `docs/components/` — les fiches existantes : « quand l'éviter » d'une fiche
répond souvent directement à la question posée
5. `src/components/ui/` — liste des composants shadcn installés (`ls`)

Ne pas se fier à la mémoire : un composant peut avoir été ajouté hier.

## Le besoin, reformulé en rôle

Avant de chercher une solution, écrire le besoin comme un **rôle**, pas comme une
apparence. « Une carte avec une bordure verte et une icône » n'est pas un rôle.
« Signaler qu'une dossier a été validée, avec accès au détail » en est un.

Un rôle bien formulé répond à : qui l'utilise, pour faire quoi, dans quel
contexte, avec quel niveau d'importance. Si le rôle est flou, s'arrêter et le
clarifier avec l'utilisateur — décider sur une apparence produit toujours un
doublon.

## L'échelle de décision — s'arrêter au premier palier qui tient

### Palier 1 — Réutiliser tel quel
Un composant de l'inventaire remplit déjà ce rôle. La différence perçue est
souvent une différence de **contenu** ou de **contexte**, pas de composant.
Test : « si je pose le composant existant dans ce contexte avec ce contenu,
est-ce que ça fonctionne ? » Si oui, terminé.

### Palier 2 — Composer
Le besoin est une combinaison de 2 ou 3 primitives existantes selon une recette.
`Card` + `Badge` + `Button variant="ghost"` est une composition, pas un composant.
Test : « est-ce que je peux l'écrire en JSX sans créer de fichier dans
`components/` ? » Si oui, c'est une composition. Si la recette est appelée à se
répéter, la documenter dans `docs/design-system.md` → Compositions canoniques.
C'est ce qui empêche qu'elle soit réinventée différemment ailleurs.

### Palier 3 — Ajouter un variant
Le composant existe, mais une déclinaison d'apparence ou de taille manque, sans
changement de rôle ni de structure. `Button variant="soft"` est un variant.
`Button` qui affiche un menu n'en est pas un.
Test : « le composant garde-t-il exactement le même rôle et la même API, à une
prop près ? » Si oui → skill `ds-variant`.

### Palier 4 — Créer un composant custom
Aucun palier précédent ne tient. Conditions cumulatives :
- le rôle n'est couvert par aucun composant ni aucune composition ;
- la composition équivalente dépasserait 3 primitives OU demanderait une logique
d'état propre (ouverture, sélection, validation…) ;
- il sera utilisé à au moins 2 endroits, ou il porte une règle métier qui doit
être centralisée (ex. affichage d'une montant au format légal) ;
- il peut être construit à partir de primitives shadcn/Radix, avec les tokens
existants — sinon, la demande de tokens passe d'abord par `ds-theme.json`.

Si une condition manque, revenir au palier 2 : une composition locale est
préférable à un composant utilisé une fois.

## Signaux d'alerte — presque toujours un doublon

- Le nom proposé contient un nom de composant existant : `PrimaryButton`,
`SmallCard`, `AppDialog`.
- Le besoin est décrit par une apparence (« une carte bleue ») plutôt qu'un rôle.
- La justification est « celui de shadcn ne ressemble pas au Figma » — c'est un
problème de thème ou de variant, jamais de composant.
- Le composant n'aurait qu'un seul usage prévu.
- Il faudrait un nouveau token pour le construire — le besoin est peut-être
réel, mais la décision de token précède la décision de composant.

## Livrable — le bloc de décision

Toujours produire ce bloc, même quand la réponse est « réutiliser » : la trace
compte autant que la décision.

Remplir `templates/decision.md` (le set de skills le fournit ; ne pas le réécrire de mémoire).

Si la décision est « Créer », le bloc est recopié en commentaire d'en-tête du
fichier créé, dans `docs/design-system.md` → Contrats de composants custom, et
une fiche est ajoutée dans `docs/components/` (rôle, quand l'utiliser/éviter,
props, divergences thème, exemple) avec son entrée dans l'index. Si le composant
vient d'un nœud Figma, y noter la référence **datée et avec un statut**
(conforme / divergent) — un lien sans date est trompeur. Un composant
sans fiche est invisible pour la prochaine décision — c'est ainsi que naissent
les doublons.
Si la décision se prend dans un workspace Conductor et implique `ui/`,
`globals.css` ou `ds-theme.json`, elle va dans `SIGNALEMENTS.md` : ces fichiers ne se
modifient que sur `main`.

## Ce que cette skill ne fait pas

Elle ne construit rien. Une fois la décision prise : `ds-build` pour composer,
`ds-variant` pour un variant, `ds-build` (mode custom) pour un nouveau composant.
