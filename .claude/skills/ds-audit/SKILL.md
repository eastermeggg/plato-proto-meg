---
name: ds-audit
description: Fait l'état du design system ENTIER — fiches manquantes, frontières de packages, tokens, composants deprecated encore utilisés, ajustements répétés qui trahissent un variant manquant — et transforme les constats en issues. À utiliser pour "audite le DS", "qu'est-ce qui manque", "état des lieux", "trouve les doublons", "crée les issues", avant une release, ou avant de merger une branche avec un SIGNALEMENTS.md non vide.
compatibility: gh authentifié pour créer des issues.
---

# ds-audit

Référence : conventions §2. Ne corrige rien.

## Commandes
```bash
node scripts/ds-audit.mjs                          # rapport
node scripts/ds-audit.mjs --create-issues          # + issues ds-gap/triage, dédupliquées
node scripts/ds-audit.mjs --harvest --create-issues  # SIGNALEMENTS.md → issues
```

Le script agrège uniquement des constats prouvés : `ds:doctor --report`,
fiches (`ds-check-docs`), frontières (`ds-check-boundaries`), `deprecated`
encore importés, `className` identique posé sur un même composant DS dans
≥ 2 fichiers (variant probable).

Il déduplique contre les issues ouvertes `ds-gap` par titre, et regroupe par
rôle : douze occurrences font une issue, avec douze preuves.

## Le rôle de l'agent
1. Lancer le rapport, le lire.
2. Rendre **5 constats max** : ceux qui débloquent le plus. Le reste est dans
   le fichier `docs/audits/<date>.md` écrit par le script.
3. Signaler ce qui relève d'`ECARTS.md` (dette assumée) ou de `ds-promote`
   (élément local qui mérite d'entrer) plutôt que d'une issue.
4. `--create-issues` quand l'utilisateur le demande, ou en `--harvest` avant un
   merge. Les issues naissent en `triage` : le steward les trie en lot.

Pas d'heuristique en prose : un constat que le script ne produit pas n'est pas
dans l'audit. Si un manque revient souvent, en faire un check dans le script.
