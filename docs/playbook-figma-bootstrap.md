# Playbook — monter un DS depuis un Figma

À suivre une fois, au démarrage. Chaque phase produit un artefact validé par un
humain avant la suivante. Jamais « recrée le DS depuis le Figma » en un prompt.

1. **Décisions** (humain) : stack (défaut Next 15 + React 19 + Tailwind v4 +
   shadcn + lucide), packages (`ui-product` / `ui-marketing` déclarés dans le
   manifeste dès maintenant), Figma à Variables ou valeurs en dur.
2. **Scaffold** : `ds-theme.json` puis `npx shadcn@latest init ./ds-theme.json`.
   Kitchen-sink qui importe `demos/index.ts` et ne contient aucune démo.
   Tag `v0-scaffold`.
3. **Tokens** : `ds-figma-sync` (premier relevé) → table de réconciliation
   `token Figma | shadcn | actuel | Figma | écart | aliaser · créer · ignorer`,
   **validée** → application à `ds-theme.json`. Tag `v0-tokens`.
4. **Couche agentic, avant les composants** : `CLAUDE.md` (règles dures),
   `AGENTS.md`, `ds:doctor` testé avec un composant volontairement fautif,
   `ds-check-boundaries` testé avec un import interdit, skills copiées.
   Tag `v0-agentic`. Paralléliser seulement après.
5. **Composants** : tri écran par écran, arbitré par un humain — (a) shadcn
   thémé ~80 %, (b) + variant ~15 %, (c) vrai custom ~5 % via `ds-figma-build`.
   `shadcn add` en batch sur `main`, seulement le tri. Familles en parallèle,
   chacune avec démo `data-demo`, inventaire, fiche.
6. **CI** : lint, `ds:doctor`, build, `protected-paths`, `ds-visual`,
   `ds-changelog`. Premières baselines par label. Le steward fixe `figma.mode`.
7. **Handoff** : `HANDOFF.md`, et la preuve : « ajoute un écran de [cas réel] »
   en live, sans l'auteur.
