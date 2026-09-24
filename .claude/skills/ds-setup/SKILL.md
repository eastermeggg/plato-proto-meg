---
name: ds-setup
description: Installe le design system dans une app ou un repo, ou migre une codebase existante vers lui, par lots vérifiables. À utiliser pour "installe le DS", "ajoute le DS à mon app", "branche le DS sur ce repo", "migre vers le design system", "aligne cette codebase", "onboarde ce projet".
---

# ds-setup

Référence : conventions §1, §4, §5.

## 0. Install ou adopt ?
```bash
grep -rnoE "#[0-9a-fA-F]{3,8}\b" src | wc -l ; ls src/components
```
Repo vierge → **install**. Couleurs en dur ou composants maison → **adopt**.
Sans chemin du repo DS : demander. Rien ne s'écrase en silence : un
`globals.css`, `components.json` ou `ui/` existant → lister et demander.

## 1. Fondation (un lot, aucun écran touché)
- React 19 + Tailwind v4 ; alias `@/*` → `./src/*` vérifié (sous Vite, aussi
  `resolve.alias`).
- Dépendances : reprendre les versions du `package.json` du DS, jamais de mémoire.
- Copier : `ui/`, `custom/`, `lib/utils.ts`, `globals.css`, `components.json`,
  `ds-theme.json`, `docs/`, `CLAUDE.md` (+ `AGENTS.md` symlink),
  `ds.manifest.json` (`role: consumer`), `scripts/`, `tests/visual/`,
  `.github/workflows/`, `.claude/skills/`, kitchen-sink.
- Fontes : depuis `fonts` du manifeste DS. Licence non validée → le dire.
- `SIGNALEMENTS.md` dans `.gitignore`.

Commit `chore(ds): fondation`.

## 2. Adopt seulement — migrer par lots
`<pm> run ds:doctor --report` donne le compteur. Lots par levier décroissant :
1. **Tokens**, valeurs les plus fréquentes d'abord. Valeur proche d'un token →
   ce token. Couleur sans token évident → décision en attente, pas de token
   « de transition ».
2. **Composants maison**, un par un : `ds-decide`, migration des usages et
   **suppression de l'ancien dans la même PR**.

Le garde-fou ne devient bloquant en CI qu'à zéro constat.

## 3. Vérifier
`ds:doctor`, `lint`, `build`. Test de portabilité : `src/components/` +
`globals.css` compilent dans un projet Vite. Premières baselines : PR + label
`ds-baselines`.

## Livrable
`templates/setup-plan.md` tenu à jour ; ligne « Design system — source,
version, mode copie » dans le README.
