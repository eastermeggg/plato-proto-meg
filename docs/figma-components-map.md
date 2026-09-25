# Carte des composants Figma — Plato---System

Relevé du 22/09/2026 (35 pages, via MCP metadata). Fichier d'origine : **kit
Figma shadcn/ui** (« All 56 Components / All 44 Blocks » dans la cover), thémé
Plato puis étendu. Structure réelle en 3 couches, conforme à la description de
la steward.

Conventions du fichier : préfixe `.` = sous-composant privé · suffixe `•` sur
un nom de page = ajout shadcn récent (pas custom) · chaque page composant =
artboard doc (`<Nom>` + Title/Footer utilitaires) + artboard `Examples`
(Light **et** Dark).

## 1. Tokens & Assets (déjà relevés par ailleurs)

| Page | Contenu |
|---|---|
| Documentation | Overview, Getting started, Variables, Regular/Instant theming, Theme preview… (doc du kit) |
| ↳ Icons | Lucide (référence) |
| ↳ Assets | Platforms/Payments/Apps, Emoji, Cursors, Flags |
| (page Colors) | « Plato Theme documentation » (couleurs, relevé v2) + « Plato Token documentation » `37375:11431` (fonts/tailles/poids/radius/icônes/ombres) |

## 2. Components (Active) — base shadcn thémée, extensions marquées

| Page | Set(s) principal(aux) | Vanilla / étendu |
|---|---|---|
| ↳ Alert | Alert ×4 | **étendu** : types Info + Warning |
| ↳ Avatar | Avatar ×44, Avatar Group ×5 | vanilla (+ voir customs : IVAvatar) |
| ↳ Badge | Badge ×~48, Badge/Counter | **étendu** : types AI/Success/Info/Warning + Counter |
| ↳ Button | Button ×~290 | **étendu** : taille XS, Icon XS, Warning/Success/Neutral Link |
| ↳ Button Group • | Button Group ×6 (+Input ×3) | vanilla |
| ↳ Checkbox | Checkbox ×36, Group ×3 | vanilla-kit (Card/Description) |
| ↳ Combobox | Combobox ×8, Menu Item ×8 | vanilla |
| ↳ Dropdown Menu | Menu, Item ×18, Trigger ×3 | vanilla |
| ↳ Empty • | Empty, Media ×4, Content ×5 | quasi vanilla (media « success ») |
| ↳ Field • | Field ×7, Legend ×2 | **étendu** : état **Warning** |
| ↳ Input | Input ×24 | **étendu** : **Warning** + état **Calculated** (cotisations) |
| ↳ Input Group • | Input Group ×17, Addons, Button ×~114 | **étendu** : Warning + Calculated |
| ↳ Item • | Item ×6, Media ×6 | vanilla |
| ↳ Kbd • | Kbd ×2, Group ×2 | vanilla |
| ↳ Progress | Progress ×11 | vanilla |
| ↳ Select | Select ×5, Menu Item ×9 (+Doc ×10) | **étendu** : Menu Item Doc (levels), menus assemblés |
| ↳ Spinner • | Spinner ×20 | vanilla |
| ↳ Switch | Switch ×16, Toggle ×6 | légèrement étendu (Card, Orientation) |
| ↳ Calendar / Calendar Blocks | sous-composants + 22 blocks | vanilla |
| ↳ Card | Card, Header ×6, Footer ×11 | footer étendu |
| ↳ Chart | ~43 charts (Area/Bar/Pie/Radar/Radial) | vanilla |
| ↳ Data Table | Cell ×~102, Pagination ×2 | systématisé (plus large que vanilla) |
| ↳ Radio Group | Item ×24, Toggle ×6 | + 1 set custom (voir §3) |
| ↳ Separator / Slider / Table / Tabs / Textarea | petits sets | Tabs **+SM**, Textarea **+Muted** (« State7 » = anomalie de nommage) |
| Archive: Utility | chrome de doc du kit | + 6 écrans custom DSA parqués là (§3) |

## 3. Custom Components — créés pour Plato

| Où | Set / artboard | Contenu |
|---|---|---|
| page Badge | **Source Badge ×60** + `badge-usage-guide` + `source-badge-docs` | 10 sources (Pièce, Code, JP, PASS, Assiette, Modèle…) × 2 tailles × 3 états ; règle STATUS→Badge / SOURCE→Source Badge (= la spec « badge rationalization ») |
| page Avatar | **IVAvatar ×~216** + **ChessIcons ×6** (artboard « Avatars ») | pièces d'échecs × 6 couleurs × tailles (= `src/components/IVAvatar.js`) |
| page **↳ Tables** | section **ComponentTable ×~150 symboles** | rangées métier : PGP, IV Post, Documents, DSA, DFT, **Cotisations** (rows/cells/page/panel), Chiffrage, Actes, RowHours, Totals + écrans Detail Panel |
| page Radio Group | **Radio Group Item Pricing ×5** | pour l'UI licences/pricing |
| Input/Field/Input Group | états **Warning** + **Calculated** | extensions Norma (champs calculés cotisations) |
| Archive: Utility | **DSA/Edit** ×6 écrans | drawers d'édition de dépense (Ponctual/Periodic/Scroll) |

## 4. Les MANQUES côté Figma (corrigés par la steward le 22/09)

Composants utilisés dans le code **sans page dans Plato---System** :

- **Tout le chat** (le manque pointé par la steward) : ChatBubble, ChatComposer,
  ChatMessageList, composer riche assistant, ReasoningStepper, ParallelTasks,
  ChatComposerNotice, SuggestionsMenu, PromptSuggestionCard → **à dessiner**.
- **Overlays shadcn** : Dialog/Modal (la page Alert ≠ AlertDialog), Sheet (ex-Drawer),
  Popover, Tooltip, Toast, Skeleton, ScrollArea → pages shadcn standard à créer.
- **Divers** : PlanCard, composants JP (JPPill, DecisionDrawer…) → à dessiner.
- ~~DropZone, PreviewPanel~~ : **existent côté Figma** (correction steward -
  hors Plato---System, probablement Plato---Design / frames panneau doc).
  Marqués `figmaTodo: a-pointer` dans l'inventaire - refs à coller.

Tout ceci est encodé dans `src/data/designSystemInventory.json` (`layer` +
`figmaTodo: a-dessiner | a-pointer`) et visible dans `/ui-kit/inventory`.

## 5. Correspondances de noms Figma ↔ code (pour l'inventaire)

`Field` (Figma) = `Input` (code, wrapper) · `Input` (Figma) = le contrôle texte ·
`Empty` = `EmptyState` · `Avatar`+`IVAvatar` = `Avatar`/`IVAvatar.js` ·
`Source Badge` = la 2e famille de pills (spec badge-rationalization) ·
`Tables/ComponentTable` = les rangées métier d'App.js (IV, cotisations, bordereau).
