---
name: AssistantComposer
package: plato
type: domain
status: draft
usage: The rich Plato assistant composer (input + toolbar + scope + attachments)
description: >
  Le composer riche de l'assistant Plato : textarea auto-grow, en-tête
  système, chip de scope, toolbar (rattachement, pièces/modèles, ampoule
  suggestions), docs agrafés, tokens inline. Porté du modèle Plato Nav.
figma: https://www.figma.com/design/09fvZrDgcY83Js7y864E4v/Plato---Design?node-id=1081-50926
file: src/components/assistant/AssistantComposer.js
source: src/components/assistant/AssistantComposer.js
demo: src/components/ui-kit/componentDemos.jsx
inventoryId: AssistantComposer
variants: [standard, elevated]
states: [scope-flash, staged-docs, suggestions-open, system-state]
tokens: [colors.semantic, colors.brand, typography.fontFamily.sans]
lastValidated: 2026-09-23
---

# AssistantComposer

> **Type** Domain (gros bloc, nombreux sous-composants) · **Status** Pending (2026-09-23) · **Usage** composer riche de l'assistant
> **Figma** [1081:50926](https://www.figma.com/design/09fvZrDgcY83Js7y864E4v/Plato---Design?node-id=1081-50926) (fichier Plato---Design, « Chat Input ») · **File** `src/components/assistant/AssistantComposer.js`

Le composer de l'assistant Plato, porté du modèle Plato Nav (muscat-v1) :
textarea auto-grow + `ComposerSystemHeader` (état système) + `ScopeChip`
(dossier rattaché) + `ComposerToolbar` (rattachement, Pièces / Modèles,
ampoule de suggestions) + docs agrafés + `InlineToken`.

## Pattern / Variants / Examples

### When to use
- **Toute saisie de prompt** vers l'assistant : accueil, rail dossier,
  conversation pleine page. Un seul composer, paramétré - jamais un textarea
  ad hoc.

### Metrics (nœud 1081:50926)
Carte blanche rounded-6 · ring 1px border-strong + `shadows.xl` (Default) ·
ring 2px info-border au focus (Active) · zone d'appel pb-32 au repos, pb-12
avec contenu · toolbar p-12 : boutons libellés h-26 (12 medium muted),
groupe droite gap-2px, envoi/stop 26x26 rounded-4 · bandeau système : fond
teinté enveloppant (px/pb 1px), icône 16, texte 12 medium · docs badges
secondary px-8 py-4 · CONTEXT chips mono 11 uppercase, p-6, max-w-180.
`elevated` est conservé pour compat mais rend la même élévation (`shadows.xl`).

### When NOT to use
- **Champ de formulaire** → `Input`.
- **Recherche** → un champ de recherche dédié, pas le composer.
- **Upload direct dans le chat** → interdit : deux boutons libellés Pièces /
  Modèles lient des docs existants (décision « composer attach split »).

### Props (principales)
`variant` (`standard`/`elevated` via prop `elevated`) · `scope` +
`dossierLabel` + `scopeFlash` · `systemState` · `catalog` (mentions) ·
`onSend` · `onAttach` / `attachDossiers` / `onAttachToDossier` /
`onCreateDossier` · `onDropFiles` · `stagedDocs` + `onRemoveStagedDoc` ·
`suggestions` (`[{ icon, label, text?, onPick? }]`) · `placeholder` /
`placeholderNode` · `autoFocus` · ref exposant `{ insertText, focus }`.

### Examples
```jsx
import AssistantComposer from 'src/components/assistant/AssistantComposer';

<AssistantComposer
  scope="dossier" dossierLabel="Martin c/ AXA"
  onSend={(text) => send(text)}
  suggestions={[{ icon: Sparkles, label: 'Résume ce dossier' }]}
/>
```

### Tokens used
Tokens sémantiques (fond carte, bordures, textes) · `colors.brand` (accents
Plato) · sous-composants documentés dans leurs fichiers :
`ComposerSystemHeader`, `ComposerToolbar`, `ScopeChip`, `InlineToken`.

## Sprint / Explos

- Port in-app du modèle Plato Nav : shell 4 états + composer riche
  (memory `project_plato_assistant_nav_port`, PORT-NOTES.md).
- Pas de trombone : « Pièces / Modèles » lient l'existant (memory
  `project_composer_attach_split`).

## Proto demo

`/ui-kit/c/AssistantComposer` — sandbox live (scope, suggestions, staged
docs) ; le shell complet vit dans l'app (`/app`).
