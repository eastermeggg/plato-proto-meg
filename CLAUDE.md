# CLAUDE.md

@AGENTS.md

Spécificités Claude Code (le reste vit dans `AGENTS.md`) :

- Skills `ds-*` : `.claude/skills/` (config lue dans `ds.manifest.json` ; en cas
  de conflit avec les défauts des conventions, le manifeste fait foi).
- Après édition d'une fiche `src/components/ui/*.md` : `npm run ds:docs`.
