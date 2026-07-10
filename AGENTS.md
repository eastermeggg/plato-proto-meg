# Agents

This file is read by AI coding assistants. Edit freely outside the Lyse-managed block.

## Project & toolchain

Norma is a design prototype built with **Create React App** (React 18, JavaScript — not TypeScript) and **Tailwind CSS v3**. Config files that define the toolchain in scope:

- `package.json` — dependencies and scripts (`npm start`, `npm run build`, `npm test`)
- `tailwind.config.js` — Tailwind theme extension
- `postcss.config.js` — PostCSS pipeline for Tailwind
- `.lyse.yaml` — design-system audit config (run `npx lyse audit`)

### Design system

- `src/design-system/tokens.js` — canonical color / spacing / type tokens (single source of truth)
- `src/index.css` — global styles and CSS custom properties
- `src/components/ui-kit/previews.jsx` — reusable UI primitives (Button, Modal, Sheet, Table, …)
- `lyse.components.json` — machine-readable component manifest
- `llms.txt` (repo root) — top-level map of the design system

### Conventions

- No emojis in UI; prefer hyphens over em-dashes in copy.
- Use design tokens from `tokens.js` rather than hardcoded hex/spacing values.
- Run `npx lyse audit` before shipping to check design-system conformance.

## Lyse audit (auto-managed)

<!-- lyse-managed:begin -->
### Validate design-system conformance

```bash
pnpm exec lyse audit
```

Exit codes:
- 0 — pass (Health Score ≥ project threshold)
- 1 — fail (Health Score below threshold or hard errors)
- 2 — config error
<!-- lyse-managed:end -->
