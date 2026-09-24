---
name: ds-variant
description: Ajoute un variant (apparence, taille, état) à un composant existant sans changer son rôle ni son API. À utiliser pour "un variant", "une version soft/outline/compact/danger de…", "une taille en plus", "le même bouton mais…", ou quand ds-decide conclut au palier 3.
---

# ds-variant

Référence : conventions §3 (protégés), §5 (visuel), §7 (fiche).

Le rôle change ? Ce n'est pas un variant : `ds-decide`.

## Lire
Le composant, sa démo, `docs/design-system.md` → Variants ajoutés (ne pas
recréer un variant existant sous un autre nom),
`node scripts/ds-changelog.mjs --component <nom>`.

## Où le mettre — dans cet ordre
1. **Clé `css` de `ds-theme.json`** si le besoin s'exprime en CSS sur
   l'existant. Survit aux régénérations. Sur `main`.
2. **cva du composant `custom/`**, librement.
3. **cva d'un composant `ui/`**, en dernier recours (nouvelle valeur de prop).
   Ne pas éditer : bloc `templates/variant.md` dans `SIGNALEMENTS.md`. Le
   steward l'applique sur `main` entre
   `// --- DS variants ---` et `// --- fin DS variants ---`.

Jamais un wrapper `custom/` qui réexporte un `ui/` : c'est un doublon.

## Construire
Entrée dans `variants` du cva · tokens uniquement (`bg-primary/10` autorisé) ·
hover, focus-visible, disabled définis · vocabulaire existant (`destructive`,
pas `danger`) · ne pas toucher aux autres variants.

## Fini quand
- démo : le variant dans toutes les lignes d'états, light et dark ;
- « Variants ajoutés » à jour ;
- `ds:doctor` et `build` OK ;
- baselines du seul composant validées par label `ds-baselines`.
