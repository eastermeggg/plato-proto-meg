---
name: Card
package: plato
status: beta
usage: Surface carte générique - Header (titre + description) / Content / Footer
source: src/components/ui/Card.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: null
---

# Card

Surface carte générique : base shadcn tokenisée, aucun design custom (décision steward 24/09). Surface `card` bordée, radius 12, élévation sm ; slots CardHeader (titre semibold + CardDescription muted), CardContent, CardFooter.

_Beta - pending steward validation (issue #__)._

## When to use
- Bloc de contenu autonome sur une page : carte d'info, bloc de réglages, résumé, empty state encadré.

## When NOT to use
- **Modale** → `Dialog` / `AlertDialog`.
- **Rangée de liste/table** → `Item`, `DataTableCell` + `ui/tables`.
- **Panneau de préviz** → `PreviewPanel`.
- **Carte-option cliquable d'un choix** → `RadioPricing`.

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `children` | ReactNode | — | slot content |
| `className` / `style` | — | — | layout only (no design override) |

Slots (same signature): `Card` · `CardHeader` · `CardTitle` · `CardDescription` · `CardContent` · `CardFooter` — each accepts `children`, `className`, `style`.

## Examples
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
