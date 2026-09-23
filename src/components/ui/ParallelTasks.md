---
name: ParallelTasks
package: plato
type: custom
status: draft
usage: Grouped pile for concurrent sub-agent tasks (line + inline/panel)
description: >
  Pile groupée de sous-agents simultanés : une ligne compacte (« N tâches
  simultanément en cours ») qui se déplie inline ou en panneau flottant ;
  chaque tâche enveloppe un ReasoningStepper. Code-first.
figma: null
file: src/components/ParallelTasks.js
source: src/components/ParallelTasks.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: ParallelTasks
variants: [inline, panel]
composes: [ReasoningStepper]
tokens: [colors.step]
lastValidated: 2026-09-23
---

# ParallelTasks

> **Type** Custom · **Status** Pending (2026-09-23) · **Usage** pile de tâches parallèles dans le fil
> **Figma** aucun - code-first · **File** `src/components/ParallelTasks.js`

## Pattern / Variants / Examples

### When to use
- Le fil de conversation quand l'agent lance **plusieurs sous-tâches
  simultanées** : une seule ligne discrète, dépliable, au lieu de N steppers
  empilés.

### When NOT to use
- **Une seule tâche** → `ReasoningStepper` directement.
- **Tâches d'ingestion de pièces** → le chat les montre via la zone
  « À vérifier » (memory `project_ingest_review_zone`).

### Props
`tasks` (`[{ id, label, status: 'loading'|'done'|'error', steps, summary }]`)
· `variant` ('inline' | 'panel') · `defaultOpen` · `title` · `onClear`.
Exports nommés : `ParallelTasksLine`, `ParallelTasksPanel`, `deriveCounters`.

### Tokens used
`colors.step.*` (via STEP_COLORS de ReasoningStepper).

## Sprint / Explos

- Memory `project_parallel_tasks_stack` : stack + drawer panel, wrappe
  ReasoningStepper.

## Proto demo

`/ui-kit/c/ParallelTasks` — inline ouvert/fermé, cas d'erreur.
