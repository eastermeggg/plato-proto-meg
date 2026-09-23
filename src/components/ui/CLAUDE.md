# Plato UI primitives — usage rules

This folder holds the canonical reusable components for the Norma app.
Any agent (or human) working on this repo MUST consult this index before
creating new UI in this area of the codebase.

The catalog of every component (built or planned) lives at
`src/data/designSystemInventory.json`. The validation interface for it is
`/ui-kit/inventory`.

---

## Hard rules

1. **Always reuse from `src/components/ui/`.**
   Never re-roll a button, badge, input, modal, dropzone, etc. inline. If the
   primitive exists here, import it. If it doesn't but exists as an inline
   preview in `src/components/ui-kit/previews.jsx`, the answer is the same:
   open the inventory, validate it, build it into this folder, then import
   from here. Never copy the inline preview into a feature file.

2. **Before creating a new primitive, ASK THE USER.**
   First check `src/data/designSystemInventory.json` — the component may
   already be planned (`status: "missing"`) with a Figma reference. Building
   without confirming the Figma source is a bug. If the component genuinely
   doesn't exist anywhere, ask the user before scaffolding it: confirm the
   name, the Figma reference, and the variants needed. Don't invent.

3. **When updating an existing primitive, WARN THE USER FIRST.**
   Updates in this folder ripple across every feature that imports them. Post
   the intended diff in chat — what props change, what visuals change, which
   call sites are affected — and wait for approval before editing the file.
   Never silently bump an existing primitive's behavior.

4. **Prop names are stable.**
   Don't rename existing props without an explicit migration plan. Feature
   components import these — a rename is a breaking change.

5. **Use tokens, not hardcoded values.**
   Every color / spacing / radius / shadow / typography value MUST come from
   `src/design-system/tokens.js`. No raw hex, no raw px, no inline shadow
   strings. If a token doesn't exist for what you need, add it to tokens.js
   first and surface it in `/ui-kit/tokens` for validation.

6. **Ne JAMAIS re-rouler le shell / la nav / une barre.**
   Le chrome de navigation est canonique et invariant. On **compose** toujours
   les composants existants, jamais une barre inline :
   - Rail gauche → `AppSidebar` (+ `SidebarBrand` / `SidebarGroup` / `NavItem` /
     `NavSectionHeader` / `SidebarUserInfo`).
   - Barre de tête fixe (breadcrumb + onglets de vue + outils) → `TopBar`.
   - En-tête de page (titre serif + action + onglets) → `PageHeader`.
   - Barre de contexte niveau 3 (poste / acte / JP) → `Niveau3Strip`.
   - Contrôle « Menu » (nav masquée) → `NavExpandControl`.

   **Un nouvel onglet / une nouvelle page / une nouvelle destination = du nouveau
   CONTENU passé à ces composants** (un `NavItem` de plus, un `tab` de plus, un
   slot `left`/`right`), **jamais** une nouvelle `<div className="h-12 border-b …">`
   ni un `border-r flex-col` à la main. Si le besoin ne rentre nulle part → faire
   évoluer le composant (fiche + `ds-decide`), pas un re-roll local. Vitrine
   vivante : `/ui-kit/shell` (« Les surfaces du shell »).

7. **Each primitive has a sibling `.md` doc — and the `.md` is the SOURCE OF TRUTH.**
   `Badge.js` ↔ `Badge.md`. Read it before using or modifying the component.
   The `.md` is best-in-class agent documentation and carries the standardised
   metadata (the kitchen-sink reads it; the inventory JSON only mirrors status).

   **Fiche schema (obligatoire) :**
   - **Frontmatter YAML** (métadonnée machine-lisible) : `name`, `type`
     (primitive/composite/domain/layout), `status`
     (validated/pending/needs-revision/missing), `usage` (une ligne : quand),
     `description`, `figma`, `file`, plus les méta utiles (`variants`, `sizes`,
     `modes`, `states`, `tokens`, `inventoryId`, `lastValidated`…).
   - **Trois sections** dans le corps :
     1. `## Pattern / Variants / Examples` — **When to use** / **When NOT to use**
        (le cœur pour l'agent : quand l'employer, quand l'éviter et vers quoi
        rediriger), Props, Examples, Tokens used.
     2. `## Sprint / Explos` — contexte d'exploration / historique / labs liés.
     3. `## Proto demo` — la sandbox live `/ui-kit/c/<id>`.

   Modèle de référence : `Badge.md`. Une nouvelle fiche se calque dessus.
   Le flux de validation `/ui-kit/c/<id>` aide à la maintenir, mais la vérité
   vit dans le `.md`.

8. **Où vit un composant - la règle d'emplacement.**
   - **Générique / réutilisable partout** (bouton, chip, barre de chrome…) →
     `src/components/ui/` directement.
   - **Métier, propre à un domaine** (jp/, preview/, redaction/, pieces/,
     assistant/, shell/…) → le `.js` vit DANS le dossier du domaine. Dès qu'il
     entre au catalogue DS : une **porte ui/** (fichier ré-export d'une ligne,
     ex. `ui/Niveau3Strip.js` → `shell/Niveau3Strip.js`) OU l'index ci-dessous
     pointe le chemin réel, ET la **fiche `.md` vit TOUJOURS dans ui/** +
     l'entrée d'inventaire. Un composant sans fiche ui/ n'est pas au catalogue.
   - **Un BLOCK n'est pas un composant** : c'est une composition de page
     (shell, vue dossier…) faite de composants du catalogue. Il vit dans le
     registre blocks (`ui-kit/blocks`, `/ui-kit/b/<id>`), n'a pas de `.js`
     réutilisable propre et n'entre pas dans l'inventaire composants. Si une
     partie d'un block devient réutilisable → c'est qu'un composant est né :
     l'extraire (règle ci-dessus), le block le compose.
   - Les **atomes d'un gros composant** (ex. PreviewAtoms du Doc Preview)
     vivent à côté de lui dans son domaine, chacun avec sa fiche ui/ et son
     entrée d'inventaire - jamais des fonctions internes anonymes.

---

## Index of primitives

| Component | File | Doc | Figma node | Modes / variants |
|-----------|------|-----|------------|------------------|
| Badge | [Badge.js](./Badge.js) | [Badge.md](./Badge.md) | 136:1178 | label · number · icon-only |
| Button | [Button.js](./Button.js) | [Button.md](./Button.md) | 2814:11933 | primary · secondary · ghost · outline · destructive |
| ButtonGroup | [ButtonGroup.js](./ButtonGroup.js) | [ButtonGroup.md](./ButtonGroup.md) | 28685:126219 | primary · outline · secondary × horizontal / vertical (compose Button) |
| Kbd | [Kbd.js](./Kbd.js) | [Kbd.md](./Kbd.md) | 29794:42330 | default · reversed + KbdGroup (separated) |
| Spinner | [Spinner.js](./Spinner.js) | [Spinner.md](./Spinner.md) | 33609:22857 | 5 tailles (12-32) · couleur par token |
| Stepper | [Stepper.js](./Stepper.js) | [Stepper.md](./Stepper.md) | Plato---Design 4226:63220 | horizontal · états done / active / upcoming |
| Progress | [Progress.js](./Progress.js) | [Progress.md](./Progress.md) | 2819:29134 | barre déterminée 0-100 % |
| Item | [Item.js](./Item.js) | [Item.md](./Item.md) | 32847:5869 | default · outline × md / sm + slots + ItemGroup |
| Calendar | [Calendar.js](./Calendar.js) | [Calendar.md](./Calendar.md) | 2819:19886 | single · sizes default/large/custom-days (dayDetail) |
| Chart | [Chart.js](./Chart.js) | [Chart.md](./Chart.md) | 2819:21571 | bar · bar-horizontal · bar-stacked · line · area · area-stacked · pie · donut |
| Alert | [Alert.js](./Alert.js) | [Alert.md](./Alert.md) | 2813:9373 | default · destructive · info · warning + action-lien |
| InputGroup | [InputGroup.js](./InputGroup.js) | [InputGroup.md](./InputGroup.md) | 27510:119942 | text/textarea + addons (Text · Kbd · Check) × états error/warning/disabled/calculated |
| Slider | [Slider.js](./Slider.js) | [Slider.md](./Slider.md) | 2819:30565 | simple · range 2 poignées, contrôlé/non contrôlé |
| DropZone | [DropZone.js](./DropZone.js) | [DropZone.md](./DropZone.md) | 35747:41445 | panel · inline · empty × default/hover/drop/extraction |
| Input (Field) | [Input.js](./Input.js) | [Input.md](./Input.md) | 33541:69574 | vertical · horizontal · slot · error/warning |
| SourceBadge | [SourceBadge.js](./SourceBadge.js) | [SourceBadge.md](./SourceBadge.md) | — | 10 types de source (piece · jp · loi …) |
| TopBar | [TopBar.js](./TopBar.js) | [TopBar.md](./TopBar.md) | 37497:56098 | chrome fixe : leading · left · right |
| PageHeader | [PageHeader.js](./PageHeader.js) | [PageHeader.md](./PageHeader.md) | 37511:1436 | Dossiers · Conversations · Dossier |
| AppSidebar | [AppSidebar.js](./AppSidebar.js) | [AppSidebar.md](./AppSidebar.md) | 36097:42882 | rail canonique + SidebarBrand / SidebarGroup |
| NavItem | [NavItem.js](./NavItem.js) → shell | [NavItem.md](./NavItem.md) | 37441:55015 | destination · recent · create · see-all |
| NavSectionHeader | [NavSectionHeader.js](./NavSectionHeader.js) → shell | [NavSectionHeader.md](./NavSectionHeader.md) | 37457:4903 | en-tête mono + action « + » |
| NavExpandControl | [NavExpandControl.js](./NavExpandControl.js) → shell | [NavExpandControl.md](./NavExpandControl.md) | 37443:5724 | « Menu » réouverture (nav masquée) |
| NavPromoBanner | [NavPromoBanner.js](./NavPromoBanner.js) → shell | [NavPromoBanner.md](./NavPromoBanner.md) | 37471:1271 | promo rail : edge top / bottom |
| PlatoAssistantButton | [PlatoAssistantButton.js](./PlatoAssistantButton.js) → shell | [PlatoAssistantButton.md](./PlatoAssistantButton.md) | 37444:5885 | CTA IA (halo brand + comète) |
| Niveau3Strip | [Niveau3Strip.js](./Niveau3Strip.js) → shell | [Niveau3Strip.md](./Niveau3Strip.md) | 37447:5922 | contexte niv.3 + briques |
| SidebarUserInfo | [SidebarUserInfo.js](./SidebarUserInfo.js) → shell | [SidebarUserInfo.md](./SidebarUserInfo.md) | 36097:37493 | pied profil du rail (collapsed) |
| DataTableCell | [DataTableCell.js](./DataTableCell.js) | [DataTableCell.md](./DataTableCell.md) | 36554:5657 | cellule typée atomique des tables (~30 types) |
| DataTableHeader | [DataTableHeader.js](./DataTableHeader.js) | [DataTableHeader.md](./DataTableHeader.md) | 2768:27447 | en-tête de colonne : text · button (tri) · checkbox |
| RadioPricing | [RadioPricing.js](./RadioPricing.js) | [RadioPricing.md](./RadioPricing.md) | 36915:6122 | carte-option radio (licences) |
| IVAvatar | ../IVAvatar.js | [IVAvatar.md](./IVAvatar.md) | 36533:7935 | avatar pièce d'échecs : 6 pièces × 6 palettes |
| JPListing | ../jp/JPListing.js | [JPListing.md](./JPListing.md) | Plato---Design 2219:19197 | carte JP canonique (4 contextes) + stack |
| PreviewPanel | ../preview/PreviewPanel.js | [PreviewPanel.md](./PreviewPanel.md) | 37375:9330 | panneau de préviz systématisé (7 kinds) - compose les atomes ci-dessous |
| KindIcon | ../preview/PreviewAtoms.js | [KindIcon.md](./KindIcon.md) | 37375:9147 | puce d'identité du Doc Preview (accents par kind) |
| PanelHeader | ../preview/PreviewAtoms.js | [PanelHeader.md](./PanelHeader.md) | 37375:8723 | barre de titre h-56 du Doc Preview + variant small |
| CiteRow | ../preview/PreviewAtoms.js | [CiteRow.md](./CiteRow.md) | 37375:8836 | ligne du rail « Extraits cités » (+ CitesPanel 37375:9168) |
| MetaChip | ../preview/PreviewAtoms.js | [MetaChip.md](./MetaChip.md) | 37375:9177 | chip de métadonnée (14 types canoniques) |
| AssistantComposer | ../assistant/AssistantComposer.js | [AssistantComposer.md](./AssistantComposer.md) | Plato---Design 1081:50926 | composer riche de l'assistant |
| StatusPillDS | ../ui-kit/StatusPill.js | [StatusPillDS.md](./StatusPillDS.md) | — (code-first) | pill de statut de l'inventaire DS |
| DomainTableRows | [tables/](./tables/) | [DomainTableRows.md](./DomainTableRows.md) | 36554:7670 | familles de rangées métier (composent DataTableCell) |

Toutes les Figma nodes sont dans le fichier `Plato---System` (`0eKtlRkT1Hbjh8Nqd47Woy`).

Other primitives planned but not yet built live as inline sketches in
`src/components/ui-kit/previews.jsx` — see the inventory for the full list and
their statuses.

> **Resync d'inventaire (23/09/2026)** : les champs FACTUELS de
> `designSystemInventory.json` (`exists`, `filePath`, présence d'entrée) sont
> resynchronisés sur le disque : `Input`/`DropZone` passés `missing` →
> `pending`, entrées créées pour `Stepper` et `BordereauTable` (fiche + code
> présents, page `/ui-kit/c/<id>` qui 404ait), ligne fantôme « Card » retirée
> de cet index (ni `.js` ni `.md`). Règle : le factuel (existe / chemin) se
> resynchronise sur le code ; les STATUTS de validation (`pending` →
> `validated`) restent le flux de la propriétaire (`/ui-kit/c/<id>`), jamais
> une édition de JSON à la main.

---

## How to add or update a primitive

1. Open `/ui-kit/c/<ComponentId>` (or `/ui-kit/inventory` and pick one).
2. Paste the Figma URL. Add notes and Usage Rules.
3. Set status: `missing` (new), `needs-revision` (existing, drift), or
   `validated` (matches Figma).
4. Click "Copy prompt".
5. Paste back into Claude Code. The generated prompt will:
   - Update the inventory entry.
   - Build/sync the React file (matching Figma, using tokens).
   - Generate or update the sibling `.md` from your Usage Rules.
   - Update this CLAUDE.md index.
   - Verify routes + build, then commit.

If you're an agent reading this and the user has NOT gone through that flow,
do not start building — ask them to validate the entry at `/ui-kit/c/<id>`
first.
