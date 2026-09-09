# ReasoningStepper

Displays the AI agent (Plato) reasoning steps in the chat sidebar. Streams steps progressively with a processing animation, auto-collapses into a summary header when done, and supports expand/collapse for inspection. Handles CRUD grouping, sub-agents, and error states.

**File:** `src/components/ReasoningStepper.js`

---

## Exports

| Export | Type | Description |
|---|---|---|
| `default` (ReasoningStepper) | Component | Full reasoning stepper — streaming, collapsed, expanded states |
| `ThinkingDots` | Component | Three pulsing dots (staggered 1.2s animation) |
| `PlatoDotGrid` | Component | 3x3 diamond grid — AI avatar icon |
| `CrudPill` | Component | Colored pill with diamond: ajout (green), modif. (orange), suppr. (red) |
| `DotCounter` | Component | Diamond + count label — used in collapsed header |
| `STEP_COLORS` | Object | Color token palette (default, green, orange, red + muted/primary/secondary) |
| `STEP_TYPE_CONFIG` | Object | Maps step `type` to `{ Icon, color, pill? }` |
| `BACKEND_TOOL_MAP` | Object | Maps real backend tool names to `{ type, label }` |
| `normalizeStep` | Function | Converts any step shape (new, backend, legacy) to normalized `{ type, label, status }` |
| `groupSteps` | Function | Groups consecutive same-type+same-poste CRUD steps into expandable parent rows |

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `steps` | `Step[]` | `[]` | Ordered list of steps (any shape — auto-normalized) |
| `status` | `'streaming' \| 'done' \| 'error'` | — | Component lifecycle state |
| `summary` | `string` | — | Text shown in collapsed header |
| `counters` | `{ add?, update?, delete?, error? }` | auto-computed | CRUD counts for header diamond counters |
| `expanded` | `boolean` | `false` | Whether the step list is visible below the header |
| `onToggle` | `() => void` | — | Called when the collapsed/expanded header is clicked |
| `label` | `string` | `''` | Fallback label (legacy, streaming with no steps) |
| `done` | `boolean` | — | **Deprecated** — use `status` instead. `done={true}` maps to `status='done'`. |

---

## Examples & stages

Component designed to integrate streaming of agent actions, but also designed for V1 where there is no per-action streaming — instead, a single streaming process runs, and at the end, the full payload is displayed (reflecting the trace and all actions performed).

### Live streaming

Steps stream one by one in real-time. Each step shows `plato-thinking.gif` (12px) in the icon slot while active, then swaps to its final icon when done. No header during streaming — steps are shown flat.

**Reasoning (streaming):**

```jsx
<ReasoningStepper
  status="streaming"
  steps={[
    { type: 'read_documents', label: 'Analyse de 4 documents', status: 'done' },
    { type: 'extract_data', label: 'Extraction facture CHU', status: 'loading' },
  ]}
  onToggle={() => {}}
/>
```

**Finished inspectable:** collapsed header (click to expand all steps).

```jsx
<ReasoningStepper
  status="done"
  summary="Complétion du poste DSA depuis 3 factures"
  counters={{ add: 3, update: 1 }}
  steps={steps}
  expanded={expanded}
  onToggle={() => setExpanded(v => !v)}
/>
```

### V1 — no per-action streaming

No step-by-step detail during processing. A single process runs, then the full trace payload arrives at once.

**Reasoning (processing):** show `plato-thinking.gif` + "Raisonnement en cours…" text. No steps, no stepper — just a visual indicator.

```jsx
// Simple processing indicator (not using ReasoningStepper):
<div className="flex items-center gap-2">
  <img src="/plato-thinking.gif" alt="" className="w-3 h-3" />
  <span>Raisonnement en cours…</span>
</div>
```

**Finished inspectable:** same as live streaming — full payload displayed as collapsed header, click to expand.

```jsx
<ReasoningStepper
  status="done"
  summary={payload.summary}
  counters={payload.counters}
  steps={payload.steps}
  expanded={expanded}
  onToggle={() => setExpanded(v => !v)}
/>
```

> **Note:** If the backend adds per-action streaming later, no component changes are needed — just switch from the simple gif indicator to `status="streaming"` with steps arriving incrementally.

---

## Anatomy

### StepIcon — type table

Each step has a `type` that determines its icon, color, and behavior. Resolved via `STEP_TYPE_CONFIG`.

| Type | Icon | Color | Pill | Example label |
|---|---|---|---|---|
| `read_documents` | DocLinesIcon (custom SVG) | default | — | Analyse de X documents |
| `read_rapport` | HeartPulse | default | — | Lecture du rapport d'expertise |
| `search_document` | SearchCode | default | — | Recherche dans le document |
| `extract_data` | AlignLeft | default | — | Extraction des données |
| `verify_data` | CheckCheck | default | — | Vérification des données |
| `summarize` | ListChecks | default | — | Synthèse des résultats |
| `calculate` | Calculator | default | — | Calcul du poste |
| `navigate` | Asterisk | default | — | Navigation vers le poste |
| `add_row` | Plus | green | `AJOUT` | X lignes ajoutées |
| `update_row` | Pencil | orange | `MODIF` | Mise à jour du champ |
| `delete_row` | SquareX | red | `SUPPR` | X lignes supprimées |
| `sub_agent` | Bot | default | — | Agent extraction factures |
| `error` | XCircle | red | — | Extraction impossible |

### StepItem states

| State | Icon slot | Background | Description |
|---|---|---|---|
| Default | Type icon (14px, muted color) | transparent | Normal completed step |
| Hover (expandable) | ChevronRight (secondary color) | `#f8f7f5` | CSS swap via `.step-row-expandable` |
| Processing | `plato-thinking.gif` (12px) | transparent | Step is being processed (`status: 'loading'`) |

### CrudPill

Diamond + uppercase mono label inside a tinted background. Three variants:

- **ajout** — green diamond, `#cce6d9` bg, `#064e3b` text
- **modif.** — orange diamond, `#f9ecd6` bg, `#855b31` text
- **suppr.** — red diamond, `#fef2f2` bg, `#7f1d1d` text

### DotCounter

Diamond + count number in mono font. Used in the collapsed header to show CRUD totals at a glance. Same three color variants as pills.

### CRUD grouping

Consecutive steps with the same `type` + same `poste` are automatically merged by `groupSteps()` into a single expandable parent row. Example: 3 consecutive `add_row` with `poste: 'DSA'` become one row "3 lignes DSA" that expands to show individual children.

---

## Tree (children & sub-items)

### Children behavior

- **1 child** → shown as inline description below the label (no expand, always visible)
- **2+ children** → expandable tree with vertical connector. Click the row to toggle. Count shown as `(N)` suffix when collapsed.

### Tree connectors

Vertical line: 1px `#dfdcda`, positioned in a 20px gutter centered under the parent icon (left: 12px). Horizontal branch: 10px per child row. Last child cuts the vertical line at 50%.

### Tree zones (leveling)

- **Level 0** — main step row
- **Level 1** — direct children (indent: 20px gutter + 20px branch)
- **Level 2** — sub-agent child steps (same tree pattern, nested inside the sub-agent block)

### Sub-agents

A `sub_agent` step has a Bot icon and contains nested steps via `children_steps`. These child steps are indented with tree connectors and behave like regular steps (expandable children, CRUD pills, etc).

```js
{
  type: 'sub_agent',
  label: 'Agent extraction factures',
  status: 'done',
  children_steps: [
    { type: 'extract_data', label: 'Facture CHU', status: 'done', children: ['4 500 EUR'] },
    { type: 'extract_data', label: 'Facture clinique', status: 'done', children: ['2 800 EUR'] },
  ],
}
```

---

## Step object shapes

### New shape (preferred)

```js
{
  type: 'extract_data',        // from STEP_TYPE_CONFIG
  label: 'Extraction facture CHU Bordeaux',
  status: 'done',              // 'done' | 'loading' | 'error'
  children: ['4 500 EUR'],     // optional sub-items (strings)
  poste: 'DSA',                // optional — for CRUD grouping
}
```

### Backend tool shape (auto-mapped)

Real Plato Supervisor tool names from PostHog traces. `normalizeStep()` maps them via `BACKEND_TOOL_MAP`.

```js
{
  tool: 'getPosteProblemDetector',
  detail: 'Verification des donnees DFT',   // overrides default label
  expandedText: '2 doublons detectes',       // becomes children[0]
}
```

| Backend tool name | Maps to type | Default label |
|---|---|---|
| `getPosteProblemDetector` | `verify_data` | Verification des donnees |
| `getHistoireSummaryTool` | `summarize` | Synthese des resultats |

To add more: add entries to `BACKEND_TOOL_MAP` in `ReasoningStepper.js`.

### Legacy frontend shape (auto-normalized)

Old simulation tool names, mapped via `LEGACY_TOOL_MAP`. Falls back to `calculate` if unknown.

```js
{
  tool: 'readExpertise',
  detail: 'Lecture du rapport',
  expandedText: 'Dr. Blanc',
}
```

### Normalization priority

`normalizeStep()` checks in order:

1. Already normalized (`step._normalized`) — return as-is
2. New shape (`step.type` in `STEP_TYPE_CONFIG`) — use directly
3. Backend tool (`step.tool` in `BACKEND_TOOL_MAP`) — map to type + label
4. Legacy tool (`step.tool` in `LEGACY_TOOL_MAP`) — map to type
5. Fallback — `calculate`

---

## Color tokens (`STEP_COLORS`)

| Token | Value | Usage |
|---|---|---|
| `primary` | `#44403c` | Step label text |
| `secondary` | `#78716c` | Description text, loading text, chevron icons |
| `muted` | `#a8a29e` | Default step icons, count suffix `(N)` |
| `default.icon` | `#a8a29e` | Non-CRUD step icons |
| `green.icon` | `#059669` | Add row icon, add diamond |
| `green.bg` | `#cce6d9` | Add pill background |
| `green.text` | `#064e3b` | Add pill text |
| `orange.icon` | `#bd6c1a` | Update row icon, update diamond |
| `orange.bg` | `#f9ecd6` | Update pill background |
| `orange.text` | `#855b31` | Update pill text |
| `red.icon` | `#991b1b` | Delete/error icon, delete diamond |
| `red.bg` | `#fef2f2` | Delete pill background, error background |
| `red.text` | `#7f1d1d` | Delete pill text, error text |

Additional UI colors (not in STEP_COLORS):

| Color | Usage |
|---|---|
| `#f8f7f5` | Hover background on expandable rows |
| `#dfdcda` | Tree connector lines |

---

## Internal sub-components

| Component | Description |
|---|---|
| `Diamond` | Rotated square (6px default) with subtle border+shadow. Used in pills and counters. |
| `IconSlot` | 16x16 slot — shows processing gif when loading, type icon when done, chevron on hover for expandable rows. |
| `ChildrenTree` | Vertical connector + horizontal branches rendering plain-text children items. |
| `StepRow` | Single step: IconSlot + label + optional CrudPill + optional inline description or expandable children tree. |
| `GroupRow` | CRUD group: IconSlot + CrudPill + grouped label. Expands to show all children from grouped steps. |
| `SubAgentBlock` | Bot icon + label + indented child steps via tree connectors. Each child is a full StepRow. |
| `CollapsedHeader` | Chevron + summary text + right-aligned DotCounters. Click toggles expanded state. |

---

## CSS dependencies (`src/index.css`)

| Class / keyframe | Description |
|---|---|
| `animate-thinking-dot-{1,2,3}` | Staggered opacity pulse (1.2s, 0.2s offset each) |
| `animate-step-slide-in` | Slide in from left (-8px) on new step appearance |
| `reasoning-children-expand` | max-height + opacity animation for expanding child items |
| `reasoning-header-fade-in` | Opacity fade for collapsed header appearance |
| `.step-row-expandable` | Hover: bg `#f8f7f5`, transition 100ms |
| `.step-row-expandable:hover .step-chevron` | Show chevron (opacity 1) |
| `.step-row-expandable:hover .step-icon` | Hide icon (opacity 0) |

---

## Demo page

Route: `?page=reasoning-demo` or `currentPage === 'reasoning-demo'`

Accessible from UI Kit sidebar. Structured in 4 sections:

### 1. Examples & stages

Shows both integration modes with processing + finished states for each:

- **Live streaming** — left: playable card (Play/Reset, steps stream one by one with gif), right: finished inspectable (expand/collapse)
- **V1 — no per-action streaming** — left: static processing indicator (gif + "Raisonnement en cours…"), right: finished inspectable (full payload, expand/collapse)

### 2. Anatomy

- **StepIcon table** — all 13 types with icon, code name, and example label
- **Item states** — default, hover (bg + chevron swap), processing (gif)
- **Backend tool mapping** — real tool names and their mapped types
- **CrudBadges** — pill variants + counter variants side by side
- **Tree / Tree zones** — dark visual cards showing the tree connector component (vertical + horizontal branch pieces) and Level 1 tree zone
- **Step + StepItem** — component vs wrapper comparison side by side

### 3. Who got subitems, who got desc?

- 1 child = inline description (always visible)
- 2+ children = expandable tree with connectors
- Sub-agent with nested child steps
- CRUD grouping (consecutive same type+poste)
- Full combined example (lecture + sub-agents + CRUD)

### 4. Use case interactive sandbox

6 scenarios (A-F) with Play/Reset and speed controls (1x/2x/4x):

- **A** — Success + CRUD (read + extract + add/update rows)
- **B** — Read-only analysis (no CRUD mutations)
- **C** — Partial error (some steps succeed, one fails)
- **D** — Total error (all steps fail)
- **E** — Multi-poste + deletion
- **F** — Sub-agent delegation

Each scenario simulates ~15s of streaming with per-step loading/done transitions, then auto-collapses for inspection.

---

## Changelog

| Date | Change |
|---|---|
| 2026-04-14 | **Icon update from Figma.** `read_rapport`: Search → HeartPulse, `extract_data`: FileDown → AlignLeft, `verify_data`: ShieldCheck → CheckCheck, `navigate`: ChessPawn → Asterisk, `delete_row`: X → SquareX. Matched to Figma design system StepIcon symbols. |
| 2026-04-14 | **Demo page simplified.** Restructured into 4 sections: Examples & stages (interactive playable cards), Anatomy, Who got subitems, Use case sandbox. Removed color token table, props reference, and real trace example from page. |
| 2026-04-14 | **Processing state.** Steps show `plato-thinking.gif` (12px) in icon slot during `status: 'loading'`. Sandbox simulations run ~15s with per-step loading-to-done transitions. |
| 2026-04-14 | **Hover state.** Expandable rows show `#f8f7f5` background on hover, icon swaps to chevron via CSS opacity transition. |
| 2026-04-14 | **Backend tool mapping.** Added `verify_data` and `summarize` step types. `BACKEND_TOOL_MAP` maps real Plato Supervisor tool names to French labels. |
| 2026-04-14 | **v2 rewrite.** New step types, CRUD pills & grouping, dot counters, streaming lifecycle, expandable children with tree connectors, sub-agent nesting, error states. Legacy normalizer for backward compat. |
| 2026-04-14 | Initial extraction from inline App.js. |
