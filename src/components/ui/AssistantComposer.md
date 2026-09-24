---
name: AssistantComposer
package: plato
status: stable
usage: The rich Plato assistant composer (input + toolbar + scope + attachments)
source: src/components/assistant/AssistantComposer.js
demo: src/components/ui-kit/componentDemos.jsx
replacedBy: null
figma: https://www.figma.com/design/09fvZrDgcY83Js7y864E4v/Plato---Design?node-id=1081-50926
---

# AssistantComposer

The Plato assistant composer, ported from the Plato Nav model: auto-grow textarea
+ `ComposerSystemHeader` (system state) + `ScopeChip` (attached dossier) +
`ComposerToolbar` (attach, Pièces / Modèles, suggestions bulb) + stapled docs +
`InlineToken`. One composer, parameterized - never an ad hoc textarea.

## When to use
- **Any prompt input** to the assistant: home, dossier rail, full-page conversation.

## When NOT to use
- **Form field** → `Input`.
- **Search** → a dedicated search field, not the composer.
- **Direct upload in chat** → forbidden: two labelled buttons Pièces / Modèles link existing docs (« composer attach split » decision).

## Props
| Prop | Type | Default | Notes |
|------|------|---------|-------|
| `variant` | `standard \| hero` | `standard` | |
| `scope` | `{dossierId, vertical}` | — | filters the mention catalogue only |
| `dossierLabel` | string | — | attached dossier label |
| `scopeFlash` / `onScopeFlashEnd` | bool / fn | `false` | flash the scope chip |
| `systemState` | `null \| {kind, label, detail?, onOpen?}` | `null` | `kind`: inProgress/warning/blocked |
| `catalog` | `{objects, intentions}` | — | mentions, precomputed by caller |
| `onSend` | fn | — | `({body, tokens, segments}) => void` |
| `onAttach` | fn | — | attach action |
| `attachDossiers` / `onAttachToDossier` / `onCreateDossier` | — | — | attach popover |
| `onRunIntention` | fn | — | `(intention) => void` |
| `onDropFiles` | fn | — | `(files) => void` |
| `placeholder` / `placeholderNode` | string / node | `Demander à Plato...` | |
| `autoFocus` | bool | `false` | |
| `stagedDocs` / `onRemoveStagedDoc` | — | — | stapled docs |
| `contextItems` | `[{id, label, icon?}]` | — | CONTEXT banner (work scope) |
| `running` / `onStop` | bool / fn | `false` | agent generating: toolbar frozen, send → stop |
| `userAsk` | `{question, proposals, step, total, answered?}` | `null` | agent question card |
| `suggestions` | `[{icon, label, text?, onPick?}]` | — | bulb menu |
| `elevated` | bool | `false` | kept for compat, same elevation |

Ref exposes `{ insertText, focus }`.

## Examples
```jsx
import AssistantComposer from 'src/components/assistant/AssistantComposer';
import { Sparkles } from 'lucide-react';

<AssistantComposer
  scope={{ dossierId: 'axa', vertical: 'corporel' }} dossierLabel="Martin c/ AXA"
  onSend={({ body }) => send(body)}
  suggestions={[{ icon: Sparkles, label: 'Résume ce dossier' }]}
/>
```
