# DECISIONS-HEX - migration des couleurs hex en dur vers les tokens

Généré le 22/09/2026 (mission « hex → ~0 », branche eastermeggg/install-skills-zip, non commité).
Règles appliquées : exact → token ; ΔE CIEDE2000 < 3 → snap ; ΔE > 10 et < 5 occ → snap dérive ;
#fafaf9 → fond actuel ; classes Tailwind brutes → utilities sémantiques ; marques tierces → whitelist `ds-hex-ok`.
Le solde (3 ≤ ΔE ≤ 10, ou ΔE > 10 avec ≥ 5 occ) est **en attente d'arbitrage** ci-dessous ;
chaque valeur est déclarée dans `ds.manifest.json → doctor.pendingHex` (le doctor la compte en warn, pas en erreur).

## Bilan chiffré

| Étape | Hex bloquants |
|---|---|
| Avant toute migration | 2656 |
| Début de mission (après sweep mécanique) | 980 (222 valeurs) |
| Après sweep étendu | 0 bloquant, 267 occ (59 valeurs) en attente |
| **Après §6 appliqué (steward « all good » 22/09)** | **VRAI ZÉRO** - 0 bloquant, 0 en attente (`pendingHex` vidé), 10 exceptions `ds-hex-ok` |

## 1. Appliqué - valeurs identiques à un token (48 valeurs, 412 occurrences)

Remplacées par le token de même valeur, choisi selon la catégorie de propriété (color→foreground, bg→surface, border→border).
<details><summary>Détail</summary>

| Valeur | Occ | Token |
|---|---|---|
| `#fafaf9` | 75 | `colors.banner.neutral.bgFrom` |
| `#cbc7c4` | 38 | `colors.semantic.borderStrong` |
| `#a8a29e` | 22 | `colors.semantic.borderHover` |
| `#fef2f2` | 20 | `colors.banner.error.bgFrom` |
| `#78716c` | 17 | `colors.semantic.mutedForeground` |
| `#dfdcd9` | 16 | `colors.semantic.border` |
| `#dcfce7` | 15 | `colors.piece.revenus.bg` |
| `#dfe8f5` | 15 | `colors.piece.expertise.bg` |
| `#292524` | 13 | `colors.semantic.foreground` |
| `#ffffff` | 13 | `colors.semantic.card` |
| `#eeece6` | 12 | `colors.semantic.muted` |
| `#ecfdf5` | 10 | `colors.banner.success.bgFrom` |
| `#1e3a8a` | 9 | `colors.feedback.info.text` |
| `#f9ecd6` | 9 | `colors.step.orange.bg` |
| `#dbeafe` | 9 | `colors.piece.medical.bg` |
| `#44403c` | 9 | `colors.semantic.secondaryForeground` |
| `#fecaca` | 8 | `colors.banner.error.border` |
| `#f8f7f5` | 8 | `colors.semantic.background` |
| `#f47a2c` | 8 | `colors.brand.DEFAULT` |
| `#dfdcda` | 8 | `colors.semantic.borderAlt` |
| `#991b1b` | 7 | `colors.feedback.destructive.base` |
| `#7f1d1d` | 7 | `colors.feedback.destructive.text` |
| `#b45309` | 5 | `colors.banner.warning.accentHover` |
| `#cce6d9` | 5 | `colors.step.green.bg` |
| `#855b31` | 5 | `colors.feedback.warning.text` |
| `#bd6c1a` | 4 | `colors.feedback.warning.base` |
| `#b91c1c` | 4 | `colors.banner.error.accentHover` |
| `#1e40af` | 4 | `colors.piece.medical.fg` |
| `#f5f5f4` | 4 | `colors.semantic.backgroundSubtle` |
| `#059669` | 3 | `colors.feedback.success.base` |
| `#fde68a` | 3 | `colors.banner.warning.border` |
| `#b8560f` | 3 | `colors.brand.subtleForeground` |
| `#047857` | 2 | `colors.banner.success.accentHover` |
| `#1d4ed8` | 2 | `colors.banner.info.accentHover` |
| `#bfdbfe` | 2 | `colors.banner.info.border` |
| `#166534` | 2 | `colors.piece.revenus.fg` |
| `#eff6ff` | 2 | `colors.banner.info.bgFrom` |
| `#fffbeb` | 2 | `colors.banner.warning.bgFrom` |
| `#57534e` | 2 | `colors.semantic.foregroundQuaternary` |
| `#d97706` | 2 | `colors.banner.warning.accent` |
| `#a7f3d0` | 1 | `colors.banner.success.border` |
| `#78350f` | 1 | `colors.avatar.3.fill` |
| `#065f46` | 1 | `colors.icon.success` |
| `#2563eb` | 1 | `colors.banner.info.accent` |
| `#5593ea` | 1 | `colors.feedback.info.base` |
| `#9333ea` | 1 | `colors.feedback.ai.base` |
| `#e3e7f2` | 1 | `colors.feedback.info.subtle` |
| `#7a6244` | 1 | `colors.accents.sand.base` |

</details>

## 2. Appliqué - snaps ΔE < 3 (99 valeurs) et #fafaf9 (règle explicite)

| Valeur | Occ | → Token | ΔE |
|---|---|---|---|
| `#92400e` | 19 | `colors.brand.darker.subtleForeground` | 1.84 |
| `#f0efed` | 14 | `colors.semantic.backgroundSubtle` | 1.37 |
| `#fff7ed` | 10 | `colors.feedback.warning.subtle` | 2.65 |
| `#eef3fa` | 9 | `colors.banner.info.bgFrom` | 1.18 |
| `#e0ddd6` | 9 | `colors.semantic.border` | 2.04 |
| `#d9d9d9` | 7 | `colors.semantic.borderAlt` | 1.8 |
| `#f0fdf4` | 6 | `colors.banner.success.bgFrom` | 1.48 |
| `#4a7256` | 6 | `colors.accents.emerald.base` | 2.92 |
| `#faf9f7` | 6 | `colors.semantic.background` | 0.41 |
| `#fdf8f4` | 6 | `colors.semantic.background` | 1.95 |
| `#f1efe9` | 5 | `colors.semantic.muted` | 0.63 |
| `#fee2e2` | 5 | `colors.avatar.4.bg` | 0.97 |
| `#fdf3ec` | 5 | `colors.brand.subtle` | 2.06 |
| `#f5f4f1` | 5 | `colors.semantic.background` | 0.82 |
| `#e4e1da` | 5 | `colors.semantic.border` | 2.28 |
| `#f9e6d3` | 4 | `colors.brand.darker.subtle` | 2.55 |
| `#f5f0e8` | 4 | `colors.feedback.warning.subtle` | 1.38 |
| `#ede9dd` | 4 | `colors.semantic.muted` | 2.71 |
| `#f5f4f0` | 4 | `colors.semantic.background` | 1.21 |
| `#f1f0ee` | 3 | `colors.semantic.backgroundSubtle` | 1.19 |
| `#d7e2f2` | 3 | `colors.piece.expertise.bg` | 1.84 |
| `#93c5fd` | 3 | `colors.chart.0` | 0.97 |
| `#3b82f6` | 3 | `colors.chart.1` | 1.49 |
| `#e9f1ea` | 3 | `colors.feedback.success.subtle` | 2.89 |
| `#c5221f` | 3 | `colors.banner.error.accentHover` | 2.76 |
| `#e4efe8` | 3 | `colors.feedback.success.subtle` | 1.98 |
| `#fcfbfa` | 3 | `colors.banner.neutral.bgFrom` | 0.56 |
| `#f0ede8` | 3 | `colors.semantic.muted` | 0.85 |
| `#f1efeb` | 3 | `colors.semantic.muted` | 1.2 |
| `#e5e2db` | 3 | `colors.semantic.muted` | 2.22 |
| `#c8c5c0` | 3 | `colors.semantic.borderStrong` | 1.45 |
| `#faf8f3` | 3 | `colors.semantic.background` | 1.47 |
| `#e0eaf6` | 2 | `colors.piece.expertise.bg` | 0.84 |
| `#e2ddd4` | 2 | `colors.semantic.border` | 2.84 |
| `#fdf4e7` | 2 | `colors.feedback.warning.subtle` | 2.83 |
| `#eef1f8` | 2 | `colors.piece.administratif.bg` | 1.88 |
| `#dbe3f5` | 2 | `colors.piece.expertise.bg` | 2.6 |
| `#fce8e6` | 2 | `colors.feedback.destructive.subtle` | 2.3 |
| `#e5e3da` | 2 | `colors.semantic.muted` | 2.46 |
| `#f5f3f0` | 2 | `colors.semantic.background` | 1.0 |
| `#e9e6e0` | 2 | `colors.semantic.muted` | 1.34 |
| `#f7f6f3` | 2 | `colors.semantic.background` | 0.56 |
| `#e2dfd8` | 2 | `colors.semantic.border` | 2.12 |
| `#f6f5f2` | 2 | `colors.semantic.background` | 0.67 |
| `#f4f1ea` | 2 | `colors.semantic.muted` | 1.22 |
| `#e7f3ec` | 2 | `colors.feedback.success.subtle` | 1.69 |
| `#f3eee4` | 2 | `colors.feedback.warning.subtle` | 1.68 |
| `#f4f4f5` | 1 | `colors.semantic.backgroundSubtle` | 1.1 |
| `#d1fae5` | 1 | `colors.piece.revenus.bg` | 2.39 |
| `#fefce8` | 1 | `colors.banner.warning.bgFrom` | 1.96 |
| `#ece9e4` | 1 | `colors.semantic.muted` | 0.99 |
| `#fdf0e4` | 1 | `colors.brand.subtle` | 0.82 |
| `#eef3fb` | 1 | `colors.banner.info.bgFrom` | 1.01 |
| `#dbe5f3` | 1 | `colors.piece.expertise.bg` | 0.83 |
| `#f6e7e4` | 1 | `colors.feedback.destructive.subtle` | 1.69 |
| `#faf6ef` | 1 | `colors.semantic.muted` | 2.36 |
| `#fff0e1` | 1 | `colors.brand.subtle` | 1.7 |
| `#c2590a` | 1 | `colors.brand.subtleForeground` | 2.39 |
| `#262220` | 1 | `colors.semantic.foreground` | 1.21 |
| `#302b28` | 1 | `colors.semantic.foreground` | 2.35 |
| `#4285f4` | 1 | `colors.chart.1` | 2.43 |
| `#e2ecf8` | 1 | `colors.piece.expertise.bg` | 1.1 |
| `#d9e4f2` | 1 | `colors.piece.expertise.bg` | 1.23 |
| `#e7e4de` | 1 | `colors.semantic.muted` | 1.76 |
| `#f4f2ee` | 1 | `colors.semantic.background` | 1.43 |
| `#ece9e3` | 1 | `colors.semantic.muted` | 0.78 |
| `#dde3f0` | 1 | `colors.feedback.info.subtle` | 1.4 |
| `#e8792b` | 1 | `colors.brand.DEFAULT` | 2.35 |
| `#f7e3d2` | 1 | `colors.brand.darker.subtle` | 2.21 |
| `#e2f4e8` | 1 | `colors.accents.emerald.subtle` | 1.4 |
| `#f3efe3` | 1 | `colors.semantic.muted` | 2.69 |
| `#fdecec` | 1 | `colors.feedback.destructive.subtle` | 2.14 |
| `#f3e8ff` | 1 | `colors.piece.decision.bg` | 2.88 |
| `#f5f3ff` | 1 | `colors.banner.ai.bgFrom` | 1.56 |
| `#fdf2f8` | 1 | `colors.banner.error.bgFrom` | 2.77 |
| `#e9e4dc` | 1 | `colors.feedback.warning.subtle` | 1.88 |
| `#d9d3c8` | 1 | `colors.accents.sand.border` | 1.51 |
| `#f0eee9` | 1 | `colors.semantic.muted` | 0.66 |
| `#eaf1ff` | 1 | `colors.piece.expertise.bg` | 2.32 |
| `#dfe9fb` | 1 | `colors.piece.medical.bg` | 1.84 |
| `#e3d8c2` | 1 | `colors.avatar.3.bg` | 2.97 |
| `#f6f5f3` | 1 | `colors.semantic.background` | 0.41 |
| `#e0ded9` | 1 | `colors.semantic.border` | 1.34 |
| `#cbd5e1` | 1 | `colors.accents.slate.border` | 1.25 |
| `#e0e9f7` | 1 | `colors.piece.expertise.bg` | 0.5 |
| `#f0efec` | 1 | `colors.semantic.muted` | 1.58 |
| `#e7e5e1` | 1 | `colors.semantic.muted` | 1.78 |
| `#fbe7e4` | 1 | `colors.feedback.destructive.subtle` | 2.34 |
| `#e3f0e8` | 1 | `colors.accents.emerald.subtle` | 1.22 |
| `#fbf3e0` | 1 | `colors.banner.warning.bgFrom` | 2.43 |
| `#4f5b6e` | 1 | `colors.piece.administratif.fg` | 2.34 |
| `#edf2fe` | 1 | `colors.banner.info.bgFrom` | 2.07 |
| `#efebfe` | 1 | `colors.piece.decision.bg` | 0.84 |
| `#e8f2ea` | 1 | `colors.accents.emerald.subtle` | 2.19 |
| `#c8dccd` | 1 | `colors.accents.emerald.border` | 0.8 |
| `#eef1f5` | 1 | `colors.piece.administratif.bg` | 0.92 |
| `#d6dde5` | 1 | `colors.accents.slate.subtle` | 2.87 |
| `#c9c4be` | 1 | `colors.semantic.borderStrong` | 1.68 |
| `#f1e4d3` | 1 | `colors.step.orange.bg` | 2.59 |

## 3. Appliqué - snaps de dérive ΔE > 10, < 5 occurrences (13 valeurs)

| Valeur | Occ | → Token | ΔE |
|---|---|---|---|
| `#25d366` | 1 | `colors.banner.success.border` | 17.96 |
| `#8a7cae` | 1 | `colors.accents.slate.base` | 17.89 |
| `#a08355` | 2 | `colors.feedback.warning.base` | 13.86 |
| `#34d399` | 1 | `colors.banner.success.border` | 12.66 |
| `#6f8f78` | 2 | `colors.feedback.success.base` | 12.33 |
| `#f59e0b` | 3 | `colors.banner.warning.accent` | 12.22 |
| `#be185d` | 1 | `colors.avatar.4.fill` | 11.82 |
| `#9c8973` | 2 | `colors.semantic.borderHover` | 11.33 |
| `#8a6d1f` | 1 | `colors.accents.sand.base` | 11.33 |
| `#9a7b4f` | 1 | `colors.accents.sand.base` | 10.98 |
| `#b9a07a` | 4 | `colors.brand.darker.border` | 10.56 |
| `#b3a4c9` | 2 | `colors.feedback.ai.border` | 10.53 |
| `#34a853` | 1 | `colors.feedback.success.base` | 10.1 |

## 4. Appliqué - classes Tailwind brutes → utilities sémantiques (155 occurrences)

| Classe | Occ | → Classe | ΔE |
|---|---|---|---|
| `text-blue-600` | 15 | `text-chart-3` | 2.68 |
| `bg-stone-100` | 14 | `bg-background-subtle` | 0.0 |
| `bg-blue-100` | 11 | `bg-piece-medical-bg` | 0.0 |
| `border-zinc-100` | 9 | `border-background-subtle` | 1.1 |
| `bg-blue-50` | 7 | `bg-info-bg` | 1.18 |
| `text-stone-400` | 5 | `text-foreground-muted` | 0.0 |
| `bg-stone-50` | 5 | `bg-background` | 0.85 |
| `bg-blue-600` | 5 | `bg-chart-3` | 2.68 |
| `text-stone-600` | 4 | `text-foreground-quaternary` | 0.0 |
| `text-amber-700` | 4 | `text-brand-subtle-foreground` | 1.25 |
| `bg-zinc-200` | 4 | `bg-stone-subtle` | 2.65 |
| `bg-gray-200` | 4 | `bg-slate-subtle` | 2.54 |
| `text-amber-800` | 3 | `text-brand-darker-subtle-foreground` | 1.84 |
| `text-amber-500` | 3 | `text-brand-darker-border` | 13.83 |
| `ring-stone-200` | 3 | `ring-stone-subtle` | 1.23 |
| `border-stone-400` | 3 | `border-foreground-muted` | 0.0 |
| `border-blue-300` | 3 | `border-chart-1` | 0.97 |
| `bg-stone-200` | 3 | `bg-stone-subtle` | 1.23 |
| `bg-blue-700` | 3 | `bg-chart-4` | 2.64 |
| `text-zinc-200` | 2 | `text-stone-subtle` | 2.65 |
| `text-stone-700` | 2 | `text-foreground-tertiary` | 0.0 |
| `text-stone-500` | 2 | `text-foreground-secondary` | 0.0 |
| `text-stone-300` | 2 | `text-stone-border` | 1.16 |
| `text-green-800` | 2 | `text-piece-revenus-fg` | 0.0 |
| `text-blue-900` | 2 | `text-link` | 0.0 |
| `ring-zinc-100` | 2 | `ring-background-subtle` | 1.1 |
| `border-stone-100` | 2 | `border-background-subtle` | 0.0 |
| `border-blue-100` | 2 | `border-piece-medical-bg` | 0.0 |
| `bg-stone-300` | 2 | `bg-stone-border` | 1.16 |
| `bg-red-600` | 2 | `bg-danger` | 14.0 |
| `bg-green-50` | 2 | `bg-emerald-subtle` | 2.54 |
| `bg-emerald-50` | 2 | `bg-emerald-subtle` | 2.45 |

Snaps contextuels faits à la main (états `hover:` impossibles en style inline → utility sémantique de la même famille) :
`hover:bg-[#ecfdf5]`→`hover:bg-success-subtle` ×4, `hover:bg-[#bfdbfe]`→`hover:bg-info-subtle`,
boutons destructifs normalisés `bg-danger-subtle` / `hover:bg-danger-border` ×3, `text-[#b91c1c]`→`text-danger` (ΔE≈2.6),
glow Plato (AssistantComposer, PlatoAssistantButton) → `brand.DEFAULT` + `borderStrong` interpolés, masques alpha `#000`→`black`,
keyframes ConnectorArt → `banner.info.bgFrom` ↔ `piece.expertise.bg`, gradients ConnectorPromo/PreviewPanel interpolés.

## 5. Whitelist `ds-hex-ok` (9 occurrences)

Tracés officiels des logos Gmail (5) et WhatsApp (1) dans ConnectorArt, rouge de marque Gmail dans les données
connecteurs (2 : App.js, connectorData.js), valeur citée comme texte de doc (1, App.js). Le doctor ignore aussi
les hex en commentaire (rien n'est rendu) et les entités HTML `&#8203;`.

## 6. APPLIQUÉ EN BLOC (steward « all good », 22/09/2026)

Décisions tranchées et appliquées. **2 nouveaux tokens créés** (valeurs récurrentes hors palette qui se seraient distordues au snap) : `accents.ochre` = `#b9703f` (ex-×61) et `accents.meadow` = `#4a9168` (ex-×23), ajoutés à `tokens.js` + `tailwind.config.js`. `#000000` (×18) → `semantic.foreground` (normalisation : pas de noir pur dans un thème pierre chaud). Tout le reste snappé vers le token le plus proche (tableaux ci-dessous, valeurs indicatives conservées). Les 120 classes Tailwind brutes hors labs migrées sémantiquement (rouge→danger, ambre→warning, vert→success/emerald, violet→ai, bleu→info, gris→foreground/border). Gradients d'identité (`from-*-400/to-*-500`, 14 occ) **conservés** : couleurs d'avatar décoratives, pas des hex, comme `colors.avatar`. Dérive `piece.expertise.bg` : laissée telle quelle (l'app rend `bg-info-subtle`, cohérent ; `tokens.js` protégé, non touché). `pendingHex` vidé dans le manifeste - le doctor repasserait tout hex en erreur bloquante.

### Détail des cibles (pour mémoire) — EN ATTENTE au moment du rapport, désormais appliquées

Déclarées dans `doctor.pendingHex` : le doctor les compte en warn. Une fois tranchées, retirer du manifeste et appliquer.

### 6a. Valeurs inline (59 valeurs, 267 occurrences)

| Valeur | Occ | Fichiers principaux | Proposition | ΔE |
|---|---|---|---|---|
| `#b9703f` | 61 | JPAddStepper.js, App.js, JPSearchView.js | **nouveau token** `accents.ochre` (ou snap warning.base) | 5.92 |
| `#4a9168` | 23 | App.js, ConnectorArt.js, ConnectorPromo.js | **nouveau token** `accents.meadow` (vert marketing connecteurs) ou snap success.base | 4.94 |
| `#000000` | 18 | AssistantComposer.js, PlatoAssistantButton.js, App.js | snap `semantic.foreground` (ou token `black` assumé) | 9.59 |
| `#3f7d5f` | 15 | ReleveHeuresLab.js | snap `accents.emerald.base` (identité relevé d'heures) | 4.33 |
| `#18181b` | 14 | App.js, LicenceSummaryCard.js, ConnectorPromo.js | snap `colors.semantic.foreground` | 5.5 |
| `#fef3c7` | 10 | App.js, JPSearchView.js | snap `colors.step.orange.bg` | 7.25 |
| `#aabcd5` | 9 | App.js, JPAddStepper.js, ReleveHeuresLab.js | snap `colors.feedback.info.border` | 6.97 |
| `#1c1917` | 9 | OnboardingFlow.js, App.js, DecisionDrawer.js | snap `colors.semantic.foreground` | 4.01 |
| `#c45555` | 7 | App.js | snap `colors.banner.error.accent` | 10.0 |
| `#b4483c` | 7 | ConnectorArt.js, App.js | snap `colors.banner.error.accentHover` | 7.2 |
| `#c4d5ea` | 7 | ReleveHeuresLab.js | snap `colors.accents.slate.border` | 4.18 |
| `#b4453a` | 7 | ReleveHeuresLab.js | snap `colors.banner.error.accentHover` | 6.58 |
| `#bbf7d0` | 6 | App.js | snap `colors.banner.success.border` | 3.33 |
| `#27272a` | 6 | App.js, ConversationsIndexPage.js | snap `colors.semantic.foreground` | 3.4 |
| `#1a1a1a` | 6 | ActCanvas.js, App.js, MoveToFolderModal.js | snap `colors.semantic.foreground` | 4.55 |
| `#a5c9b7` | 5 | App.js | snap `colors.accents.emerald.border` | 7.34 |
| `#cf9d9d` | 5 | App.js | **nouveau token** ou snap banner.error.border | 11.69 |
| `#fed7aa` | 5 | App.js | snap `colors.brand.border` | 4.62 |
| `#e8713a` | 5 | App.js | snap `colors.brand.DEFAULT` | 5.12 |
| `#ece8db` | 5 | SplitVariantsLab.js | snap `colors.semantic.muted` | 3.16 |
| `#e0dcd0` | 4 | SplitVariantsLab.js | snap `colors.accents.sand.border` | 3.4 |
| `#37352f` | 4 | ActCanvas.js | snap `colors.semantic.secondaryForeground` | 4.31 |
| `#eeb97e` | 3 | App.js, AlertDialog.js | snap `colors.brand.darker.border` | 4.27 |
| `#ac9e8b` | 3 | App.js, JPMemoryRow.js, JPRow.js | snap `colors.semantic.borderHover` | 6.87 |
| `#9ca3af` | 3 | App.js | snap `colors.semantic.borderHover` | 9.0 |
| `#7c3aed` | 3 | PileAdjustSheet.js, PreferenceSlots.js | snap `colors.feedback.ai.base` | 3.57 |
| `#b4593f` | 2 | App.js, ReleveHeuresLab.js | snap `colors.brand.subtleForeground` | 9.83 |
| `#71717a` | 2 | App.js | snap `colors.semantic.mutedForeground` | 7.86 |
| `#4a72b0` | 2 | App.js | snap `colors.banner.info.accent` | 7.77 |
| `#641515` | 2 | AlertDialog.js, Button.js | snap `colors.feedback.destructive.text` | 5.61 |
| `#ecdbc9` | 2 | ChatComposerNotice.js, ComposerSystemHeader.js | snap `colors.avatar.3.bg` | 3.25 |
| `#e5d4d2` | 2 | ChatComposerNotice.js, ComposerSystemHeader.js | snap `colors.feedback.destructive.border` | 3.35 |
| `#86efac` | 1 | App.js | snap `colors.banner.success.border` | 7.86 |
| `#a1a1aa` | 1 | App.js | snap `colors.semantic.borderHover` | 6.86 |
| `#9a3412` | 1 | App.js | snap `colors.brand.darker.subtleForeground` | 7.19 |
| `#16a34a` | 1 | App.js | snap `colors.feedback.success.base` | 9.53 |
| `#e7c9a6` | 1 | App.js | snap `colors.brand.border` | 5.53 |
| `#e7c5c0` | 1 | App.js | snap `colors.feedback.destructive.border` | 4.82 |
| `#b8cdec` | 1 | OnboardingFlow.js | snap `colors.banner.info.border` | 3.71 |
| `#44506b` | 1 | ConnectorPromo.js | snap `colors.piece.administratif.fg` | 3.89 |
| `#f6b378` | 1 | ConnectorPromo.js | snap `colors.brand.darker.border` | 3.81 |
| `#d9772e` | 1 | ConnectorPromo.js | snap `colors.banner.warning.accent` | 4.53 |
| `#fca5a5` | 1 | BordereauTable.js | snap `colors.banner.error.border` | 9.59 |
| `#c0392b` | 1 | ErrorCard.js | snap `colors.banner.error.accentHover` | 4.66 |
| `#6d28d9` | 1 | PreviewPanel.js | snap `colors.banner.ai.accentHover` | 3.07 |
| `#c2410c` | 1 | PreviewPanel.js | snap `colors.banner.warning.accentHover` | 6.89 |
| `#cec7ba` | 1 | PreviewPanel.js | snap `colors.accents.sand.border` | 3.23 |
| `#8c857d` | 1 | ActOutline.js | snap `colors.semantic.mutedForeground` | 7.87 |
| `#c7c2b8` | 1 | ExportBordereauMenu.js | snap `colors.semantic.borderStrong` | 3.67 |
| `#5b6472` | 1 | ReleveHeuresLab.js | snap `colors.accents.slate.base` | 4.39 |
| `#9db4d8` | 1 | ReleveHeuresLab.js | snap `colors.chart.0` | 8.56 |
| `#3a5488` | 1 | ReleveHeuresLab.js | snap `colors.accents.slate.text` | 7.65 |
| `#e8d8a6` | 1 | ReleveHeuresLab.js | snap `colors.avatar.3.bg` | 7.47 |
| `#6f5a1f` | 1 | ReleveHeuresLab.js | snap `colors.accents.sand.base` | 8.78 |
| `#5a9469` | 1 | ReleveHeuresLab.js | snap `colors.feedback.success.base` | 7.06 |
| `#cdd9f5` | 1 | cotisationsSocial.js | snap `colors.piece.medical.bg` | 5.19 |
| `#ddd3f6` | 1 | cotisationsSocial.js | snap `colors.banner.ai.border` | 3.55 |
| `#ded1ba` | 1 | cotisationsSocial.js | snap `colors.avatar.3.bg` | 3.53 |
| `#c98a3c` | 1 | pricing.js | snap `colors.banner.warning.accent` | 7.83 |

### 6b. Classes Tailwind brutes (31 classes, ~120 occurrences)

| Classe | Occ | Proposition | ΔE |
|---|---|---|---|
| `text-gray-700` | 12 | `text-piece-administratif-fg` | 6.85 |
| `ring-zinc-300` | 12 | `ring-border-alt` | 3.7 |
| `border-zinc-400` | 11 | `border-border-hover` | 6.86 |
| `bg-red-50` | 11 | `bg-danger-subtle` | 3.28 |
| `bg-amber-50` | 10 | `bg-piece-factures-bg` | 4.96 |
| `bg-zinc-800` | 7 | `bg-foreground` | 3.4 |
| `border-amber-200` | 7 | **nouveau token** « rouge vif » / « ambre » ? ou `border-piece-factures-bg` | 15.46 |
| `text-red-600` | 7 | **nouveau token** « rouge vif » / « ambre » ? ou `text-danger` | 14.0 |
| `text-red-500` | 7 | **nouveau token** « rouge vif » / « ambre » ? ou `text-brand-subtle-foreground` | 19.03 |
| `text-amber-600` | 6 | `text-warning` | 6.51 |
| `text-red-400` | 6 | **nouveau token** « rouge vif » / « ambre » ? ou `text-brand` | 19.66 |
| `border-zinc-300` | 4 | `border-border-alt` | 3.7 |
| `text-green-600` | 3 | `text-success` | 9.53 |
| `bg-red-700` | 2 | `bg-danger` | 6.49 |
| `text-green-700` | 1 | `text-emerald` | 8.66 |
| `text-purple-700` | 1 | `text-piece-decision-fg` | 6.36 |
| `bg-amber-100` | 1 | `bg-piece-factures-bg` | 7.25 |
| `bg-pink-100` | 1 | `bg-ai-subtle` | 5.03 |
| `bg-cyan-100` | 1 | `bg-success-subtle` | 8.12 |
| `border-blue-400` | 1 | `border-info` | 5.51 |
| `border-emerald-200` | 1 | `border-piece-revenus-bg` | 9.54 |
| `text-emerald-700` | 1 | `text-emerald` | 5.88 |
| `text-amber-900` | 1 | `text-brand-darker-subtle-foreground` | 6.44 |
| `border-green-200` | 1 | `border-piece-revenus-bg` | 7.7 |
| `text-green-900` | 1 | `text-piece-revenus-fg` | 6.07 |
| `bg-purple-50` | 1 | `bg-violet-subtle` | 4.29 |
| `border-purple-200` | 1 | `border-ai-border` | 8.25 |
| `text-purple-800` | 1 | `text-piece-decision-fg` | 3.6 |
| `bg-zinc-400` | 1 | `bg-foreground-muted` | 6.86 |
| `ring-red-200` | 1 | `ring-danger-border` | 9.57 |
| `border-red-200` | 1 | `border-danger-border` | 9.57 |

### 6c. Sets à trancher globalement

- **Gradients d'identité** `from-{violet,sky,rose,lime,fuchsia,emerald,amber}-400` + `to-{teal,purple,pink,orange,indigo,green,blue}-500`
  (14 occurrences ×1) : palette décorative d'identités. Snapper valeur par valeur détruirait la différenciation →
  candidat **token set** `colors.identity[]` (comme `colors.avatar`), ou statu quo assumé.
- **Dérive `tokens.piece.expertise.bg`** : tokens.js dit `#dfe8f5`, l'app rend `bg-info-subtle` (`#e3e7f2`, ΔE≈1.5).
  Trancher : mettre tokens.js à jour (sur main) ou revenir à `#dfe8f5` dans l'app.

## 7. Vérifications

- `npm run build` vert après chaque lot ; chaque chemin de token écrit vérifié programmatiquement contre tokens.js.
- `npm run ds:doctor` : **exit 0, 0 constat bloquant**. CI : `.github/workflows/ds.yml` (échoue sur tout hex hors whitelist).
- Passe visuelle avant/après : à faire par la steward avant commit (rien n'est commité).
