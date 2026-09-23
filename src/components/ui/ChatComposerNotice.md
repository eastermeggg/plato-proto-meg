---
name: ChatComposerNotice
type: custom
status: pending
usage: Status banner above the chat composer (analyzing / quota)
description: >
  Bandeau d'état posé au-dessus du composer : analyzing (Plato réfléchit,
  gif), quota-warning (jauge d'usage hebdo), quota-full. Code-first - pas de
  nœud Figma, le code est la source.
figma: null
file: src/components/ChatComposerNotice.js
inventoryId: ChatComposerNotice
variants: [analyzing, quota-warning, quota-full]
tokens: [colors.semantic.muted, colors.avatar, colors.feedback.warning, colors.feedback.destructive]
lastValidated: 2026-09-23
---

# ChatComposerNotice

> **Type** Custom · **Status** Pending (2026-09-23) · **Usage** bandeau d'état du composer
> **Figma** aucun - code-first · **File** `src/components/ChatComposerNotice.js`

## Pattern / Variants / Examples

### When to use
- `analyzing` : Plato travaille - le composer reste visible mais annonce le
  traitement en cours.
- `quota-warning` / `quota-full` : la jauge d'usage hebdo approche / atteint
  100 % (modèle pricing licences + usage) ; CTA vers l'usage et l'upgrade.

### When NOT to use
- **Erreurs de conversation** → message d'erreur dans le fil, pas un bandeau.
- **Bannières marketing** → `NavPromoBanner` / bannières dédiées.

### Props
`variant` ('analyzing' | 'quota-warning' | 'quota-full') · `pct` (usage %) ·
`onOpenUsage` · `onRequestUpgrade`. Variant inconnu → rien (null).

### Tokens used
`semantic.muted` + `ring` (analyzing) · `avatar[3].bg` + `warning.text`
(quota-warning) · `destructive.border/text` (quota-full).

## Sprint / Explos

- Né avec l'épic pricing (jauge d'usage hebdo, memory `project_pricing_model`).

## Proto demo

`/ui-kit/c/ChatComposerNotice` — les 3 variants.
