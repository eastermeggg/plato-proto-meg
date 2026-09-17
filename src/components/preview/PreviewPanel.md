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

### Entry points - what's the *subject*: a pièce, or a ligne?

The same panel is triggered from three surfaces, and the **trigger decides what the
panel is *about*** - which in turn drives the whole framing (header identity + which
edit surface, if any). Two things can be the subject:

- a **pièce** - the document itself is the object; or
- a **ligne** - a poste line whose value must be justified; the document is then shown
  *as that ligne's attached pièce*, not as the subject.

| Trigger surface | Subject | Title-bar identity | Edit surface | Document |
|---|---|---|---|---|
| **Onglet Pièces / bordereau** | pièce | **PIÈCE** (blue accent, file icon) | inline metadata - **Modifier** swaps chips → `Input`s | the doc, full width |
| **Chat - citation** | the cited source (`piece`/`jp`/`loi`/`email`/`ligne`) | that kind's accent | read-only (verify); doc kinds keep inline metadata edit | scrolled to the passage |
| **Poste / chiffrage row** | **ligne** | **LIGNE** (neutral, eyebrow = poste: PGPA / DFT / DSA / social…) | **value rail** on the right - schema fields + derived summary + Supprimer/Enregistrer | the attached pièce, under a distinct **PIÈCE** band |

Rules that follow from this:

- **Pièce-only never shows the value rail.** Editing a pièce means editing *its own
  metadata*, inline in the meta header (the `Modifier` toggle). The doc keeps full width.
- **Ligne mode reframes the doc as "the attached pièce".** The title bar carries the
  ligne (neutral `Rows3` icon, eyebrow = poste, title = libellé, nav = "ligne i / N");
  a separate blue **PIÈCE** band sits above the document (name + découpé chip +
  Télécharger). The right rail edits the *ligne's values*, never the doc's metadata.
- **A ligne can cite several pièces.** The document shows the primary one; the rail's
  "Pièces justificatives" lists all of them + a search-to-attach control.
- **One shell, two right-zones.** Only the title-bar identity and the right zone change
  (inline metadata edit for a pièce · value rail for a ligne). Body, footer, passage
  contract, chrome, and the 44px header / 56px footer grid are identical.

The ligne framing is **generic across poste types** - `fields` (a per-poste schema of
typed inputs), a derived `summary` block, and `piece.kind` (which document skeleton to
render) are the only things that vary. Same panel serves PGPA (revenu → bulletin),
social (heures supp → contrat), DFT (classe/indemnité → expertise), DSA (facture →
reste à charge). Chosen layout: a **360px right rail**, doc `flex-1` dominant (over a
top-dock variant). Now **merged into `PreviewPanel`**: pass a `ligne` prop (subject =
ligne) alongside the pièce `source`; the panel swaps the title-bar identity, renders the
value rail in place of the citations rail, and relabels the metadata edit "Modifier la
pièce". Demoed in `/ui-kit/preview-panel` via the "Sujet : Pièce / Ligne" toggle.

### Layout & ratios

One full-height column. Two layouts, decided by subject.

**Ligne subject - full screen, no overlay.** The panel fills the canvas edge-to-edge to
the LEFT of the chat (`right: --chat-offset`, no dimmed backdrop; close via ✕ / Esc). The
body row is two columns:

| Zone | Width | Notes |
|---|---|---|
| Document | `flex-1` (fluid) | dominant, left |
| Edit rail | **360px, `max-w-[42%]`** | right; caps on small screens so the doc keeps ≥58% |

Between them, a 1px `bg-border` divider. **Small-screen rule:** the side rails are capped
in % of the available width so the document never collapses - edit rail `max-w-[42%]`,
citations rail `max-w-[38%]` (and hidden below `md`). (Fuller solution if needed later: the
edit rail becomes a floating overlay under a breakpoint.) Order is **doc-left / edit-right** (a lab toggle
can invert to compare, but this is the chosen order: the doc is what you read, the rail +
chat are the action surfaces grouped on the right).

**Why a fixed-width rail, not a fractional 2/3-1/3.** At a normal panel width 360px ≈ 1/3,
so the "doc gets ~2/3" intent holds; but a pure `w-1/3` crushes the form on narrow screens
and stretches it on wide ones. A fixed rail keeps fields legible at any width and the doc
always dominant. (An earlier arbitration also tested a top-dock form over a full-width doc -
rejected: it costs vertical space and clips a portrait page.)

**Pièce subject.** Meta bar full-width, document full-width + optional citations rail
(`w-[240px] lg:w-[300px]`), footer full-width - no fixed edit rail (metadata edits inline).

**Shared vertical grid** (so both columns line up across the divider):

| Band | Height |
|---|---|
| Title bar | 48px (`h-12`) |
| Meta band / rail "Modifier la ligne" header | **44px**, `items-center` |
| Footers (doc viewer + rail actions) | **52px** |

**Document viewer.** Paper padding `py-5 px-5`; fit-width = `min(container − 40, 980)`.

**Chat.** Lives on the right, **resizable** via a left-edge grip; the panel's `right` offset
tracks the chat width live so the panel stays flush-left of the chat at any width.

### Metadata: read vs edit (doc kinds)

`piece` and `modele` carry the full metadata treatment: a **header** bar renders the
chip row (Pièce · Date IA · Type · Découpé · Provenance) with a **Modifier** toggle
top-right that swaps the read chips for the design-system `Input` components (Nom,
Type, Date IA, Section, Numéro, plus the "document découpé - Ajuster" callout); the
AI summary is a one-line clamp with a Détails/Réduire expander. Télécharger is a
visible dark primary button; Supprimer lives in an overflow ⋯ menu. The other kinds
(jp/email/loi/ligne) render header chips only - no edit, since they are enriched
records, not user-owned documents.

### Citations rail

When the source carries at least one passage, a 280px right rail appears listing
every citation: page + quote preview + active state. Complements the footer stepper
(cycle) with a scan surface (see them all, pick one). Same tokens as the inline
highlight (warning family), so the rail row and the doc-page chunk visibly belong to
the same signal. Absent when the source has no passages - the body reclaims the
full width.

### Cross-source navigation (provenance & attachments)

Sources link to each other, and the panel hands off between them via `onOpenSource({ kind, source })`:

- **A doc issued from an email** carries `source.provenance` and shows an "Issu de l'email
  · {objet}" chip (read) / callout (edit) with a **Voir l'email** action that opens the
  email source.
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

The trigger surface carries **two** upstream decisions, not one: the *locus* (scroll or
open-at-top, above) **and** the *subject* (pièce vs ligne, see "Entry points"). A poste /
chiffrage row emits both a ligne subject and a locus into its pièce; the Pièces tab emits
a pièce subject and no locus; a chat citation emits the cited source + its locus.

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
- **DS tokens throughout** - citation highlight = `banner.warning` tint, AI marker =
  `banner.ai.accent`, text links = `link`, delete hover = `danger`, mono labels =
  `typography.fontFamily.mono`; the JP quantum chip is the shared `Badge` (info). Two
  local palettes remain by design - the per-kind accents (`PREVIEW_KINDS`) and the 5
  authority tints - both candidates for token promotion via `/ui-kit/tokens`.

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

When the **subject is a ligne** (poste / chiffrage trigger), the source is wrapped by a
ligne descriptor instead of standing alone:

```js
ligne = {
  poste,                       // 'PGPA' | 'DFT' | 'DSA' | 'SOCIAL' | … → title-bar eyebrow + badge tint
  titre,                       // ligne libellé, shown as the panel title
  fields: [                    // per-poste edit schema, rendered by one FieldControl
    { label, type, value, full?, options?, suffix? },
    // type ∈ text | date | money | number | percent | select
  ],
  summary: [{ label, value, strong? }],  // derived / computed rows (coefficient, reste à charge…)
  pieces: [name, …],           // all justificatives (rail list + search-to-attach)
  piece: { kind, name, org, split },      // the primary doc shown in the body
  // piece.kind ∈ bulletin | facture | contrat | expertise → which DocPaper skeleton
}
```

The panel switches framing on whether it receives a `ligne` (subject = ligne, value
rail) or a bare `source` (subject = pièce/record). Everything else is shared.

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
  every kind, edit mode, multi-chunk, and the **Sujet : Pièce / Ligne** toggle (the
  ligne-as-subject value rail, merged in from the former standalone arbitrage lab)
- The `preview-doc` viewer (`PreviewDocLab.js`) was **merged into this component** and
  removed; its viewer + edit capabilities now live here for doc kinds
- `src/components/jp/DecisionDrawer.js` - JP body + `highlightPosteIds` to fold in
- Notion "Scroll automatique des previews documents" (hexacc)
