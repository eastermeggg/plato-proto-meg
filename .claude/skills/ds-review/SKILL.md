---
name: ds-review
description: Audite une page, un écran ou un composant (souvent généré par IA) pour vérifier sa conformité et sa cohérence avec le design system du repo, avec preuves fichier:ligne et correctifs. À utiliser dès qu'un utilisateur dit "review cette page", "est-ce que ça respecte le DS", "check la conformité", "c'est cohérent ?", "relis ce que l'agent a produit", "is this on-brand", partage une PR ou un fichier de page à valider, ou en fin de ds-build. On juge UNE production contre le DS, pas le DS entier.
compatibility: Nécessite ds.manifest.json à la racine du projet et le script ds:doctor. La skill officielle shadcn/skills est recommandée si disponible — sinon la mécanique CLI est couverte par CLAUDE.md.
---

# ds-review — cette page respecte-t-elle le système ?

> **Conventions communes** — chemins, `ds.manifest.json`, `SIGNALEMENTS.md` / `ECARTS.md`, commandes (`<pm>`), `ds:doctor`, mode Figma : lire `_shared/conventions.md` avant d'agir. Si `shadcn/skills` est installée, elle porte la mécanique CLI ; sinon voir `CLAUDE.md` et le §7 des conventions.

Une revue de conformité, pas une revue de goût. Le référentiel est **le DS et le
kitchen-sink**, jamais une maquette Figma : une page conforme au DS mais
différente du Figma est conforme. L'écart se note dans « À remonter au DS »,
où il devient une question — faire évoluer le DS, ou la maquette ? Chaque point est vérifiable,
chaque constat porte une preuve (`fichier:ligne` ou sortie d'outil), chaque
défaut a un correctif nommé. Une liste sans références n'est pas une revue.


## Lire d'abord

1. `CLAUDE.md` — c'est le référentiel de la revue
2. `src/app/design-system/demos/index.ts` — l'inventaire des composants légitimes
3. `docs/design-system.md` — compositions canoniques, conventions, dérogations
enregistrées (une valeur en dérogation documentée n'est pas une faute)
4. `docs/components/` — la fiche de chaque composant utilisé : sa section
« quand l'éviter » est le critère de conformité le plus souvent oublié
5. Le code à revoir, en entier — pas seulement le diff

## Étape 1 — Les preuves mécaniques d'abord

Ne pas juger à l'œil ce qu'un outil prouve :

```bash
<pm> run ds:doctor --base main   # valeurs arbitraires, couleurs brutes, portabilité, chemins protégés, piège cn, appariement globals.css/ds-theme.json
<pm> run lint
<pm> run build                   # frontière RSC, types
```

`ds:doctor` sort un constat par ligne avec `fichier:ligne` — les recopier tels quels
dans le rapport. Ne pas refaire à la main ce qu'il a déjà prouvé.

Chaque sortie non vide est un constat ❌ avec sa preuve toute faite.

## Étape 2 — La grille de revue

Noter chaque item ✅ conforme / 🟠 partiel / ❌ non conforme, avec preuve.

### A · Composants
- Tous les éléments d'UI viennent de l'inventaire (`ui/` ou `custom/` listés
dans `demos/index.ts`). Aucun composant défini localement dans la page qui
reproduit un rôle existant.
- Aucun composant créé sans bloc `ds-decide` (en-tête de fichier ou PR).
- Tout composant ajouté a sa démo dans `demos/`, son entrée dans
`demos/index.ts` et sa fiche dans `docs/components/` (+ index).
- Aucun composant employé à contre-emploi de sa fiche (section « quand l'éviter »).
- Les compositions suivent les recettes canoniques de la doc — pas une variante
maison qui rend pareil.
- Aucun `className` ajouté sur un composant DS pour « ajuster » son apparence
(padding, couleur, radius). Un ajustement récurrent est un variant à demander.

### B · Tokens
- Aucune valeur arbitraire, aucune couleur Tailwind brute.
- Les tokens utilisés existent réellement dans `globals.css` (un `bg-brand-x`
sur un token jamais déclaré rend silencieusement rien).
- Les tokens sont employés selon leur intention documentée (`muted-foreground`
pour du texte secondaire, pas pour une bordure).
- Toute dérogation `ds-allow-arbitrary` est justifiée dans la doc.

### C · Hiérarchie et cohérence
- Un seul niveau d'action primaire par écran.
- Hiérarchie typographique conforme aux compositions typo de la doc.
- Icônes : une seule librairie, taille et épaisseur conformes à la convention.
- Densité cohérente avec le reste du produit (hauteurs de contrôles, espacements
de l'échelle).
- La page ressemble au kitchen-sink : un composant qui a l'air différent de sa
démo est un signal, pas un détail.

### D · États
- Les cinq états sont présents : vide, chargement, erreur, partiel, idéal.
- L'état de chargement reproduit la structure finale (pas un spinner centré).
- L'état d'erreur propose une action de reprise.
- L'état partiel est traité comme normal, pas comme une erreur.

### E · Technique
- `"use client"` seulement où nécessaire ; aucun `"use client"` de précaution.
- Aucun import `next/*` dans `src/components/`.
- `ui/` et `design-system/page.tsx` non modifiés (la CI refuse).
- Un éventuel diff de `globals.css` accompagne `ds-theme.json` dans le même commit.
- Piège CLI shadcn purgé : aucun `from "cn"` dans `ui/`, pas de paquet `cn`.
- Composants réutilisables placés dans `components/custom/`, pas dans `app/`.

### F · Accessibilité (WCAG 2.1 AA, ce qu'une page peut casser)
- Focus visible sur tout élément interactif (les composants DS le fournissent ;
vérifier qu'il n'a pas été neutralisé par un `className` ou un `outline-none`).
- Rôles et libellés : boutons icône-seuls avec `aria-label`, champs reliés à un
`Label`, groupes de champs avec `fieldset`/`legend`, tableaux avec en-têtes.
- Contraste : uniquement des paires de tokens prévues (`bg-x` + `text-x-foreground`).
Une couleur seule ne porte jamais un sens (statut = couleur **et** texte ou icône).
- Ordre et clavier : ordre DOM = ordre visuel ; toute action au clic est atteignable
au clavier ; les overlays (Dialog, Sheet, Popover) rendent le focus à l'ouvreur.
- Hiérarchie de titres : un `h1` par page, pas de saut de niveau.
- Mouvement et chargement : `Skeleton` et transitions respectent
`prefers-reduced-motion` ; les états de chargement sont annoncés (`aria-busy`).
- Cibles tactiles : contrôles interactifs ≥ 24 px (44 px si le produit est
mobile-first), pas de contrôles collés sans espacement.

## Étape 3 — Vérification visuelle

Si `figma.mode` est `mirror` ou `none` : aucune comparaison avec une maquette, jamais.
Si un serveur tourne : ouvrir la page et `/design-system` côte à côte. Comparer
composant par composant. Screenshots si l'outil le permet. Noter tout écart de
rendu, même mineur — c'est presque toujours une classe surnuméraire.

## Livrable — le rapport

Remplir `templates/review.md` (le set de skills le fournit ; ne pas le réécrire de mémoire).

## Règles de verdict

- **Non conforme** : au moins un ❌ en A, B, E, ou un ❌ en F sur focus/clavier/libellés. Ce n'est pas mergeable.
- **Conforme avec réserves** : aucun ❌ bloquant, mais des 🟠 qui créent une
dette (état manquant, composition non canonique, className d'ajustement).
- **Conforme** : tout ✅ ou 🟠 cosmétique justifié.

La section « À remonter au DS » est aussi importante que les constats : une
page qui a dû tricher révèle souvent un manque du système, et c'est là que la
correction durable se fait.
