# Tokens — documentation d’usage

> GÉNÉRÉ par `npm run ds:tokens` (scripts/gen-token-docs.mjs) depuis `src/design-system/tokens.js`
> + les cartes d’usage du script. **Modifier l’usage d’un token = éditer la carte dans le script**,
> puis régénérer. Ne pas éditer ce fichier à la main. Affiché dans le playground : `/ui-kit/tokens`.

Light par défaut ; la colonne Dark n'apparaît que si la valeur change (architecture var(), voir docs/dark-mode.md).

## Couleurs

### semantic

| Token | Light | Dark | Usage |
|---|---|---|---|
| `background` | `#f8f7f5` | `#1a1917` | Fond de page par défaut (cream/50) |
| `foreground` | `#292524` | `#f2f0ee` | Texte principal (stone/800) |
| `muted` | `#eeece6` | `#262320` | Fond atténué - blocs secondaires, chips, surfaces discrètes |
| `muted-foreground` | `#78716c` | `#a8a29e` | Texte atténué - libellés et méta secondaires |
| `card` | `#ffffff` | `#211f1d` | Surface des cartes |
| `card-foreground` | `#292524` | `#f2f0ee` | Texte sur carte |
| `popover` | `#ffffff` | `#262320` | Surface des popovers / menus flottants |
| `popover-foreground` | `#292524` | `#f2f0ee` | Texte dans les popovers |
| `border` | `#dfdcd9` | `#383430` | Bordure par défaut - assombrie d'un demi-cran vs Figma (contraste nav), dérive assumée |
| `border-strong` | `#cbc7c4` | `#4a453f` | Bordure appuyée - séparateurs de rails, contours actifs |
| `border-hover` | `#a8a29e` | `#605a52` | Bordure au survol |
| `input` | `#dfdcd9` | `#383430` | Bordure des champs de formulaire |
| `ring` | `#292524` | `#e7e5e3` | Anneau de focus |
| `primary` | `#292524` | `#f2f0ee` | Action principale - fond sombre des boutons primaires |
| `primary-foreground` | `#ffffff` | `#1a1917` | Texte sur fond primaire |
| `secondary` | `#eeece6` | `#2d2a26` | Action secondaire - fond crème |
| `secondary-foreground` | `#44403c` | `#e7e5e3` | Texte sur fond secondaire |
| `accent` | `#f8f7f5` | `#2d2a26` | Fond hover/focus discret |
| `accent-foreground` | `#292524` | `#f2f0ee` | Texte sur accent |
| `white` | `#ffffff` | `#211f1d` | Blanc de surface - devient une surface sombre en dark (ne pas utiliser comme texte) |
| `surface-raised` | `#ffffff` | `#302e2c` | Surface des éléments à élévation maximale (shadow 4xl) - en dark, un cran plus clair que card (doctrine B) |
| `overlay` | `rgba(41,37,36,0.40)` | `rgba(0,0,0,0.60)` | Scrim derrière Dialog/AlertDialog - jamais un bg-black/NN ad hoc |
| `foreground-secondary` | `#78716c` | `#a8a29e` | Alias hérité de muted-foreground |
| `foreground-muted` | `#a8a29e` | `#78716c` | Texte tertiaire clair (stone/400) - placeholders, méta |
| `foreground-tertiary` | `#44403c` | `#d6d3d1` | Texte d'appui (stone/700) - libellés, boutons secondaires |
| `foreground-quaternary` | `#57534e` | `#c3bfba` | Texte discret (stone/600) |
| `border-alt` | `#dfdcda` | `#383430` | Alias historique de border (#dfdcda) |
| `background-canvas` | `#f8f7f5` | `#1a1917` | Alias de background |
| `background-hover` | `#f8f7f5` | `#242120` | Alias de background (survols pleine page) |
| `background-subtle` | `#f5f5f4` | `#211f1d` | Fond léger - blocs de code, rails, zones neutres |
| `cream` | `#eeece6` | `#262320` | Alias de muted (cream/100) |
| `foreground-strong` | `#1c1917` | `#ffffff` | Texte fort (stone/900) - emphase maximale |
| `border-subtle` | `#f0efed` | `#262320` | Filet très léger - séparations internes |

### feedback

| Token | Light | Dark | Usage |
|---|---|---|---|
| `destructive.base` | `#991b1b` | `#dc2626` | Couleur pleine destructif (erreurs, suppressions) - boutons et accents saturés |
| `destructive.foreground` | `#ffffff` | — | Texte sur fond destructif (erreurs, suppressions) plein |
| `destructive.subtle` | `#f2e3e3` | `#2a1a1a` | Fond teinté destructif (erreurs, suppressions) - badges, bandeaux, zones |
| `destructive.border` | `#dbc7c7` | `#5c3434` | Bordure destructif (erreurs, suppressions) - contours des zones teintées |
| `destructive.text` | `#7f1d1d` | `#f8b4b4` | Texte destructif (erreurs, suppressions) sur fond clair ou subtle (contraste AA) |
| `success.base` | `#059669` | `#10b981` | Couleur pleine succès - boutons et accents saturés |
| `success.foreground` | `#ffffff` | — | Texte sur fond succès plein |
| `success.subtle` | `#e3f2ee` | `#16241f` | Fond teinté succès - badges, bandeaux, zones |
| `success.border` | `#c7dbd6` | `#2f5347` | Bordure succès - contours des zones teintées |
| `success.text` | `#064e3b` | `#86efac` | Texte succès sur fond clair ou subtle (contraste AA) |
| `warning.base` | `#bd6c1a` | `#e08640` | Couleur pleine avertissement - boutons et accents saturés |
| `warning.foreground` | `#ffffff` | — | Texte sur fond avertissement plein |
| `warning.subtle` | `#f2ebe3` | `#2a2016` | Fond teinté avertissement - badges, bandeaux, zones |
| `warning.border` | `#dbd1c7` | `#574a34` | Bordure avertissement - contours des zones teintées |
| `warning.text` | `#855b31` | `#f0c088` | Texte avertissement sur fond clair ou subtle (contraste AA) |
| `info.base` | `#5593ea` | — | Couleur pleine information - boutons et accents saturés |
| `info.foreground` | `#ffffff` | — | Texte sur fond information plein |
| `info.subtle` | `#e3e7f2` | `#1a2030` | Fond teinté information - badges, bandeaux, zones |
| `info.border` | `#c7ccdb` | `#35415c` | Bordure information - contours des zones teintées |
| `info.text` | `#1e3a8a` | `#a9c4f5` | Texte information sur fond clair ou subtle (contraste AA) |
| `info.bg` | `#eef3fa` | `#161d2b` | Fond information très léger (états ON, pills) |
| `ai.base` | `#9333ea` | `#a855f7` | Couleur pleine IA (généré par le modèle) - boutons et accents saturés |
| `ai.foreground` | `#ffffff` | — | Texte sur fond IA (généré par le modèle) plein |
| `ai.subtle` | `#ebe3f2` | `#241a2e` | Fond teinté IA (généré par le modèle) - badges, bandeaux, zones |
| `ai.border` | `#d2c7db` | `#4a3a5c` | Bordure IA (généré par le modèle) - contours des zones teintées |
| `ai.text` | `#581c87` | `#d8b4fe` | Texte IA (généré par le modèle) sur fond clair ou subtle (contraste AA) |

### accents

| Token | Light | Dark | Usage |
|---|---|---|---|
| `indigo.base` | `#3b5bdb` | — | Couleur pleine indigo - boutons et accents saturés — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `indigo.foreground` | `#ffffff` | — | Texte sur fond indigo plein — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `indigo.subtle` | `#e3e6f2` | `#1c2030` | Fond teinté indigo - badges, bandeaux, zones — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `indigo.border` | `#c7cbdb` | `#39406b` | Bordure indigo - contours des zones teintées — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `indigo.text` | `#2143cc` | `#a9b6f5` | Texte indigo sur fond clair ou subtle (contraste AA) — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `violet.base` | `#6d46c8` | — | Couleur pleine violet - boutons et accents saturés — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `violet.foreground` | `#ffffff` | — | Texte sur fond violet plein — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `violet.subtle` | `#e8e3f2` | `#241d33` | Fond teinté violet - badges, bandeaux, zones — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `violet.border` | `#cdc7db` | `#4a3d6b` | Bordure violet - contours des zones teintées — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `violet.text` | `#5931b4` | `#c9b6f0` | Texte violet sur fond clair ou subtle (contraste AA) — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `emerald.base` | `#3f7350` | — | Couleur pleine emerald - boutons et accents saturés — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `emerald.foreground` | `#ffffff` | — | Texte sur fond emerald plein — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `emerald.subtle` | `#e3f2e8` | `#16241d` | Fond teinté emerald - badges, bandeaux, zones — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `emerald.border` | `#c7dbce` | `#2f5340` | Bordure emerald - contours des zones teintées — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `emerald.text` | `#346344` | `#8fd0a5` | Texte emerald sur fond clair ou subtle (contraste AA) — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `sand.base` | `#7a6244` | — | Couleur pleine sand - boutons et accents saturés — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `sand.foreground` | `#ffffff` | — | Texte sur fond sand plein — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `sand.subtle` | `#f2ebe3` | `#241f18` | Fond teinté sand - badges, bandeaux, zones — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `sand.border` | `#dbd2c7` | `#544a38` | Bordure sand - contours des zones teintées — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `sand.text` | `#695339` | `#d3bd9a` | Texte sand sur fond clair ou subtle (contraste AA) — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `slate.base` | `#52657d` | — | Couleur pleine slate - boutons et accents saturés — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `slate.foreground` | `#ffffff` | — | Texte sur fond slate plein — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `slate.subtle` | `#e3eaf2` | `#1a2028` | Fond teinté slate - badges, bandeaux, zones — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `slate.border` | `#c7d0db` | `#3a4658` | Bordure slate - contours des zones teintées — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `slate.text` | `#45566b` | `#aebccd` | Texte slate sur fond clair ou subtle (contraste AA) — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `stone.base` | `#78716c` | — | Couleur pleine stone - boutons et accents saturés — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `stone.foreground` | `#ffffff` | — | Texte sur fond stone plein — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `stone.subtle` | `#edeae9` | `#26231f` | Fond teinté stone - badges, bandeaux, zones — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `stone.border` | `#d5d0cd` | `#4a453f` | Bordure stone - contours des zones teintées — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `stone.text` | `#66605c` | `#c3bcb5` | Texte stone sur fond clair ou subtle (contraste AA) — Famille décorative (identités, catégories) - aucune sémantique d’état |
| `ochre` | `#b9703f` | — | Accent chaud - surtitres, marqueurs JP (promu depuis #b9703f ×61, DECISIONS-HEX §6) |
| `meadow` | `#4a9168` | — | Vert marketing des connecteurs email (promu depuis #4a9168 ×23, DECISIONS-HEX §6) |

### brand

| Token | Light | Dark | Usage |
|---|---|---|---|
| `brand` | `#f47a2c` | — | Orange brand « Vif atténué » - DÉTAIL uniquement (surtitres, glow, liseré actif, icônes), jamais un aplat |
| `brand-foreground` | `#ffffff` | — | Texte sur fond brand plein (rare) |
| `brand-subtle` | `#fff1e6` | `#2a1c10` | Fond teinté brand |
| `brand-subtle-foreground` | `#b8560f` | `#f4a06a` | Texte sur brand-subtle |
| `brand-border` | `#f9c79b` | `#5c3a1c` | Bordure brand |
| `brand-muted-foreground` | `#b8560f` | — | Alias hérité → brand-darker |
| `brand-darker` | `#b8560f` | — | Brand foncé - liens et texte brand, contraste AA sur blanc |
| `brand-darker-foreground` | `#ffffff` | — | Texte sur brand-darker plein |
| `brand-darker-subtle` | `#fbeadd` | `#241a10` | Fond teinté brand foncé |
| `brand-darker-subtle-foreground` | `#8f430c` | `#e7b184` | Texte sur brand-darker-subtle |
| `brand-darker-border` | `#e7b184` | `#5c4020` | Bordure brand foncée |

### badge

| Token | Light | Dark | Usage |
|---|---|---|---|
| `badge.default` | `#292524 / #ffffff` | — | Badge variant « default » (fond / texte) |
| `badge.secondary` | `#eeece6 / #44403c` | — | Badge variant « secondary » (fond / texte) |
| `badge.outline` | `transparent + #dfdcd9 border` | — | Badge variant « outline » (fond / texte) |
| `badge.destructive` | `#991b1b / #ffffff` | — | Badge variant « destructive » (fond / texte) |
| `badge.destructive-subtle` | `#f2e3e3 / #7f1d1d` | — | Badge variant « destructiveSubtle » (fond / texte) |
| `badge.ai` | `#ebe3f2 / #581c87` | — | Badge variant « ai » (fond / texte) |
| `badge.success` | `#e3f2ee / #064e3b` | — | Badge variant « success » (fond / texte) |
| `badge.info` | `#e3e7f2 / #1e3a8a` | — | Badge variant « info » (fond / texte) |
| `badge.warning` | `#f2ebe3 / #855b31` | — | Badge variant « warning » (fond / texte) |

### banner

| Token | Light | Dark | Usage |
|---|---|---|---|
| `banner.ai` | `#9333ea on #faf5ff · hover #7e22ce · border #e9d5ff` | — | Bandeau « ai » : accent / fond de dégradé / hover / bordure |
| `banner.info` | `#2563eb on #eff6ff · hover #1d4ed8 · border #bfdbfe` | — | Bandeau « info » : accent / fond de dégradé / hover / bordure |
| `banner.success` | `#059669 on #ecfdf5 · hover #047857 · border #a7f3d0` | — | Bandeau « success » : accent / fond de dégradé / hover / bordure |
| `banner.warning` | `#d97706 on #fffbeb · hover #b45309 · border #fde68a` | — | Bandeau « warning » : accent / fond de dégradé / hover / bordure |
| `banner.error` | `#dc2626 on #fef2f2 · hover #b91c1c · border #fecaca` | — | Bandeau « error » : accent / fond de dégradé / hover / bordure |
| `banner.neutral` | `#57534e on #fafaf9 · hover #44403c · border #dfdcda` | — | Bandeau « neutral » : accent / fond de dégradé / hover / bordure |

### step

| Token | Light | Dark | Usage |
|---|---|---|---|
| `step.default` | `#a8a29e / transparent / #78716c` | — | Étape neutre du ReasoningStepper (icône/fond/texte) |
| `step.green` | `#059669 / #cce6d9 / #064e3b` | — | Étape succès |
| `step.orange` | `#bd6c1a / #f9ecd6 / #855b31` | — | Étape en cours / warning |
| `step.red` | `#991b1b / #fef2f2 / #7f1d1d` | — | Étape erreur |

### piece

| Token | Light | Dark | Usage |
|---|---|---|---|
| `piece.expertise` | `#dfe8f5 / #1e3a8a` | — | Tag type de pièce « expertise » (fond / texte) |
| `piece.decision` | `#ede9fe / #5b21b6` | — | Tag type de pièce « decision » (fond / texte) |
| `piece.revenus` | `#dcfce7 / #166534` | — | Tag type de pièce « revenus » (fond / texte) |
| `piece.factures` | `#f9ecd6 / #855b31` | — | Tag type de pièce « factures » (fond / texte) |
| `piece.medical` | `#dbeafe / #1e40af` | — | Tag type de pièce « medical » (fond / texte) |
| `piece.correspondance` | `#eeece6 / #44403c` | — | Tag type de pièce « correspondance » (fond / texte) |
| `piece.administratif` | `#f1f5f9 / #475569` | — | Tag type de pièce « administratif » (fond / texte) |

### avatar

| Token | Light | Dark | Usage |
|---|---|---|---|
| `avatar.green` | `#cce6d9 / #064E3B` | — | Palette avatar « green » (fond / pièce d'échecs) |
| `avatar.blue` | `#dbeafe / #1e3a8a` | — | Palette avatar « blue » (fond / pièce d'échecs) |
| `avatar.plum` | `#ece0eb / #581c87` | — | Palette avatar « plum » (fond / pièce d'échecs) |
| `avatar.orange` | `#efdec4 / #78350f` | — | Palette avatar « orange » (fond / pièce d'échecs) |
| `avatar.rose` | `#ffe4e6 / #881337` | — | Palette avatar « rose » (fond / pièce d'échecs) |
| `avatar.cream` | `#eeece6 / #44403c` | — | Palette avatar « cream » (fond / pièce d'échecs) |
| `avatar.purple` | `#f3e8ff / #581c87` | — | Palette avatar « purple » (fond / pièce d'échecs) |

### icon

| Token | Light | Dark | Usage |
|---|---|---|---|
| `icon.default` | `#44403c` | `#d6d3d1` | Icône AlertDialog neutre |
| `icon.destructive` | `#7f1d1d` | `#f8b4b4` | Icône destructive |
| `icon.warning` | `#855b31` | `#f0c088` | Icône warning |
| `icon.success` | `#065f46` | `#86efac` | Icône succès |
| `icon.info` | `#1e3a8a` | `#a9c4f5` | Icône info |

### diff

| Token | Light | Dark | Usage |
|---|---|---|---|
| `diff.add` | `#059669` | — | Diff métier : ajout (rangées IV, artifacts) |
| `diff.edit` | `#bd6c1a` | — | Diff métier : modification (rangées IV, artifacts) |
| `diff.delete` | `#991b1b` | — | Diff métier : suppression (rangées IV, artifacts) |

### chart

| Token | Light | Dark | Usage |
|---|---|---|---|
| `chart-1` | `#8fc6ff` | — | Série graphique 1 (rampe bleue) |
| `chart-2` | `#297eff` | — | Série graphique 2 (rampe bleue) |
| `chart-3` | `#155dfc` | — | Série graphique 3 (rampe bleue) |
| `chart-4` | `#1447e6` | — | Série graphique 4 (rampe bleue) |
| `chart-5` | `#193cb8` | — | Série graphique 5 (rampe bleue) |

### cream

| Token | Light | Dark | Usage |
|---|---|---|---|
| `cream/200` | `#dbd7cd` | — | Cran cream/200 (palette CREAM IVAvatar, set 36533:7967) |
| `cream/400` | `#ac9e8b` | — | Cream/400 - filet du bloc « Apport » de JPListing (2219:19197) |
| `cream/900` | `#50443e` | — | Cream/900 - cran sombre de la rampe cream (IVAvatar) |

### doc

| Token | Light | Dark | Usage |
|---|---|---|---|
| `doc.pdf` | `#dc2626` | — | Icône fichier PDF rouge des rangées de tables (ActRow, RowDocuments, DocIcon) |

### composer

| Token | Light | Dark | Usage |
|---|---|---|---|
| `composer.processing-bg` | `#e5e3da` | `#26231f` | Bandeau système du composer : fond analyse en cours |
| `composer.warning-bg` | `#ecdbc9` | `#2a2016` | Bandeau système du composer : fond limite de quota |
| `composer.blocked-bg` | `#e5d4d2` | `#2a1a1a` | Bandeau système du composer : fond quota atteint |
| `composer.ask-header` | `#9c8973` | — | En-tête mono « USER ASK » du composer (cream/500) |

### dropzone

| Token | Light | Dark | Usage |
|---|---|---|---|
| `dropzone.extraction-border` | `#aabcd5` | `#35415c` | DropZone état extraction : bordure bleu pâle (alpha 50% via color-mix) |
| `dropzone.extraction-tint` | `#dfe8f5` | `#161d2b` | DropZone état extraction : teinte de fond (alpha 60% via color-mix) |

## Typographie

| Token | Définition (px / lh / ls / poids) | Usage |
|---|---|---|
| `font.sans` | `Inter, system fallbacks` | Toute l’UI - Inter |
| `font.serif` | `RL Para Trial Central, Albra, Georgia` | Titres display - RL Para Trial Central (licence Trial à valider avant prod) |
| `font.mono` | `IBM Plex Mono` | Code, labels de colonnes, chips techniques - IBM Plex Mono |
| `display-lg` | `30px / 28 / -0.6 / 400` | Grand titre serif de page (30px) |
| `display-sm` | `20px / 28 / -0.6 / 500` | Titre serif intermédiaire (24px) |
| `display-xs` | `16px / 20 / -0.5 / 500` | Petit titre serif (18px) |
| `heading-xl` | `24px / 28 / -0.6 / 600` | Titre de section majeur (sans 24) |
| `heading-xl-medium` | `24px / 32 / -0.6 / 500` | Variante medium du heading-xl |
| `heading-lg` | `20px / 28 / -0.6 / 600` | Titre de section (sans 20) |
| `heading-lg-medium` | `20px / 28 / -0.6 / 500` | Variante medium |
| `heading-md` | `18px / 28 / 0 / 600` | Sous-titre (sans 18) |
| `heading-md-medium` | `18px / 28 / 0 / 500` | Variante medium |
| `heading-sm` | `16px / 24 / 0 / 600` | Titre de bloc (sans 16) |
| `heading-sm-medium` | `16px / 24 / 0 / 500` | Variante medium |
| `body` | `14px / 20 / 0 / 400` | Texte courant (14/20) |
| `body-medium` | `14px / 20 / 0 / 500` | Texte courant accentué - libellés, boutons |
| `caption` | `12px / 16 / 0.12 / 400` | Légendes et méta (12/16) |
| `caption-medium` | `12px / 16 / 0 / 500` | Légende accentuée |
| `detail` | `12px / 18 / 0 / 500` | Texte tertiaire - tooltips, aides (Inter Medium 12/18) |
| `counter` | `10px / normal / 0 / 500` | Compteurs compacts (10) |
| `caption-header-cols` | `11px / normal / 0 / 500` | En-têtes de colonnes de tables (IBM Plex Mono Medium 11, uppercase) |

## Espacements

| Token | Valeur | Usage |
|---|---|---|
| `1` | `4px` | Pas d'espacement 4px |
| `2` | `8px` | Pas d'espacement 8px |
| `3` | `12px` | Pas d'espacement 12px |
| `4` | `16px` | Pas d'espacement 16px |
| `5` | `20px` | Pas d'espacement 20px |
| `0.5` | `2px` | Pas d'espacement 2px |
| `1.25` | `5px` | Pas d'espacement 5px — hors échelle (dette relevée) |
| `1.5` | `6px` | Pas d'espacement 6px |
| `1.75` | `7px` | Pas d'espacement 7px — hors échelle (dette relevée) |
| `2.5` | `10px` | Pas d'espacement 10px |
| `3.5` | `14px` | Pas d'espacement 14px |

## Radius

| Token | Valeur | Usage |
|---|---|---|
| `sm` | `4px` | 4px - surlignage (is-highlighted) |
| `xs` | `5px` | 5px - zones surlignées |
| `md` | `6px` | 6px - badges, petits contrôles |
| `lg` | `8px` | 8px - boutons |
| `xl` | `12px` | 12px - cartes et bannières (Figma --radius) |
| `full` | `9999px` | Pill / cercle (badges number, avatars) |

## Ombres

| Token | Valeur | Usage |
|---|---|---|
| `2xs` | `0px 1px 1px rgba(26,26,26,0.05)` | L0 contrôles - filets d'appui (chips, boutons, rangées) |
| `xs` | `0 1px 2px rgba(26,26,26,0.05)` | L0 contrôles - élévation minimale (alignée Figma shadow/xs : toggles, poignées) |
| `sm` | `0px 1px 4px -1px rgba(26,26,26,0.05), 0px 1px 2px -1px rgba(26,26,26,0.05)` | L1 cards & surfaces - cartes au repos (jamais un menu : L2) |
| `md` | `0 2px 6px -1px rgba(26,26,26,0.10), 0 1px 2px rgba(26,26,26,0.06)` | L1 cards & surfaces (cluster validé 24/09) - cartes actives, rangées soulevées |
| `lg` | `0 6px 16px -4px rgba(26,26,26,0.12), 0 2px 6px -2px rgba(26,26,26,0.08)` | L2 menus / dropdowns / popovers / context menus / command palettes |
| `xl` | `0px 8px 10px -1px rgba(26,26,26,0.05), 0px 4px 6px -4px rgba(26,26,26,0.05)` | Hors grille par rôle (hérité) - la carte du composer (2 couches Figma) ; ne pas viser pour les rôles L0-L4 |
| `2xl` | `0 14px 36px -8px rgba(26,26,26,0.14), 0 4px 10px -4px rgba(26,26,26,0.08)` | L3 panneaux flottants - toasts, feuilles, notifications (jamais un dropdown : L2, ni une modale : L4) |
| `3xl` | `0px 8px 17px rgba(0,0,0,0.03), 0px 30px 30px rgba(0,0,0,0.03), 0px 68px 41px rgba(0,0,0,0.02)` | Hors grille par rôle (hérité, relevé Previewer) - drawers / panneaux détachés ; ne pas viser pour les rôles L0-L4 |
| `4xl` | `0 24px 60px -14px rgba(28,25,23,0.28), 0 8px 20px -8px rgba(28,25,23,0.18)` | L4 dialogs - modales centrées (teinte stone) |
| `bannerButton` | `0 1px 2px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.05), inset 0 -1px 2px rgba(0,0,0,0.04)` | Bouton de bandeau (repos) |
| `bannerButtonHover` | `0 2px 6px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06), inset 0 -1px 2px rgba(0,0,0,0.04)` | Bouton de bandeau (survol) |
| `glowPulseStart` | `0 0 8px rgba(99, 102, 241, 0.3)` | Début du pulse de glow (indigo) |
| `glowPulseEnd` | `0 0 20px rgba(99, 102, 241, 0.5)` | Fin du pulse de glow |
| `focusRing` | `0 0 0 3px color-mix(in srgb, var(--semantic-borderHover, #a8a29e) 50%, transparent)` | Focus des contrôles de saisie - halo 3px borderHover 50 % + bord ring (arbitrage 24/09) ; jamais un halo local |
| `focusRingError` | `0 0 0 3px color-mix(in srgb, var(--banner-error-accent, #dc2626) 40%, transparent)` | Focus état erreur - halo 3px accent erreur 40 % (InputGroup error) |

## Motion

| Token | Valeur | Usage |
|---|---|---|
| `duration.instant` | `100ms` | Micro-feedback (100ms) |
| `duration.fast` | `150ms` | Hover, petites transitions (150ms) |
| `duration.base` | `250ms` | Transition standard (250ms) |
| `duration.slow` | `350ms` | Panneaux, entrées de blocs (350ms) |
| `duration.slower` | `600ms` | Séquences longues (600ms) |
| `duration.pulse` | `2000ms` | Cycle de pulsation (2s) |
| `duration.spinSlow` | `2500ms` | Rotation lente (2.5s) |
| `duration.gradient` | `3000ms` | Cycle de dégradé animé (3s) |
| `animation.shimmer` | `1.5s ease-in-out` | Chargement - balayage lumineux |
| `animation.bounceIn` | `0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Apparition avec rebond |
| `animation.fadeSlideUp` | `0.35s ease-out` | Entrée fade + montée |
| `animation.spinSlow` | `2.5s linear` | Rotation continue lente |
| `animation.fadeIn` | `0.2s ease-out` | Apparition simple |
| `animation.gradientShift` | `3s ease` | Dégradé animé (fonds marketing) |
| `animation.pulseScale` | `2s ease-in-out` | Pulsation de taille (points de streaming) |
| `animation.glowPulse` | `2s ease-in-out` | Pulse du glow brand |
| `animation.slideInRight` | `0.25s ease-out` | Entrée depuis la droite (panneaux) |
| `animation.highlightFade` | `3s ease-out` | Surlignage qui s’estompe (scroll-to) |
| `animation.diffAccepted` | `0.6s ease-out` | Diff accepté (flash vert) |
| `animation.diffRejected` | `0.6s ease-out` | Diff rejeté (flash rouge) |
| `animation.stepSlideIn` | `0.25s ease-out` | Entrée d’une étape de raisonnement |
| `animation.reasoningChildExpand` | `0.2s ease-out` | Dépliage des sous-étapes |

