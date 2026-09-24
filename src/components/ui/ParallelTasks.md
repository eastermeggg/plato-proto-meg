---
name: ParallelTasks
package: plato
status: stable
usage: Grouped pile for concurrent sub-agent tasks (line + inline/panel)
source: src/components/ParallelTasks.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: null
---

# ParallelTasks

Grouped pile of concurrent sub-agents: a compact line (« N tâches simultanément
en cours ») that expands inline or into a floating panel; each task wraps a
`ReasoningStepper`. Code-first.

## When to use
- The conversation thread when the agent launches several concurrent sub-tasks:
  one discreet, expandable line instead of N stacked steppers.

## When NOT to use
- A single task → `ReasoningStepper` directly.
- Pièce ingestion tasks → the chat shows them via the « À vérifier » zone
  (memory `project_ingest_review_zone`).

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `tasks` | `[{ id, label, status: 'loading'\|'done'\|'error', steps, summary }]` | — | the concurrent tasks |
| `variant` | `inline \| panel` | — | expand inline or into a floating panel |
| `defaultOpen` | bool | — | start expanded |
| `title` | string | — | pile title |
| `onClear` | fn | — | clear the pile |

Named exports: `ParallelTasksLine`, `ParallelTasksPanel`, `deriveCounters`.

## Examples
```jsx
import ParallelTasks from '../ParallelTasks';

<ParallelTasks
  variant="inline"
  tasks={[
    { id: 'a', label: 'Analyse des pièces', status: 'done', steps, summary },
    { id: 'b', label: 'Recherche JP', status: 'loading', steps },
  ]}
/>
```
