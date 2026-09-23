---
name: DropZone
package: plato
type: primitive
status: draft
usage: Drag-and-drop / click-to-browse file input surface
description: >
  Zone de dépôt de fichiers du DS (Figma « Drop Doc ») - trois contextes
  (panel 64px, inline 36px, empty-state riche des tables) avec états
  default / hover / drop / extraction gérés par le composant (survol interne,
  drag natif) ou forçables via `state`.
figma: "Plato---System 35747:41445 (section 37709:904)"
file: src/components/ui/DropZone.js
source: src/components/ui/DropZone.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: DropZone
variants: [panel, inline, empty]
states: [default, hover, drop, extraction]
tokens: ["semantic.borderStrong/borderHover/accent/muted/secondaryForeground/mutedForeground/foreground", "feedback.info.text", "dropzone.extractionBorder/extractionTint (alpha via color-mix)"]
composes: [Badge, Progress, Spinner]
lastValidated: 2026-09-23
---

# DropZone

> **Type** Primitive · **Status** Pending (aligné Figma, à valider) · **Usage** file-drop input
> **File** `src/components/ui/DropZone.js` · **Figma** Plato---System « Drop Doc » 35747:41445

The sanctioned "drop a file here / click to browse" affordance. Any dashed upload
area is this component - never a bespoke dashed box.

## Pattern / Variants / Examples

### When to use
- `context="panel"` - rangée 64px centrée dans un panneau ou une carte (ex. la
  bande de drop du composer assistant pendant un drag).
- `context="inline"` - rangée compacte 36px alignée à gauche, en pied de liste
  ou de table ("Déposez ou cliquez..." Figma `inline-tables`).
- `context="empty"` - empty-state riche d'une table de pièces (Figma
  `tables-empty`) : icône, titre avec « parcourez » souligné, description,
  badges de types attendus (`suggestions`), séparateur OU + `action`.
- Les états se gèrent SEULS : survol → hover, drag natif → drop (le composant
  écoute dragover/drop et remonte les fichiers via `onFiles`). `state` ne sert
  qu'à forcer un état (labs, screenshots) ou à afficher `extraction`.

### When NOT to use
- **Un simple bouton de parcours** sans cible de drop → `Button` + input caché.
- **Une liste de fichiers déjà déposés** → table/rangées, pas une DropZone.
- **L'écran d'import drop-first complet** (Figma contexte `start`) → c'est une
  COMPOSITION d'écran (DropZone + Doc List + promos), pas ce composant seul.
- **Never** re-roll a dashed box inline - import this.

### Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `context` | `panel \| inline \| empty` | `panel` | accepte aussi les noms Figma `inline-tables` / `tables-empty` |
| `state` | `default \| hover \| drop \| extraction` | auto | forcé ; sinon dérivé du survol / drag (extraction : contexte empty) |
| `isDragging` | bool | — | état de drag piloté de l'extérieur (équivaut à `state="drop"`) |
| `onClick` | fn | — | click-to-browse |
| `onFiles` | fn(files) | — | fichiers déposés (drag natif géré par le composant) |
| `labelPrefix` / `labelAction` / `labelSuffix` | string | « Déposez ou {cliquez\|parcourez} pour ajouter … » | libellé structuré Figma ; le mot d'action est médium bleu info (souligné en empty) |
| `label` | string | — | libellé d'un seul tenant (remplace le structuré - legacy) |
| `dropLabel` | string | « Déposez vos fichiers ici » | libellé de l'état drop |
| `description` | string | — | phrase descriptive (empty) ; alias legacy `sublabel` |
| `suggestions` | [string] | — | badges secondary des types attendus (empty) |
| `action` | `{icon, label, onClick}` | — | lien sous le séparateur OU (empty) |
| `extractionTitle` / `extractionDescription` | string | « Extraction en cours » | copy de l'état extraction |
| `progress` / `progressLabel` | number / string | 0 | barre `Progress` 82px + légende (« 5/10 documents - ... ») |
| `variant` | `container \| inline` | — | **legacy** : container → empty, inline → inline |

### Examples
```jsx
import DropZone from '../ui/DropZone';

// Bande de drop d'un panneau (composer) - état forcé pendant le drag du parent
<DropZone context="panel" state="drop" />

// Pied de table compact
<DropZone context="inline" onFiles={ingest} onClick={browse} />

// Empty-state d'une table de pièces
<DropZone
  context="empty"
  labelSuffix=" pour ajouter les justificatifs du dossier"
  description="PDF, images, .eml, .msg"
  suggestions={["Bulletins de salaire", "Relevés d'indemnités journalières", 'Autre document ?']}
  action={{ icon: PencilLine, label: 'Saisir manuellement', onClick: openForm }}
  onFiles={ingest}
/>

// Extraction en cours
<DropZone context="empty" state="extraction" progress={40} progressLabel="5/10 documents - Extraction en cours" />
```

### Tokens used
Bordure `borderStrong` (repos) / `borderHover` (hover, drop) en pointillé ;
dégradé interne transparent → `accent` (repos) / `muted` (hover, drop) ; mot
d'action `feedback.info.text` ; extraction : bordure pleine
`dropzone.extractionBorder` à 50% et dégradé `dropzone.extractionTint` à 60%
(alpha via `color-mix`), spinner `Spinner` + barre `Progress` du DS. Plus aucun
style dans `index.css` (les règles `.dropzone-*` ont été retirées).

## Sprint / Explos

- Promu depuis `ui-kit/previews.jsx`, puis réaligné pixel-perfect sur le set
  Figma « Drop Doc » (23/09/2026) : prop API contexte × état, hover/drag
  internes, état extraction (Spinner + Progress), badges de suggestions.
- Consommé par : AssistantComposer (bande de drop, `panel/drop`), labs d'import
  (`/ui-kit/import-dossier`, `/ui-kit/import-v2` via Panier), relevé d'heures.
- Contexte Figma `start` (écran drop-first) volontairement non couvert - c'est
  une composition (voir SIGNALEMENTS si besoin d'un composant dédié).

## Proto demo

`/ui-kit/c/DropZone` — sandbox : contexte panel / inline / empty, état auto
(survol + drag réels) ou forcé (drop, extraction).
