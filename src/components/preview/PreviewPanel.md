# PreviewPanel

One systematized preview panel for every citable source in Norma. A single shell
(title bar · metadata header · body · footer) whose body, metadata, and footer are
chosen by a `kind` discriminator, plus one contract shared by all kinds: a cited
source opens scrolled to the exact passage it backs, highlighted.

**File:** `src/components/preview/PreviewPanel.js` · **Lab:** `/ui-kit/preview-panel`

## Why

When the assistant, a chiffrage row, or an acte cites a source, the lawyer needs to
verify it before relying on it. Until now every citation type had its own ad-hoc
drawer (`chatPreviewPiece`, `DecisionDrawer`, `LinePanel`, `renderPieceOverviewPanel`),
none of which landed on the passage that justified the claim - a 40-page rapport
opened at page 1, forcing a manual hunt. In legal work an unverifiable citation is
worse than none. This unifies the drawers into one panel and makes "land on the
passage" a first-class, reusable behavior.

## How it works

Every source kind renders through the same shell. Three zones vary by `kind`; the
rest - flush-left-of-chat positioning, prev/next navigation, close, zoom/fullscreen,
and the passage contract - is shared.

| Kind | Opens | Body | Footer | Passage |
|---|---|---|---|---|
| `piece` | internal previewer | paginated doc canvas | zoom · fullscreen · page nav | page + highlighted quote |
| `modele` | internal previewer | paginated doc canvas | zoom · fullscreen · page nav | - (browsing) |
| `jp` | DecisionDrawer + Légifrance link | decision prose (faits/moyens/motifs/dispositif) | search · citation | highlighted attendu |
| `email` | thread drawer | stacked messages | search · citation | anchored/ringed message |
| `loi` | light internal panel + Légifrance link | article (short, no pagination) | none | - (article is the passage) |
| `ligne` | structured view + BOSS link | cotisation/relevé table | none | highlighted row |
| `web` | external tab | none (ExternalCard explains) | none | - |

### Metadata: header vs side, read vs edit (doc kinds)

`piece` and `modele` carry the full metadata treatment merged in from the `preview-doc`
viewer. Metadata renders either in a **header** bar (frees the full width for the
document, default) or in a 320px **side panel** (`metaLayout` prop). In header mode a
**Modifier** toggle swaps the read chips for the design-system `Input` components (Nom,
Type, Date IA, Section, Numéro, plus the "document découpé - Ajuster" callout); the AI
summary is a one-line clamp with a Détails/Réduire expander. Download is a dropdown
(Document original). The other kinds (jp/email/loi/ligne) render header chips only - no
side/edit, since they are enriched records, not user-owned documents.

### Cross-source navigation (provenance & attachments)

Sources link to each other, and the panel hands off between them via `onOpenSource({ kind, source })`:

- **A doc issued from an email** carries `source.provenance` and shows an "Issu de l'email
  · {objet}" chip (header) / callout (side, edit) with a **Voir l'email** action that opens
  the email source.
- **An email** lists every attachment as a previewable doc - a consolidated "Pièces jointes
  du fil (N)" card at the top plus clickable chips on each message; a click opens the
  attachment as a `piece`. The metadata header also shows a "Pièces jointes: N" count.

The round-trip is real: opening an email attachment lands on a pièce whose provenance points
back at that same email. Attachments without a `source` render disabled (nothing to preview).

### The passage contract

A source carries `passages: [{ page?, quote }]` (or a single `passage`, normalized).
On open, the panel highlights every passage, counts them from the DOM, and scrolls to
the active one (the chunk of the clicked pill via `source.activePassage`, else the
first). A "Aller à la citation" control re-centers it.

### Multi-chunk (one doc, several passages)

A document routinely backs more than one claim - a rapport cites both the consolidation
date (p.2) and the DFP rate (p.4); an acte cites the same pièce at five facts. All
chunks are highlighted at once; the footer shows a **"Citation i / N"** stepper with
prev/next, and the active chunk gets a stronger outline. Chunk order follows DOM order
(page, then position). Passages on the same page render as separate highlights.

### When it scrolls - by surface, not by type

Scroll is triggered by the surface that created the pill, not the source type. The same
pièce pill scrolls or doesn't depending on where it was clicked:

- **Chat - assertion** ("DFP 12 %, Pièce 8 p.34") → carries a locus → scroll.
- **Chat - browse list** ("voici les pièces", JP search results) → whole-object pointer → open at top.
- **Chiffrage row** → always scroll; the row's entire purpose is that the number is
  justified, so the row→source link inherently carries a locus (a table row, an attendu,
  a rapport line). Already half-wired via `DecisionDrawer`'s `highlightPosteIds`.
- **Acte - edit/review** → scroll (the verification loop). **Acte - exported** → static, no panel.
- **Pièces tab / bordereau / sources panel** → browse → open at top.

The panel already models this: `passages` present → scroll; absent → open at top. The
design decision lives upstream - which surfaces emit a locus. Chat-assertions, all
chiffrage rows, and acte-citations-in-edit do; browse surfaces don't.

## Key decisions

- **One shell, pluggable zones over one component per type** - the drawers shared 80%
  chrome and diverged only in body/meta/footer; unifying kills four near-duplicate panels.
- **Scroll keyed to the surface, not the source type** - "is this a claim to verify or an
  object to browse?" is what determines a locus, and that's known at the citation site.
- **Ingested/authored → internal; web → external tab** - previewing a page we don't own is
  fake fidelity. JP and loi stay internal because we enrich them (quantum; version-at-date).
- **`passages` as an array from day one** - multi-chunk is the common case, not an edge; a
  single passage is just `N=1`.
- **Chunk order from the DOM, not the data** - bodies render highlights in reading order, so
  the stepper is correct without threading indices through every body renderer.

## Data model

```js
source = {
  name,                       // title shown in the bar
  // doc kinds (piece/modele):
  type, date, pages, section, numero, split, category, variables,
  // rich kinds carry a sub-object: jp{}, email{}, loi{}, ligne{}, url
  passages: [{ page, quote }],// or a single `passage`; absent → opens at top
  activePassage: 0,           // index of the clicked chunk (default 0)
  provenance: {               // doc kinds only - "issu de l'email"
    subject, from, date,
    open: { kind: 'email', source },  // target handed to onOpenSource
  },
}

// email attachments are previewable when they carry a source:
email.messages[].attachments: [{ name, source /* a piece-shaped source */ }]
// (a bare string attachment renders non-clickable)
```

`ligne` rows and `loi`/`jp`/`email` items mark a cited node with `cite: true`; the body
renders it with the highlight + `data-cite` anchor. Authority badges (`urssaf`, `boss`,
`impots`, `code`, `conv`, `none`) drive the `ligne` header tint.

## Component API

| Prop | Type | Description |
|---|---|---|
| `kind` | keyof `PREVIEW_KINDS` | selects body/meta/footer/accent |
| `source` | object | the source shape above |
| `onClose` / `onPrev` / `onNext` | fn | chrome actions |
| `navIndex` / `navTotal` | number | "x / n" pièce/result navigation (hidden if `navTotal <= 1`) |
| `embedded` | bool | lab card (`h-[720px]`) vs full drawer |
| `metaLayout` | `'header' \| 'side'` | doc-kind metadata placement (default `header`; ignored by non-doc kinds) |
| `onOpenSource` | `(target) => void` | cross-source hand-off (email attachment → piece; doc provenance → email) |

`PREVIEW_KINDS` is exported as the registry (label, icon, accent, footer type, `opens`
copy, external `link`).

## Edge cases

- **No passage** (browse pills) → no scroll, no "aller à la citation", opens at page 1.
- **Same-page multi-chunk** → each renders as its own highlight; stepper still counts both.
- **`loi` / `ligne` with a cite but footer `none`** → still highlighted and scrolled on
  open; no stepper (short/table sources rarely have multiple chunks).
- **Fullscreen** → panel goes `inset-0`; passage scroll re-runs against the resized canvas.

## Out of scope

- Real PDF rendering - bodies are skeletons; production swaps in react-pdf / pdf.js, the
  zoom/scroll/highlight UX is unchanged.
- Migrating the live App.js call sites onto `PreviewPanel` - still lab-only, like
  `preview-doc` was. Next step.
- Producing the locus (page+quote / anchor) from real citations - the agent/chiffrage/acte
  data layers must emit it; the panel only consumes it.

## Open questions

> How is the locus derived at each surface - agent emits page+quote, or full-text search
> of the quoted passage in the doc at click time? Recommendation: search-first (robust to
> re-pagination), agent's page number as a landing fallback.

## Related

- `src/components/ui-kit/PreviewPanelLab.js` - the lab (`/ui-kit/preview-panel`); demoes
  every kind, the header/side toggle, edit mode, and multi-chunk
- The `preview-doc` viewer (`PreviewDocLab.js`) was **merged into this component** and
  removed; its viewer + header/side + edit capabilities now live here for doc kinds
- `src/components/jp/DecisionDrawer.js` - JP body + `highlightPosteIds` to fold in
- Notion "Scroll automatique des previews documents" (hexacc)
