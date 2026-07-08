# Relevé d'heures — explainer video (Remotion)

A ~39s animated explainer for the **Saisie / Suivi des heures (droit social)** feature,
built with [Remotion](https://remotion.dev) in the Plato design language (stone + cream + blue).

## Output
`out/releve-explainer.mp4` — 1920×1080, 30fps.

## Scenes (`src/scenes.jsx`)
1. **Title** — Relevé d'heures · Suivi des heures · Droit social
2. **Context** — reconstituer les heures (rappel d'heures supplémentaires)
3. **Chiffrage** — le relevé, entrée du chiffrage suggérée par l'agent
4. **Période + partage** — Définir la période (proposée par l'agent) → popover de partage
5. **Client** — accès par lien, saisie mois par mois (navigateur d'année), progression
6. **Duplication** — jour / semaine / mois, sans écraser les saisies
7. **Total → chiffrage** — le total alimente les postes (rappel HS, CP afférents)
8. **Outro** — un seul relevé, synchronisé

## Commands
```bash
npm install
npm run studio     # live edit in Remotion Studio (localhost)
npm run render     # → out/releve-explainer.mp4
```
Render a single frame: `npx remotion still src/index.js Explainer out/frame.png --frame=665`

Palette + fonts live in `src/theme.js`; reusable UI primitives in `src/ui.jsx`.
