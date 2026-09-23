#!/usr/bin/env node
// gen-token-docs — documente CHAQUE token (usage) et régénère :
//   1. la section `tokens` de src/data/designSystemInventory.json (valeurs light
//      + dark depuis tokens.js, usage par token, méta de validation préservée)
//   2. docs/tokens.md — la doc lisible de tous les tokens (tables par famille)
// Source unique : src/design-system/tokens.js + les cartes d'usage ci-dessous.
// Lancer : `npm run ds:tokens` après toute évolution de tokens.js ou d'un usage.

import { readFileSync, writeFileSync } from 'node:fs';
import { palette as P, paletteDark as D, typography as TY, spacing as SP, radius as RA, shadows as SH, motion as MO } from '../src/design-system/tokens.js';

const INV = 'src/data/designSystemInventory.json';
const MD = 'docs/tokens.md';

// ─────────────────────────────────────────────────────────────────────────
// Cartes d'usage — la documentation vivante de chaque token.
// ─────────────────────────────────────────────────────────────────────────
const SEM_USAGE = {
  background: 'Fond de page par défaut (cream/50)',
  foreground: 'Texte principal (stone/800)',
  muted: 'Fond atténué - blocs secondaires, chips, surfaces discrètes',
  'muted-foreground': 'Texte atténué - libellés et méta secondaires',
  card: 'Surface des cartes',
  'card-foreground': 'Texte sur carte',
  popover: 'Surface des popovers / menus flottants',
  'popover-foreground': 'Texte dans les popovers',
  border: "Bordure par défaut - assombrie d'un demi-cran vs Figma (contraste nav), dérive assumée",
  'border-strong': 'Bordure appuyée - séparateurs de rails, contours actifs',
  'border-hover': 'Bordure au survol',
  input: 'Bordure des champs de formulaire',
  ring: 'Anneau de focus',
  primary: 'Action principale - fond sombre des boutons primaires',
  'primary-foreground': 'Texte sur fond primaire',
  secondary: 'Action secondaire - fond crème',
  'secondary-foreground': 'Texte sur fond secondaire',
  accent: 'Fond hover/focus discret',
  'accent-foreground': 'Texte sur accent',
  white: 'Blanc de surface - devient une surface sombre en dark (ne pas utiliser comme texte)',
  'foreground-secondary': 'Alias hérité de muted-foreground',
  'foreground-muted': 'Texte tertiaire clair (stone/400) - placeholders, méta',
  'foreground-tertiary': "Texte d'appui (stone/700) - libellés, boutons secondaires",
  'foreground-quaternary': 'Texte discret (stone/600)',
  'foreground-strong': 'Texte fort (stone/900) - emphase maximale',
  'border-alt': 'Alias historique de border (#dfdcda)',
  'background-canvas': 'Alias de background',
  'background-hover': 'Alias de background (survols pleine page)',
  'background-subtle': 'Fond léger - blocs de code, rails, zones neutres',
  'border-subtle': 'Filet très léger - séparations internes',
  cream: 'Alias de muted (cream/100)',
};
const FEEDBACK_LABEL = { destructive: 'destructif (erreurs, suppressions)', success: 'succès', warning: 'avertissement', info: 'information', ai: 'IA (généré par le modèle)' };
const FEEDBACK_ROLE = {
  base: (f) => `Couleur pleine ${f} - boutons et accents saturés`,
  foreground: (f) => `Texte sur fond ${f} plein`,
  subtle: (f) => `Fond teinté ${f} - badges, bandeaux, zones`,
  border: (f) => `Bordure ${f} - contours des zones teintées`,
  text: (f) => `Texte ${f} sur fond clair ou subtle (contraste AA)`,
  bg: (f) => `Fond ${f} très léger (états ON, pills)`,
};
const ACCENT_NOTE = 'Famille décorative (identités, catégories) - aucune sémantique d’état';
const ACCENT_SINGLE = {
  ochre: 'Accent chaud - surtitres, marqueurs JP (promu depuis #b9703f ×61, DECISIONS-HEX §6)',
  meadow: 'Vert marketing des connecteurs email (promu depuis #4a9168 ×23, DECISIONS-HEX §6)',
};
const BRAND_USAGE = {
  DEFAULT: 'Orange brand « Vif atténué » - DÉTAIL uniquement (surtitres, glow, liseré actif, icônes), jamais un aplat',
  foreground: 'Texte sur fond brand plein (rare)',
  subtle: 'Fond teinté brand',
  subtleForeground: 'Texte sur brand-subtle',
  border: 'Bordure brand',
  mutedForeground: 'Alias hérité → brand-darker',
  'darker.DEFAULT': 'Brand foncé - liens et texte brand, contraste AA sur blanc',
  'darker.foreground': 'Texte sur brand-darker plein',
  'darker.subtle': 'Fond teinté brand foncé',
  'darker.subtleForeground': 'Texte sur brand-darker-subtle',
  'darker.border': 'Bordure brand foncée',
};
const TYPO_USAGE = {
  'font.sans': 'Toute l’UI - Inter',
  'font.serif': 'Titres display - RL Para Trial Central (licence Trial à valider avant prod)',
  'font.mono': 'Code, labels de colonnes, chips techniques - IBM Plex Mono',
  'display-lg': 'Grand titre serif de page (30px)',
  'display-sm': 'Titre serif intermédiaire (24px)',
  'display-xs': 'Petit titre serif (18px)',
  'heading-xl': 'Titre de section majeur (sans 24)', 'heading-xl-medium': 'Variante medium du heading-xl',
  'heading-lg': 'Titre de section (sans 20)', 'heading-lg-medium': 'Variante medium',
  'heading-md': 'Sous-titre (sans 18)', 'heading-md-medium': 'Variante medium',
  'heading-sm': 'Titre de bloc (sans 16)', 'heading-sm-medium': 'Variante medium',
  body: 'Texte courant (14/20)', 'body-medium': 'Texte courant accentué - libellés, boutons',
  caption: 'Légendes et méta (12/16)', 'caption-medium': 'Légende accentuée',
  detail: 'Texte tertiaire - tooltips, aides (Inter Medium 12/18)',
  counter: 'Compteurs compacts (10)',
  'caption-header-cols': 'En-têtes de colonnes de tables (IBM Plex Mono Medium 11, uppercase)',
};
const RAD_USAGE = {
  sm: '4px - surlignage (is-highlighted)', xs: '5px - zones surlignées', md: '6px - badges, petits contrôles',
  lg: '8px - boutons', xl: '12px - cartes et bannières (Figma --radius)', full: 'Pill / cercle (badges number, avatars)',
};
const SHADOW_USAGE = {
  '2xs': 'Élévation la plus légère - filets d\'appui (chips, rangées)',
  xs: 'Élévation minimale (alignée Figma shadow/xs)',
  sm: 'Élévation basse - cartes au repos, menus discrets',
  xl: 'Élévation haute - popovers, panneaux flottants',
  '3xl': 'Élévation maximale - modales et overlays',
  bannerButton: 'Bouton de bandeau (repos)', bannerButtonHover: 'Bouton de bandeau (survol)',
  glowPulseStart: 'Début du pulse de glow (indigo)', glowPulseEnd: 'Fin du pulse de glow',
};
const DUR_USAGE = {
  instant: 'Micro-feedback (100ms)', fast: 'Hover, petites transitions (150ms)', base: 'Transition standard (250ms)',
  slow: 'Panneaux, entrées de blocs (350ms)', slower: 'Séquences longues (600ms)', pulse: 'Cycle de pulsation (2s)',
  spinSlow: 'Rotation lente (2.5s)', gradient: 'Cycle de dégradé animé (3s)',
};
const ANIM_USAGE = {
  shimmer: 'Chargement - balayage lumineux', bounceIn: 'Apparition avec rebond', fadeSlideUp: 'Entrée fade + montée',
  spinSlow: 'Rotation continue lente', fadeIn: 'Apparition simple', gradientShift: 'Dégradé animé (fonds marketing)',
  pulseScale: 'Pulsation de taille (points de streaming)', glowPulse: 'Pulse du glow brand',
  slideInRight: 'Entrée depuis la droite (panneaux)', highlightFade: 'Surlignage qui s’estompe (scroll-to)',
  diffAccepted: 'Diff accepté (flash vert)', diffRejected: 'Diff rejeté (flash rouge)',
  stepSlideIn: 'Entrée d’une étape de raisonnement', reasoningChildExpand: 'Dépliage des sous-étapes',
};
const STEP_USAGE = { default: 'Étape neutre du ReasoningStepper (icône/fond/texte)', green: 'Étape succès', orange: 'Étape en cours / warning', red: 'Étape erreur' };
const ICON_USAGE = { default: 'Icône AlertDialog neutre', destructive: 'Icône destructive', warning: 'Icône warning', success: 'Icône succès', info: 'Icône info' };

// ─────────────────────────────────────────────────────────────────────────
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const hx = (v) => (typeof v === 'string' && v.startsWith('#') ? v.toLowerCase() : v);

const inv = JSON.parse(readFileSync(INV, 'utf8'));
const metaById = {};
for (const arr of Object.values(inv.tokens || {}))
  for (const t of arr) metaById[t.id] = { figmaRef: t.figmaRef || '', notes: t.notes || '', status: t.status || 'pending' };

const tok = (id, name, value, { dark, category, usage } = {}) => {
  const m = metaById[id] || { figmaRef: '', notes: '', status: 'pending' };
  const o = { id, name, value };
  if (dark && dark !== value) o.valueDark = dark;
  if (category) o.category = category;
  o.usage = usage || '';
  o.figmaRef = m.figmaRef; o.notes = m.notes; o.status = m.status;
  return o;
};

// ── colors ──
const colors = [];
for (const [k, v] of Object.entries(P.semantic)) {
  if (typeof v !== 'string') continue;
  const name = kebab(k);
  colors.push(tok(`color.semantic.${name}`, name, hx(v), { dark: hx(D.semantic[k]), category: 'semantic', usage: SEM_USAGE[name] || '' }));
}
for (const [fam, roles] of Object.entries(P.feedback))
  for (const [role, v] of Object.entries(roles))
    colors.push(tok(`color.feedback.${fam}.${role}`, `${fam}.${role}`, hx(v), { dark: hx(D.feedback?.[fam]?.[role]), category: 'feedback', usage: (FEEDBACK_ROLE[role] || (() => ''))(FEEDBACK_LABEL[fam] || fam) }));
for (const [fam, val] of Object.entries(P.accents)) {
  if (typeof val === 'string') {
    colors.push(tok(`color.accents.${fam}`, fam, hx(val), { dark: typeof D.accents?.[fam] === 'string' ? hx(D.accents[fam]) : undefined, category: 'accents', usage: ACCENT_SINGLE[fam] || ACCENT_NOTE }));
  } else {
    for (const [role, v] of Object.entries(val))
      colors.push(tok(`color.accents.${fam}.${role}`, `${fam}.${role}`, hx(v), { dark: hx(D.accents?.[fam]?.[role]), category: 'accents', usage: `${(FEEDBACK_ROLE[role] || (() => ''))(fam)} — ${ACCENT_NOTE}` }));
  }
}
for (const [k, v] of Object.entries(P.brand)) {
  if (typeof v !== 'string') continue;
  colors.push(tok(`color.brand.${k}`, k === 'DEFAULT' ? 'brand' : `brand-${kebab(k)}`, hx(v), { dark: hx(D.brand?.[k]), category: 'brand', usage: BRAND_USAGE[k] || '' }));
}
for (const [k, v] of Object.entries(P.brand.darker))
  colors.push(tok(`color.brand.darker.${k}`, k === 'DEFAULT' ? 'brand-darker' : `brand-darker-${kebab(k)}`, hx(v), { dark: hx(D.brand?.darker?.[k]), category: 'brand', usage: BRAND_USAGE[`darker.${k}`] || '' }));
for (const [k, v] of Object.entries(P.badge)) {
  const value = k === 'outline' ? `transparent + ${v.border} border` : `${v.bg} / ${v.fg}`;
  colors.push(tok(`color.badge.${kebab(k)}`, `badge.${kebab(k)}`, value, { category: 'badge', usage: `Badge variant « ${k} » (fond / texte)` }));
}
for (const [k, v] of Object.entries(P.banner))
  colors.push(tok(`color.banner.${k}`, `banner.${k}`, `${v.accent} on ${v.bgFrom} · hover ${v.accentHover} · border ${v.border}`, { category: 'banner', usage: `Bandeau « ${k} » : accent / fond de dégradé / hover / bordure` }));
for (const [k, v] of Object.entries(P.step)) {
  if (typeof v !== 'object') continue;
  colors.push(tok(`color.step.${k}`, `step.${k}`, `${v.icon} / ${v.bg} / ${v.text}`, { category: 'step', usage: STEP_USAGE[k] || '' }));
}
for (const [k, v] of Object.entries(P.piece))
  colors.push(tok(`color.piece.${k}`, `piece.${k}`, `${v.bg} / ${v.fg}`, { category: 'piece', usage: `Tag type de pièce « ${k} » (fond / texte)` }));
for (const a of P.avatar)
  colors.push(tok(`color.avatar.${a.name}`, `avatar.${a.name}`, `${a.bg} / ${a.fill}`, { category: 'avatar', usage: `Palette avatar « ${a.name} » (fond / pièce d'échecs)` }));
for (const [k, v] of Object.entries(P.icon))
  colors.push(tok(`color.icon.${k}`, `icon.${k}`, hx(v), { dark: hx(D.icon?.[k]), category: 'icon', usage: ICON_USAGE[k] || '' }));
for (const [k, v] of Object.entries(P.diff))
  colors.push(tok(`color.diff.${k}`, `diff.${k}`, hx(v), { category: 'diff', usage: `Diff métier : ${k === 'add' ? 'ajout' : k === 'edit' ? 'modification' : 'suppression'} (rangées IV, artifacts)` }));
P.chart.forEach((v, i) => colors.push(tok(`color.chart.${i + 1}`, `chart-${i + 1}`, hx(v), { category: 'chart', usage: `Série graphique ${i + 1} (rampe bleue)` })));
const CREAM_USAGE = {
  200: 'Cran cream/200 (palette CREAM IVAvatar, set 36533:7967)',
  400: 'Cream/400 - filet du bloc « Apport » de JPListing (2219:19197)',
  900: 'Cream/900 - cran sombre de la rampe cream (IVAvatar)',
};
for (const [k, v] of Object.entries(P.cream))
  colors.push(tok(`color.cream.${k}`, `cream/${k}`, hx(v), { dark: hx(D.cream?.[k]), category: 'cream', usage: CREAM_USAGE[k] || 'Cran de la rampe cream (promu 23/09/2026)' }));
colors.push(tok('color.doc.pdf', 'doc.pdf', hx(P.doc.pdf), { dark: hx(D.doc?.pdf), category: 'doc', usage: 'Icône fichier PDF rouge des rangées de tables (ActRow, RowDocuments, DocIcon)' }));
const COMPOSER_USAGE = {
  processingBg: 'Bandeau système du composer : fond analyse en cours',
  warningBg: 'Bandeau système du composer : fond limite de quota',
  blockedBg: 'Bandeau système du composer : fond quota atteint',
  askHeader: 'En-tête mono « USER ASK » du composer (cream/500)',
};
for (const [k, v] of Object.entries(P.composer))
  colors.push(tok(`color.composer.${k}`, `composer.${kebab(k)}`, hx(v), { dark: hx(D.composer?.[k]), category: 'composer', usage: COMPOSER_USAGE[k] || '' }));
const DROPZONE_USAGE = {
  extractionBorder: 'DropZone état extraction : bordure bleu pâle (alpha 50% via color-mix)',
  extractionTint: 'DropZone état extraction : teinte de fond (alpha 60% via color-mix)',
};
for (const [k, v] of Object.entries(P.dropzone))
  colors.push(tok(`color.dropzone.${k}`, `dropzone.${kebab(k)}`, hx(v), { dark: hx(D.dropzone?.[k]), category: 'dropzone', usage: DROPZONE_USAGE[k] || '' }));

// ── typography ──
const FAM_VAL = { sans: 'Inter, system fallbacks', serif: 'RL Para Trial Central, Albra, Georgia', mono: 'IBM Plex Mono' };
const typo = ['sans', 'serif', 'mono'].map((k) => tok(`type.font.${k}`, `font.${k}`, FAM_VAL[k], { category: 'fontFamily', usage: TYPO_USAGE[`font.${k}`] }));
const scaleCat = (n) => (n.startsWith('display') ? 'display' : n.startsWith('heading') ? 'heading' : n.startsWith('body') ? 'body' : 'detail');
for (const [name, s] of Object.entries(TY.scale))
  typo.push(tok(`type.scale.${name}`, name, `${s.size}px / ${s.lineHeight} / ${s.letterSpacing} / ${s.weight}`, { category: scaleCat(name), usage: TYPO_USAGE[name] || '' }));

// ── spacing / radius / shadows / motion ──
const OFF_SCALE = new Set(['1.25', '1.75']);
const spacing = Object.entries(SP).map(([k, v]) => tok(`space.${k}`, k, v, { usage: `Pas d'espacement ${v}${OFF_SCALE.has(k) ? ' — hors échelle (dette relevée)' : ''}` }));
const radius = Object.entries(RA).map(([k, v]) => ({ ...tok(`radius.${k}`, k, v, { usage: RAD_USAGE[k] || '' }), usage: RAD_USAGE[k] || '' }));
const shadows = Object.entries(SH).map(([k, v]) => tok(`shadow.${k}`, k, v, { usage: SHADOW_USAGE[k] || '' }));
const motion = [
  ...Object.entries(MO.duration).map(([k, v]) => tok(`motion.duration.${k}`, `duration.${k}`, v, { usage: DUR_USAGE[k] || '' })),
  ...Object.entries(MO.animation).map(([k, v]) => tok(`motion.animation.${k}`, `animation.${k}`, `${v.duration} ${v.easing}`, { usage: ANIM_USAGE[k] || '' })),
];

inv.tokens = { colors, typography: typo, spacing, radius, shadows, motion };
writeFileSync(INV, JSON.stringify(inv, null, 2) + '\n');

// ── docs/tokens.md ──
const L = [];
L.push('# Tokens — documentation d’usage\n');
L.push('> GÉNÉRÉ par `npm run ds:tokens` (scripts/gen-token-docs.mjs) depuis `src/design-system/tokens.js`');
L.push('> + les cartes d’usage du script. **Modifier l’usage d’un token = éditer la carte dans le script**,');
L.push('> puis régénérer. Ne pas éditer ce fichier à la main. Affiché dans le playground : `/ui-kit/tokens`.\n');
L.push(`Light par défaut ; la colonne Dark n'apparaît que si la valeur change (architecture var(), voir docs/dark-mode.md).\n`);
const table = (rows, cols) => {
  L.push(`| ${cols.join(' | ')} |`);
  L.push(`|${cols.map(() => '---').join('|')}|`);
  rows.forEach((r) => L.push(`| ${r.join(' | ')} |`));
  L.push('');
};
L.push('## Couleurs\n');
const byCat = {};
for (const t of colors) (byCat[t.category] ||= []).push(t);
for (const [cat, arr] of Object.entries(byCat)) {
  L.push(`### ${cat}\n`);
  table(arr.map((t) => [`\`${t.name}\``, `\`${t.value}\``, t.valueDark ? `\`${t.valueDark}\`` : '—', t.usage || '—']), ['Token', 'Light', 'Dark', 'Usage']);
}
L.push('## Typographie\n');
table(typo.map((t) => [`\`${t.name}\``, `\`${t.value}\``, t.usage || '—']), ['Token', 'Définition (px / lh / ls / poids)', 'Usage']);
L.push('## Espacements\n');
table(spacing.map((t) => [`\`${t.name}\``, `\`${t.value}\``, t.usage || '—']), ['Token', 'Valeur', 'Usage']);
L.push('## Radius\n');
table(radius.map((t) => [`\`${t.name}\``, `\`${t.value}\``, t.usage || '—']), ['Token', 'Valeur', 'Usage']);
L.push('## Ombres\n');
table(shadows.map((t) => [`\`${t.name}\``, `\`${t.value}\``, t.usage || '—']), ['Token', 'Valeur', 'Usage']);
L.push('## Motion\n');
table(motion.map((t) => [`\`${t.name}\``, `\`${t.value}\``, t.usage || '—']), ['Token', 'Valeur', 'Usage']);
writeFileSync(MD, L.join('\n') + '\n');

console.log(`ds:tokens — catalogue régénéré (${colors.length} couleurs, ${typo.length} typo, ${spacing.length} spacing, ${radius.length} radius, ${shadows.length} ombres, ${motion.length} motion) + ${MD}`);
const missing = [...colors, ...typo, ...spacing, ...radius, ...shadows, ...motion].filter((t) => !t.usage);
if (missing.length) console.log(`  ⚠ ${missing.length} token(s) sans usage : ${missing.map((t) => t.name).slice(0, 10).join(', ')}`);
