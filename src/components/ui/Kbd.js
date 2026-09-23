import React from 'react';
import { colors, radius, typography } from '../../design-system/tokens';

/**
 * Kbd — Plato design system. Source of truth: Figma node 29794:42330
 * (page « Kbd » : set « Kbd » 29794:42968 + set « Kbd Group » 29794:42982).
 *
 * Raccourci clavier inline : une touche = un chip 20px, radius 6, texte
 * Inter Medium 12 centré. Deux variants Figma :
 *  - default :  bg muted, texte muted-foreground (surfaces claires)
 *  - reversed : bg blanc 20 %, texte background (surfaces sombres —
 *               tooltip, bouton primaire)
 *
 * KbdGroup (export nommé) = la composition Figma « Kbd Group » :
 *  - type Default   : touches juxtaposées, gap 2
 *  - type Separated : touches reliées par un « + » (Inter Regular 12,
 *                     foreground)
 *
 * All colors / spacing / radius / typography come from src/design-system/tokens.js.
 */

const VARIANTS = {
  default: {
    bg: colors.semantic.muted,
    fg: colors.semantic.mutedForeground,
  },
  // Figma : fond blanc à 20 % (token opacity-80 du set), texte = background.
  // Pas de token opacité dédié → color-mix sur le token white (theme-aware).
  reversed: {
    bg: `color-mix(in srgb, ${colors.semantic.white} 20%, transparent)`,
    fg: colors.semantic.background,
  },
};

const ICON_SIZE = 12; // icônes lucide 12px (arrow-left / arrow-right du set)

export default function Kbd({
  variant = 'default',
  label = '⌘',
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  // Escape hatches (mêmes props que Badge)
  className,
  style,
  title,
}) {
  const v = VARIANTS[variant] || VARIANTS.default;
  return (
    <kbd
      title={title}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        height: 20,
        minWidth: 20,
        padding: 4,
        borderRadius: radius.md,
        backgroundColor: v.bg,
        color: v.fg,
        fontFamily: typography.fontFamily.sans,
        fontSize: typography.scale['caption-medium'].size, // 12
        fontWeight: typography.scale['caption-medium'].weight, // 500
        lineHeight: 1, // Figma leading-none
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        ...style,
      }}
    >
      {LeftIcon && <LeftIcon style={{ width: ICON_SIZE, height: ICON_SIZE, flexShrink: 0 }} strokeWidth={1.75} />}
      {label}
      {RightIcon && <RightIcon style={{ width: ICON_SIZE, height: ICON_SIZE, flexShrink: 0 }} strokeWidth={1.75} />}
    </kbd>
  );
}

/**
 * KbdGroup — set Figma « Kbd Group » (29794:42982).
 * `keys` : tableau de labels (ou nodes). `separated` insère un « + » entre
 * chaque touche (Type=Separated), sinon juxtaposition gap 2 (Type=Default).
 */
export function KbdGroup({
  keys = ['⌘', '⇧', '⌥', '⌃'],
  separated = false,
  variant = 'default',
  className,
  style,
  title,
}) {
  const plusStyle = {
    fontFamily: typography.fontFamily.sans,
    fontSize: typography.scale.caption.size, // 12
    fontWeight: typography.scale.caption.weight, // 400
    lineHeight: 1,
    color: colors.semantic.foreground,
    textAlign: 'center',
    whiteSpace: 'nowrap',
  };
  return (
    <span
      title={title}
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 2, ...style }}
    >
      {keys.map((key, i) => (
        <React.Fragment key={i}>
          {separated && i > 0 && <span style={plusStyle}>+</span>}
          <Kbd variant={variant} label={key} />
        </React.Fragment>
      ))}
    </span>
  );
}
