---
name: LoiHoverCard
package: plato
status: beta
usage: Identity card of an article de loi shown on hover of an inline reference
source: src/components/ui/LoiHoverCard.js
demo: src/components/ui-kit/LoiHoverLab.js
replacedBy: null
---

# LoiHoverCard

Hover popover for articles de loi cited in prose: the reference (`LoiRef`, famille TEXTE violet + glyphe §) shows the card after a deliberate hover - statut badge, extrait, version fields, pied Légifrance. « Voir l'article » opens the full source (PreviewPanel kind `loi`). Beta: entrée d'inventaire à créer via le flux steward (`/ui-kit/inventory`).

## When to use
- Citing an article de loi inside any prose (motifs d'une décision, corps Word d'un acte, alinéas) - wrap the reference so readers preview without leaving the text.
- Rich text mixing strings and references → `LoiText`.

## When NOT to use
- **Full reading of the article** → `PreviewPanel` kind `loi` (the card's « Voir l'article » already routes there).
- **Non-loi sources** (pièce, JP, web) → `SourceBadge` + `PreviewPanel`.
- **Static galleries** → `LoiCard` (the card alone, no hover logic).

## Props
| Prop | Type | Default | Notes |
|---|---|---|---|
| `article` | object | — | `{ article, code, statut, extrait, creeLe, version, modifiePar, abrogePar, legifranceId, url }` |
| `onOpen` | `(article) => void` | — | opens the full source (PreviewPanel `loi`) |
| `children` | node | — | the trigger, canonically a `LoiRef` |
| `openDelay` / `closeDelay` | number | `300` / `160` | hover intent timing (ms) |

Also exports: `LoiRef` (inline trigger), `LoiCard` (static card), `LoiText` (rich text with references), `loiSourceOf` (maps a fiche article to a PreviewPanel `loi` source).

## Examples
```jsx
import LoiHoverCard, { LoiRef, LoiText } from 'src/components/ui/LoiHoverCard';

<LoiHoverCard article={art} onOpen={openArticle}>
  <LoiRef>L. 1221-6</LoiRef>
</LoiHoverCard>

<LoiText text={["Aux termes de ", { loi: art }, ", le contrat…"]} onOpenArticle={openArticle} />
```
