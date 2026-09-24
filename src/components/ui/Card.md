---
name: Card
package: plato
type: primitive
status: draft
usage: Surface carte générique - Header (titre + description) / Content / Footer
description: >
  Base shadcn tokenisée, aucun design custom (décision steward 24/09) :
  surface card bordée border, radius 12, élévation sm. Slots CardHeader
  (titre 16/24 semibold + CardDescription muted), CardContent, CardFooter
  (paddings 24, contenu pt-0). Code-first - la référence est le vanilla
  shadcn Card traduit en tokens.
figma: null
file: src/components/ui/Card.js
source: src/components/ui/Card.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: Card
variants: [default]
tokens: [colors.semantic.card, colors.semantic.cardForeground, colors.semantic.border, colors.semantic.mutedForeground, radius.xl, shadows.sm]
lastValidated: 2026-09-24
---

# Card

> **Type** Primitive · **Status** Pending (2026-09-24) · **Usage** surface carte générique
> **Figma** - (code-first, base shadcn) · **File** `src/components/ui/Card.js`

## Pattern / Variants / Examples

### When to use
- Bloc de contenu autonome sur une page : carte d'info, bloc de réglages,
  résumé, empty state encadré.

### When NOT to use
- **Modale** → `Dialog` / `AlertDialog`.
- **Rangée de liste/table** → `Item`, `DataTableCell` + `ui/tables`.
- **Panneau de préviz** → `PreviewPanel`.
- **Carte-option cliquable d'un choix** → `RadioPricing`.

### Props
`Card` + `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` /
`CardFooter` - tous acceptent `className` / `style` (layout uniquement).

### Examples
```jsx
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from 'src/components/ui/Card';

<Card style={{ width: 360 }}>
  <CardHeader>
    <CardTitle>Boîtes connectées</CardTitle>
    <CardDescription>Les emails alimentent le dossier automatiquement.</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
  <CardFooter><Button label="Connecter" /></CardFooter>
</Card>
```

### Tokens used
`card` / `cardForeground` (surface, titre) · `border` · `mutedForeground`
(description) · `radius.xl` (12) · `shadows.sm`.

## Sprint / Explos

- Promu le 24/09/2026 (dernier gap « conteneur » du DS-only). Cible : ~53
  surfaces cartes ad-hoc (`bg-surface border rounded-lg p-…`) relevées par
  l'audit - plan de migration :
  `.context/steward-review/CARD-MIGRATION-PLAN.md` (par écran, pas de sweep
  aveugle ; radius/ombre convergent vers xl/sm).

## Proto demo

`/ui-kit/c/Card`
