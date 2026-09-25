import React from 'react';
import { colors, radius, typography } from '../../design-system/tokens';

/**
 * Badge — Plato design system. Source of truth: Figma node 136:1178.
 *
 * Three modes:
 *  - Label (default): rectangular pill with text + optional left/right icon.
 *  - Number:          pill (radius full) with a count, height 20/24px.
 *  - Icon-only:       pill (radius full) with a single icon, height 20/24px.
 *
 * 11 variants — 8 mapped 1:1 to the Figma design system:
 *   Default · Secondary · Outline · Destructive · AI · Success · Info · Warning
 * + `accent` (code-first, validé steward 24/09/2026) : famille brand chaude
 *   pour les tags décoratifs (postes, « JP de référence », « Fiche cabinet »).
 + `success-solid` / `warning-solid` (relevé 37663:55696) : tampons de statut
 *   pleins - fond feedback base, texte foreground (LoiHoverCard).
 *
 * All colors / spacing / radius / typography come from src/design-system/tokens.js.
 */

// Colors per variant. Number/icon-only modes override the foreground when the
// outline variant is used (the Figma uses muted-foreground there).
const VARIANTS = {
  default:     { bg: colors.badge.default.bg,     fg: colors.badge.default.fg,     border: null,                          numberFg: colors.badge.default.fg },
  secondary:   { bg: colors.badge.secondary.bg,   fg: colors.badge.secondary.fg,   border: null,                          numberFg: colors.badge.secondary.fg },
  outline:     { bg: 'transparent',               fg: colors.badge.outline.fg,     border: colors.badge.outline.border,   numberFg: colors.semantic.foregroundSecondary },
  destructive: { bg: colors.badge.destructive.bg, fg: colors.badge.destructive.fg, border: null,                          numberFg: colors.badge.destructive.fg },
  ai:          { bg: colors.badge.ai.bg,          fg: colors.badge.ai.fg,          border: null,                          numberFg: colors.badge.ai.fg },
  success:     { bg: colors.badge.success.bg,     fg: colors.badge.success.fg,     border: null,                          numberFg: colors.badge.success.fg },
  info:        { bg: colors.badge.info.bg,        fg: colors.badge.info.fg,        border: null,                          numberFg: colors.badge.info.fg },
  warning:     { bg: colors.badge.warning.bg,     fg: colors.badge.warning.fg,     border: null,                          numberFg: colors.badge.warning.fg },
  // accent — famille brand chaude (tags de postes, « JP de référence », « Fiche
  // cabinet »). fg = brand.darker.subtleForeground et non accents.ochre :
  // contraste AA à taille caption (6.38:1 light / 8.66:1 dark), validé steward
  // 24/09/2026 (SIGNALEMENTS §16, accent-chip-check).
  accent:      { bg: colors.brand.subtle,          fg: colors.brand.darker.subtleForeground, border: null,                numberFg: colors.brand.darker.subtleForeground },
  // success-solid / warning-solid — tampons de statut pleins (relevé Figma
  // 37663:55696, LoiHoverCard). Même géométrie, fond feedback base + texte
  // foreground ; le pendant subtle reste `success` / `warning`.
  'success-solid': { bg: colors.feedback.success.base, fg: colors.feedback.success.foreground, border: null,             numberFg: colors.feedback.success.foreground },
  'warning-solid': { bg: colors.feedback.warning.base, fg: colors.feedback.warning.foreground, border: null,             numberFg: colors.feedback.warning.foreground },
};

// Per-mode dimensions, exactly matching the Figma frame heights.
const SIZES = {
  sm: {
    label:    { padX: 8, padY: 2, gap: 4 },
    number:   { height: 20, padX: 4, padY: 2 },
    iconOnly: { height: 20, padX: 4, padY: 2 },
  },
  md: {
    label:    { padX: 8, padY: 4, gap: 4 },
    number:   { height: 24, padX: 4, padY: 2 },
    iconOnly: { height: 24, padX: 4, padY: 2 },
  },
};

const ICON_SIZE = 12;
const TEXT_STYLE = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale['caption-medium'].size,           // 12
  lineHeight: `${typography.scale['caption-medium'].lineHeight}px`, // 16
  fontWeight: typography.scale['caption-medium'].weight,       // 500
};

export default function Badge({
  variant = 'default',
  size = 'sm',
  // Label mode
  label,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  // Number mode (pill shape, displays the count). When provided AND not iconOnly, switches to number mode.
  count,
  // Icon-only mode (pill shape with a single icon). When true with `icon`, switches to icon-only mode.
  iconOnly = false,
  icon: Icon,
  // Escape hatches
  className,
  style,
  title,
}) {
  const v = VARIANTS[variant] || VARIANTS.default;
  const sizes = SIZES[size] || SIZES.sm;

  const isCount = count !== undefined && count !== null && !iconOnly;
  const isIconOnly = iconOnly && !!Icon && !isCount;
  const mode = isCount ? 'number' : isIconOnly ? 'iconOnly' : 'label';
  const m = sizes[mode];

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: v.bg,
    color: mode === 'label' ? v.fg : v.numberFg,
    border: v.border ? `1px solid ${v.border}` : 'none',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    ...TEXT_STYLE,
  };

  if (mode === 'label') {
    return (
      <span
        title={title}
        className={className}
        style={{
          ...baseStyle,
          gap: m.gap,
          padding: `${m.padY}px ${m.padX}px`,
          borderRadius: radius.md,
          ...style,
        }}
      >
        {LeftIcon && <LeftIcon style={{ width: ICON_SIZE, height: ICON_SIZE, flexShrink: 0 }} strokeWidth={1.75} />}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        {RightIcon && <RightIcon style={{ width: ICON_SIZE, height: ICON_SIZE, flexShrink: 0 }} strokeWidth={1.75} />}
      </span>
    );
  }

  // Number / icon-only — both are pills, same dimensions.
  return (
    <span
      title={title}
      className={className}
      style={{
        ...baseStyle,
        height: m.height,
        minWidth: m.height,
        padding: `${m.padY}px ${m.padX}px`,
        borderRadius: radius.full,
        ...style,
      }}
    >
      {mode === 'number' ? formatCount(count) : <Icon style={{ width: ICON_SIZE, height: ICON_SIZE, flexShrink: 0 }} strokeWidth={1.75} />}
    </span>
  );
}

function formatCount(count) {
  if (typeof count !== 'number') return count;
  if (count > 99) return '99+';
  return String(count);
}
