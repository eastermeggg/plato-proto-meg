---
name: ds-variant
description: Ajoute un variant (apparence, taille, état) à un composant existant du design system sans en changer le rôle ni l'API. À utiliser dès qu'un utilisateur demande "un variant", "une version [soft/outline/compact/danger] de…", "une taille en plus", "le même bouton mais…", "add a variant", ou quand ds-decide a conclu au palier 3. Encadre strictement où le variant peut être ajouté (ui/ protégé vs custom/), impose cva + tokens uniquement, et exige la démo et la documentation.
compatibility: Nécessite ds.manifest.json à la racine du projet et le script ds:doctor. La skill officielle shadcn/skills est recommandée si disponible — sinon la mécanique CLI est couverte par CLAUDE.md.
---

# ds-variant — ajouter un variant sans créer de doublon

> **Conventions communes** — chemins, `ds.manifest.json`, `SIGNALEMENTS.md` / `ECARTS.md`, commandes (`<pm>`), `ds:doctor`, mode Figma : lire `_shared/conventions.md` avant d'agir. Si `shadcn/skills` est installée, elle porte la mécanique CLI ; sinon voir `CLAUDE.md` et le §7 des conventions.

Un variant est une déclinaison d'un composant qui garde **le même rôle et la
même API**, à une valeur de prop près. Si le rôle change, ce n'est pas un
variant : retourner à `ds-decide`.


## Lire d'abord

1. `CLAUDE.md` — interdits et règles de tokens
2. Le fichier du composant cible et son fichier de démo dans
`src/app/design-system/demos/`
3. `docs/design-system.md` — section « Variants ajoutés » (pour ne pas recréer
un variant existant sous un autre nom)

## Où le variant a le droit de vivre

C'est la question qui décide de tout le reste. Trois mécanismes, dans cet ordre
de préférence.

### 1 · Divergence de thème → la clé `css` de `ds-theme.json`

**Le mécanisme canonique du repo, à essayer en premier.** Les divergences
voulues sur le vanilla (radius des boutons, checkbox en vert de marque, densité
d'un contrôle) passent par la clé `css` de `ds-theme.json`, reflétée dans
`globals.css` par le CLI. Avantage décisif : elles **survivent à toute
régénération** de `ui/`, sans bloc à réappliquer et sans mémoire à maintenir.

Applicable dès que le besoin s'exprime en CSS sur un sélecteur ou une classe
existante, sans nouvelle valeur de prop. Se fait sur `main` (la CI n'accepte un
diff de `globals.css` que s'il accompagne `ds-theme.json`).

### 2 · Vrai nouveau variant sur un composant `custom/`

Le variant se fait librement dans le `cva` du composant, dans le workspace
courant. Aucune contrainte de lieu.

### 3 · Vrai nouveau variant sur un composant `ui/` (shadcn)

Dernier recours, quand le besoin est une **nouvelle valeur de prop** que la clé
`css` ne peut pas exprimer (ex. `variant="soft"` qui n'existe pas dans le cva
vanilla).

`ui/` est protégé : la CI refuse toute PR qui le modifie à la main. Le mécanisme
sanctionné :

1. Dans le workspace : **ne pas éditer `ui/`**. Rédiger la demande dans
`SIGNALEMENTS.md` avec le bloc de spécification ci-dessous.
2. Sur `main`, le steward du DS applique le variant dans le `cva`, à
l'intérieur d'un bloc délimité :
```ts
// --- DS variants (additifs, réappliquer après tout `shadcn add --overwrite`) ---
soft: "bg-primary/10 text-primary hover:bg-primary/15",
// --- fin DS variants ---
```
3. Consigner dans `docs/design-system.md` → « Variants ajoutés » **et** dans la
fiche du composant (`docs/components/`), section divergences thème. C'est la
mémoire qui permet de réappliquer après régénération.

Cette voie a un coût de maintenance permanent, contrairement à la clé `css`.
Avant de l'emprunter, vérifier qu'aucune formulation en CSS ne conviendrait.

### Jamais : le wrapper dans `custom/`

Ne pas créer dans `custom/` un composant qui réexporte un composant `ui/` avec
des variants en plus. Cela crée deux `Button`, et c'est exactement le doublon
que le DS interdit.

## Règles de construction

- **cva uniquement.** Le variant est une entrée dans l'objet `variants`, pas
une prop booléenne ad hoc ni un `className` conditionnel dans le JSX.
- **Tokens uniquement.** Aucune valeur arbitraire (`bg-[#…]`, `p-[13px]`). Si le
design exige une valeur qui n'existe pas en token, s'arrêter : la demande de
token va dans `SIGNALEMENTS.md`, elle précède le variant.
- **Modificateurs d'opacité autorisés** sur les tokens (`bg-primary/10`) : c'est
le moyen standard de dériver une teinte sans créer de token.
- **Tous les états.** Le variant définit `hover`, `focus-visible`, `disabled`,
et `aria-busy`/`data-state` si le composant en a. Un variant sans état de
focus n'est pas terminé.
- **Cohérence de nommage.** Suivre le vocabulaire déjà présent dans le `cva`
(`default`, `secondary`, `outline`, `ghost`, `destructive`, `link` pour les
boutons shadcn). Un nouveau nom se justifie dans la doc.
- **Ne pas modifier les variants existants** en passant. Une PR de variant
n'est pas une PR de refonte.

## Démo obligatoire

Ajouter le variant au fichier de démo du composant, dans **toutes les lignes
d'états** existantes (default, disabled, loading…), pas seulement dans la ligne
« Variants ». Un variant visible dans un seul état cache ses défauts.

Vérifier sur `/design-system` : le variant rend correctement en light **et** en
dark si le thème a un mode dark.

## Bloc de spécification (pour SIGNALEMENTS.md ou la PR)

Remplir `templates/variant.md` (le set de skills le fournit ; ne pas le réécrire de mémoire).

## Critères de fin

- `<pm> run ds:doctor` et `<pm> run build` passent.
- Si le variant vit dans le repo DS : `ds.version` bumpé dans le manifeste et `HANDOFF.md`/changelog à jour (voir `ds-promote`).
- Le variant est dans la démo, dans tous les états.
- La table « Variants ajoutés » de `docs/design-system.md` est à jour.
- La fiche du composant dans `docs/components/` mentionne la divergence.
- Si `ui/` était concerné : la demande est dans `SIGNALEMENTS.md`, pas dans un diff.
- Si la clé `css` a été utilisée : le diff de `globals.css` accompagne bien
`ds-theme.json` dans le même commit, sinon la CI refuse la PR.
