# Relevé du thème Figma — Plato (couleurs)

**v2 — 22/09/2026 : réconcilié contre les VRAIES Variables Figma.** La steward a
fourni des captures du **panneau Variables** (colors/light + sous-groupes
sidebar/custom/shadow/chart). C'est la source **autoritaire**, qui corrige le v1 :
le v1 s'appuyait sur la table de doc « Plato Theme documentation » (`37373:4712`),
**écrite à la main et périmée** - exactement le risque signalé (§2). Diff v1→v2 :

- **`brand` n'est PAS une dérive.** Vraie Variable = **#F47A2C** = `tokens.js`
  (`#f47a2c`). Le v1 lisait #FF6D04 dans la doc périmée. Correction majeure.
- Réconciliation code vs Variables : **72 tokens identiques**, **3 seules dérives
  réelles** = `border`/`input` (Figma stone/200 #E7E5E3 vs code #dfdcd9) et
  `border-strong` (stone/300 #D6D3D1 vs #cbc7c4) — la dérive *délibérée*
  « assombri d'un demi-cran (contraste nav) » documentée dans `tokens.js`.
- **Le mode dark EXISTE** dans les Variables (section « dark », 50 tokens) - non
  capturé dans ces screenshots. Le dark en code est donc *dérivé* faute d'accès
  MCP, mais un vrai relevé dark est possible (screenshot du groupe « dark »).
- Les alias-seul du v1 sont résolus : `destructive→red/800`, `destructive-text→red/900`,
  `success→emerald/800`, `ai→purple/600`, `ai-text→purple/900`.
- Tokens Figma **absents de `tokens.js`** (non consommés par l'app) : groupe
  `sidebar/*`, `custom/*` (focus, destructive-focus, bg-input-*, bg-primary-10),
  `shadow/*` (monochromes #1A1A1A à opacité variable), `opacity-*`, `bg-input-warning`.

**v1 — 22/09/2026.** Photographie datée du thème couleur, pas un import. 
Aucune valeur inventée ; les décisions (aliaser, corriger une dérive, appliquer à `tokens.js`) 
viennent après, en réconciliation, validées par la steward. Ce document n'écrit ni `tokens.js` ni le code.

## 1. En-tête

| | |
|---|---|
| Source | `Plato---System` — `0eKtlRkT1Hbjh8Nqd47Woy` |
| Nœud fourni | `35720:35726` (canvas « ↳ Colors ») |
| Frame relevée | `37373:4712` — « Plato Theme documentation », *Updated 10/08/2026* |
| Portée | tokens de **thème couleur** (couche sémantique + familles), pas les primitives brutes |
| Méthode | `get_metadata` (structure + cellules texte) ; `get_variable_defs` sur la frame et sur la table ; `get_screenshot` pour la structure des colonnes |
| Confiance globale | **moyenne-haute** pour le Light (hex explicites en texte) ; **dark NON relevé** (voir anomalies) |

## 2. Synthèse

- **109 tokens de thème** relevés sur 21 familles. (La frame annonce « 255 variable-bound tokens » : les 255 comptent aussi les pas de primitives — stone/50…950, red/50…950 — hors périmètre d'un relevé de thème.)
- **Bloquant 1 — Dark non documenté.** L'en-tête de table est `Token name | Light | — | Description` : la colonne dark est un tiret. Le sous-titre dit « light/dark modes » mais aucune valeur dark n'est écrite. Le dark est *variable-bound* et non extractible du metadata.
- **Bloquant 2 — Table non variabilisée en masse.** `get_variable_defs` sur la table (`37373:4720`) renvoie `{}` : les hex sont des **cellules texte écrites à la main**, susceptibles de périmer. Confiance plafonnée à « observation », pas « Variable résolue ».
- **8 lignes en alias-seul** (famille DESTRUCTIVE / AI surtout) : la table montre l'alias primitif (`red/800`, `white`, `purple/600`) sans hex résolu. Non vérifiable → consigné tel quel, hex laissé vide.

## 3. Tables par famille (Light uniquement)

Colonnes : Nom source | Light (hex) | Primitive (alias) | Description | Confiance. 
« alias seul » = pas de hex explicite dans la table.

### BACKGROUND

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `background` | #F8F7F5 | cream/50 | Default page background | observation |

### FOREGROUND

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `foreground` | #292524 | stone/800 | Primary text | observation |
| `muted` | #EEECE6 | cream/100 | Muted background | observation |
| `muted-foreground` | #78716C | stone/500 | Muted text color | observation |

### CARD

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `card` | #FFFFFF | white | Card surface | observation |
| `card-foreground` | #292524 | stone/800 | Text inside cards | observation |

### POPOVER

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `popover` | #FFFFFF | white | Popover surface | observation |
| `popover-foreground` | #292524 | stone/800 | Text inside popovers | observation |

### BORDERS & INPUTS

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `border` | #E7E5E3 | stone/200 | Default border | observation |
| `border-strong` | #D6D3D1 | stone/300 | Strong border | observation |
| `border-hover` | #A8A29E | stone/400 | Border on hover | observation |
| `input` | #E7E5E3 | stone/200 | Input border | observation |
| `ring` | #292524 | stone/800 | Focus ring | observation |

### PRIMARY / SECONDARY / ACCENT

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `primary` | #292524 | stone/800 | Primary action | observation |
| `primary-foreground` | #FFFFFF | white | Text on primary | observation |
| `secondary` | #EEECE6 | cream/100 | Secondary surface | observation |
| `secondary-foreground` | #44403C | stone/700 | Text on secondary | observation |
| `accent` | #F8F7F5 | cream/50 | Hover/focus accent | observation |
| `accent-foreground` | #292524 | stone/800 | Text on accent | observation |

### BRAND

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `brand` | #FF6D04 | — | Brand solid fill | observation |
| `brand-subtle` | #FFF0E0 | — | Brand subtle background | observation |
| `brand-border` | #FFBF80 | — | Brand border | observation |
| `brand-muted-foreground` | #CC5700 | — | Text on brand-muted | observation |

### DESTRUCTIVE

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `destructive` | — | red/800 | Destructive solid fill | **alias seul** |
| `destructive-subtle` | #F2E3E3 | — | Destructive subtle background | observation |
| `destructive-border` | #DBC7C7 | — | Destructive border | observation |
| `destructive-foreground` | — | white | Destructive text on solid | **alias seul** |
| `destructive-text` | — | red/900 | Destructive contextual text | **alias seul** |

### SUCCESS

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `success` | #059669 | emerald/600 | success | observation |
| `success-subtle` | #E3F2EE | — | Success subtle background | observation |
| `success-foreground` | #FFFFFF | white | Success text on solid | observation |
| `success-text` | #064E3B | emerald/900 | Success contextual text | observation |
| `border-success` | #C7DBD6 | — | Success border | observation |

### WARNING

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `warning` | #BD6C1A | — | Warning solid fill | observation |
| `warning-foreground` | — | white | Warning text on solid | **alias seul** |
| `warning-subtle` | #F2EBE3 | — | Warning subtle background | observation |
| `warning-border` | #DBD1C7 | — | Warning border | observation |
| `warning-text` | #855B31 | — | Warning contextual text | observation |

### INFO

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `info` | #5593EA | — | Info solid fill | observation |
| `info-subtle` | #E3E7F2 | — | Info subtle background | observation |
| `info-border` | #C7CCDB | — | Info border | observation |
| `info-foreground` | — | white | Info text on solid | **alias seul** |
| `info-text` | #1E3A8A | — | AI | observation |
| `ai` | — | purple/600 | ai | **alias seul** |
| `ai-subtle` | #EBE3F2 | — | Ai subtle background | observation |
| `ai-border` | #D2C7DB | — | AI border | observation |
| `ai-text` | — | purple/900 | Ai contextual text | **alias seul** |
| `ai-foreground` | — | white | Ai text on solid | **alias seul** |

### SIDEBAR

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `sidebar/sidebar` | #FFFFFF | white | Sidebar background | observation |
| `sidebar/foreground` | #78716C | stone/500 | Sidebar text color | observation |
| `sidebar/primary` | #292524 | stone/800 | Sidebar primary action | observation |
| `sidebar/primary-foreground` | #FFFFFF | white | Sidebar primary action text | observation |
| `sidebar/accent` | #F8F7F5 | cream/50 | Sidebar accent/hover | observation |
| `sidebar/accent-foreground` | #292524 | stone/800 | Sidebar accent text | observation |
| `sidebar/border` | #E7E5E3 | stone/200 | Sidebar border | observation |
| `sidebar/ring` | #A1A1A1 | — | Sidebar focus ring | observation |

### CHART

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `chart/chart-1` | #8FC6FF | — | Chart series 1 | observation |
| `chart/chart-2` | #297EFF | — | Chart series 2 | observation |
| `chart/chart-3` | #155DFC | — | Chart series 3 | observation |
| `chart/chart-4` | #1447E6 | — | Chart series 4 | observation |
| `chart/chart-5` | #193CB8 | — | Chart series 5 | observation |

### CUSTOM & OPACITY

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `custom/focus` | #A3A3A3 | — | Focus ring overlay | observation |
| `custom/destructive-focus` | #DC2828 | — | Destructive focus ring | observation |
| `custom/bg-input-30` | #FFFFFF | white | Input background 30% | observation |
| `custom/bg-input-50` | #F8F7F5 | cream/50 | Input background 50% | observation |
| `custom/bg-input-80` | #DBD7CD | cream/200 | Input background 80% | observation |
| `custom/bg-primary-10` | #171717 | — | Primary background 10% | observation |
| `opacity-90` | #FFFFFF | — | Opacity layer 90% | observation |
| `opacity-80` | #FFFFFF | — | Opacity layer 80% | observation |
| `opacity-50` | #FFFFFF | — | Opacity layer 50% | observation |
| `opacity-30` | #FFFFFF | — | Opacity layer 30% | observation |

### SHADOW COLORS

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `shadow/2xs` | #1A1A1A | — | Shadow 2xs color | observation |
| `shadow/xs` | #1A1A1A | — | Shadow xs color | observation |
| `shadow/sm` | #1A1A1A | — | Shadow sm color | observation |
| `shadow/shadow` | #1A1A1A | — | Default shadow color | observation |
| `shadow/md` | #1A1A1A | — | Shadow md color | observation |
| `shadow/lg` | #1A1A1A | — | Shadow lg color | observation |
| `shadow/xl` | #1A1A1A | — | Shadow xl color | observation |
| `shadow/2xl` | #1A1A1A | — | Shadow 2xl color | observation |

### INDIGO

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `indigo` | #3B5BDB | — | Indigo base | observation |
| `indigo-foreground` | #FFFFFF | — | Indigo foreground | observation |
| `indigo-subtle` | #E3E6F2 | — | Indigo subtle background | observation |
| `indigo-text` | #2143CC | — | Indigo text | observation |
| `indigo-border` | #C7CBDB | — | Indigo border | observation |

### VIOLET

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `violet` | #6D46C8 | — | Violet base | observation |
| `violet-foreground` | #FFFFFF | — | Violet foreground | observation |
| `violet-subtle` | #E8E3F2 | — | Violet subtle background | observation |
| `violet-text` | #5931B4 | — | Violet text | observation |
| `violet-border` | #CDC7DB | — | Violet border | observation |

### EMERALD

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `emerald` | #3F7350 | — | Emerald base | observation |
| `emerald-foreground` | #FFFFFF | — | Emerald foreground | observation |
| `emerald-subtle` | #E3F2E8 | — | Emerald subtle background | observation |
| `emerald-text` | #346344 | — | Emerald text | observation |
| `emerald-border` | #C7DBCE | — | Emerald border | observation |

### SAND

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `sand` | #7A6244 | — | Sand base | observation |
| `sand-foreground` | #FFFFFF | — | Sand foreground | observation |
| `sand-subtle` | #F2EBE3 | — | Sand subtle background | observation |
| `sand-text` | #695339 | — | Sand text | observation |
| `sand-border` | #DBD2C7 | — | Sand border | observation |

### SLATE

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `slate` | #52657D | — | Slate base | observation |
| `slate-foreground` | #FFFFFF | — | Slate foreground | observation |
| `slate-subtle` | #E3EAF2 | — | Slate subtle background | observation |
| `slate-text` | #45566B | — | Slate text | observation |
| `slate-border` | #C7D0DB | — | Slate border | observation |

### STONE

| Nom source | Light | Primitive | Description | Confiance |
|---|---|---|---|---|
| `stone` | #78716C | — | Stone base | observation |
| `stone-foreground` | #FFFFFF | — | Stone foreground | observation |
| `stone-subtle` | #EDEAE9 | — | Stone subtle background | observation |
| `stone-text` | #66605C | — | Stone text | observation |
| `stone-border` | #D5D0CD | — | Stone border | observation |

## 4. Valeurs partagées / quasi identiques — signalées, jamais fusionnées

- `#292524` : `foreground`, `card-foreground`, `popover-foreground`, `primary`, `sidebar/primary`, `sidebar/accent-foreground` (= stone/800).
- `#FFFFFF` : `card`, `popover`, `sidebar/sidebar`, tous les `*-foreground` blancs, `custom/bg-input-30`, `opacity-90..30`.
- `#F8F7F5` : `background`, `accent`, `sidebar/accent`, `custom/bg-input-50` (= cream/50).
- `#E7E5E3` : `border`, `input`, `sidebar/border` (= stone/200).
- `#EEECE6` : `muted`, `secondary` (= cream/100).
La fusion est une décision de réconciliation, pas un relevé.

## 5. Absents (ce que le set shadcn attend et que la table ne couvre pas ici)

- **Mode dark** de chaque token (bloquant 1).
- **`ring`** sémantique global (présent seulement en `sidebar/ring` et `custom/focus`).
- **Familles accent** rendues comme scale complète (la doc n'expose que base/foreground/subtle/text/border).

## 6. Tokens non-couleur (capturés incidemment via `get_variable_defs`)

Le nœud fourni est la page Colors ; la typo n'y est qu'incidente (liée au titre). Relevé partiel :

| Variable | Valeur |
|---|---|
| `typography/font-family/heading` | RL Para Trial Central |
| `typography/font-size/heading-xl` | 30 |
| `typography/line-height/heading-xl` | 36 |
| `typography/letter-spacing/heading-xl` | -1.5 |
| `heading-xl` (composition) | Font(family heading, Regular, 30, weight 400, lh 36, ls -1.5) |
| `slate/900` (primitive) | #0F172A |

> Un relevé **complet de la typescale** doit viser le nœud Typescale dédié (`35720:35541` d'après `tokens.js`), pas la page Colors. À faire en relevé séparé si besoin.

## 7. Annexe — correspondances exactes seulement (le reste = décision)

Les noms source (`kebab`, `sidebar/…`, `custom/…`) mappent 1:1 sur les tokens sémantiques shadcn quand le nom coïncide 
(`background`, `foreground`, `muted`, `card`, `border`, `input`, `primary`, `secondary`, `accent`, `destructive`, familles feedback). 
Tout mapping non trivial (opacity layers, `custom/bg-input-*`, shadows monochromes) est laissé en **TODO** — aucune valeur devinée.

## 8. Décisions en attente (le relevé pose, il ne tranche pas)

1. **Relever le dark** — le MCP ne résout que le mode courant du nœud (impossible de forcer le dark). **Décision steward 22/09** : dark **dérivé** du light (warm stone, contraste AA), pas extrait de Figma. Voir `docs/dark-mode.md`. Un vrai relevé dark reste à faire si les Variables Figma exposent un mode dark.
2. **Vérifier les 8 lignes alias-seul** — résoudre `red/800`, `red/900`, `purple/600`, `purple/900` en hex depuis les Variables (pas depuis la mémoire).
3. **Dérives observées Figma vs `tokens.js`** (à traiter en `ds-figma-sync`, pas ici) — signalées sans être corrigées :
   - `border` / `input` : Figma **#E7E5E3** (stone/200) vs `tokens.js` **#dfdcd9** (« stone/200 assombri d'un demi-cran » — dérive *assumée*, cf. `tokens.js`).
   - `border-strong` : Figma **#D6D3D1** vs `tokens.js` **#cbc7c4**.
   - `brand` : Figma **#FF6D04** vs `tokens.js` **#f47a2c** (« Vif atténué »).
   - `success` : Figma **#059669** = `tokens.js` ✓ ; `warning` **#BD6C1A** = ✓ ; `info` **#5593EA** = ✓.
   - `heading-xl` letter-spacing : Figma **-1.5** vs `tokens.js` **-0.6**.
   Chaque dérive est une **question pour la steward** : Figma a-t-il bougé, ou le code a-t-il volontairement divergé ? Vérité mixte par surface — voir `docs/design-truth.md`.

   **VERDICT v2 (réconcilié contre les vraies Variables, 22/09)** :
   - `brand` : **PAS une dérive.** Vraie Variable #F47A2C = code #f47a2c. Le #FF6D04 du v1 venait de la doc périmée. ✓
   - `border` / `border-strong` / `input` : **seules vraies dérives**, délibérées (`// assombri d'un demi-cran (contraste nav)`). Reverter à stone/200-300 éclaircirait les bordures nav.
   - `heading-xl` : dérive **structurelle** (typo, hors couleurs) : `tokens.js` = sans 24px, Figma = serif 30px → « -1.5 vs -0.6 » compare deux définitions différentes.
   - **Bilan : 72 tokens couleur identiques, 3 dérives (toutes délibérées).** Le code est quasi parfaitement synchro avec les vraies Variables.
   Décision : **`tokens.js` non modifié**. Un re-sync des 3 bordures = décision steward (annulerait le contraste nav voulu).

