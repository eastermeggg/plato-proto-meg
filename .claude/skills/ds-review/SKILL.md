---
name: ds-review
description: Vérifie qu'une page, un écran, un composant ou une PR (souvent générés par IA) respecte le design system, avec preuves fichier:ligne et correctifs. À utiliser pour "review cette page", "est-ce que ça respecte le DS", "c'est cohérent ?", "relis ce que l'agent a produit", une PR à valider, ou en fin de ds-build. Juge UNE production, pas le DS entier (ça, c'est ds-audit).
---

# ds-review

Le référentiel est le DS et le kitchen-sink, jamais une maquette. Pas de
constat sans preuve.

## 1. Preuves mécaniques d'abord
```bash
<pm> run ds:doctor --base main && <pm> run lint && <pm> run build
```
Chaque sortie non vide est un ❌ avec sa preuve. Ne pas refaire à la main.

## 2. Ce que les outils ne voient pas
- **Composants** : tout vient de l'inventaire ; pas de composant local qui
  refait un rôle existant ; pas d'usage contraire à « quand l'éviter » ; pas
  de `deprecated` ; pas de `className` d'ajustement.
- **Hiérarchie** : une action primaire ; typo et icônes selon les conventions.
- **États** : les cinq ; chargement à la structure finale ; erreur avec reprise.
- **Accessibilité** : focus visible non neutralisé ; boutons icône avec
  `aria-label` ; champs reliés à un `Label` ; statut jamais porté par la
  couleur seule ; overlays qui rendent le focus ; un `h1`, pas de saut de niveau.
- **Visuel** : aucun diff sur un composant que la PR ne touche pas.

## 3. Verdict
- **Non conforme** : un ❌ de `ds:doctor`, composant hors inventaire, focus,
  clavier ou libellé cassé. Pas mergeable.
- **Avec réserves** : état manquant, composition non canonique, `className`
  d'ajustement.
- **Conforme** : le reste.

## Livrable
`templates/review.md` : verdict, **5 correctifs max** par ordre de levier, ce
qui est à remonter au DS (→ `SIGNALEMENTS.md`). Le détail complet reste dans
la sortie des outils, pas dans le rapport.
