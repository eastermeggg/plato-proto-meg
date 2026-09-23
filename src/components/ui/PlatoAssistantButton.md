---
name: PlatoAssistantButton
type: composite
status: pending
usage: Le CTA d'ouverture de l'assistant Plato (pilule blanche + halo brand)
description: >
  Pilule blanche « Plato Assistant » : glyphe Sparkle IA, libellé Inter Medium 14,
  halo orange flouté clippé au bas + anneau à comète brand (fallbacks bord statique
  sans conic-gradient / en reduced-motion).
figma: https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37444-5885
file: src/components/shell/PlatoAssistantButton.js
inventoryId: PlatoAssistantButton
states: [default, hover]
tokens: [colors.brand.DEFAULT, colors.semantic.foreground, colors.semantic.borderStrong]
---

# PlatoAssistantButton

> **Type** Composite · **Status** Pending · **Usage** ouvrir le rail Plato Assistant
> **Figma** [Plato Assistant Button](https://www.figma.com/design/0eKtlRkT1Hbjh8Nqd47Woy/Plato---System?node-id=37444-5885) · **File** `src/components/shell/PlatoAssistantButton.js`

## Pattern / Variants / Examples

### When to use
- Rouvrir l'assistant Plato depuis la TopBar d'un dossier quand le rail est fermé.

### When NOT to use
- Une action générique → `Button`. C'est un CTA de marque, réservé à l'assistant.

### Props
| Prop | Type | Rôle |
|---|---|---|
| `onClick` | () => void | ouvre le rail assistant |

### Tokens used
`colors.brand.DEFAULT` (halo + comète), `colors.semantic.foreground` (glyphe +
libellé), `colors.semantic.borderStrong` (anneau de base / fallback).

## Sprint / Explos

- Surfacé le 22/09. Déclinaison pilule du glow hero (BrandOrangeLab). Utilisé par `TopBar`.

## Proto demo

Visible en contexte : à droite de la TopBar d'un dossier quand l'assistant est fermé.
