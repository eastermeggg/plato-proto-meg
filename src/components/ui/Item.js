import React, { useState } from 'react';
import { colors, radius, typography } from '../../design-system/tokens';

/**
 * Item — Plato design system. Source of truth: Figma node 32847:5869
 * (page « Item » : set 33462:3156, Type × Size × State, + slots
 * .Item Media 33455:88003 / .Item Header 33462:3412 / .Item Actions
 * 33462:2230 / .Item Footer 34400:29401).
 *
 * Rangée générique de liste / menu / carte légère : media à gauche,
 * titre + description au centre, actions à droite, header (visuel) et
 * footer optionnels.
 *
 * Variants Figma (Type) : default (fond transparent) · outline (bord 1px).
 * Sizes (Size) : md (Default — pad 16, gap 16, radius 12) · sm (Small —
 * pad 8, gap 10, contenu gap 2).
 * States : enabled · hover (bg accent) — le hover ne s'active que si l'Item
 * est interactif (`onClick`) ou épinglé (`pinHover`).
 *
 * Le slot `icon` rend la boîte média cadrée du Figma (bg muted, bord, pad 8,
 * radius 8, icône 16). `media` accepte n'importe quel node (avatar, image).
 */

const SIZES = {
  md: { pad: 16, gap: 16, contentGap: 4 }, // Figma Size=Default
  sm: { pad: 8, gap: 10, contentGap: 2 },  // Figma Size=Small
};

const TITLE_STYLE = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale['body-medium'].size, // 14
  lineHeight: `${typography.scale['body-medium'].lineHeight}px`, // 20
  fontWeight: typography.scale['body-medium'].weight, // 500
  color: colors.semantic.foreground,
};

const DESCRIPTION_STYLE = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.body.size, // 14
  lineHeight: `${typography.scale.body.lineHeight}px`, // 20
  fontWeight: typography.scale.body.weight, // 400
  color: colors.semantic.mutedForeground,
};

const ICON_BOX_STYLE = {
  display: 'flex',
  alignItems: 'flex-start',
  padding: 8,
  borderRadius: radius.lg, // Figma 8
  backgroundColor: colors.semantic.muted,
  border: `1px solid ${colors.semantic.border}`,
  flexShrink: 0,
};

export default function Item({
  variant = 'default', // Figma Type=Default | Outline→'outline'
  size = 'md',
  // Slots
  icon: Icon,   // icône lucide, rendue dans la boîte média cadrée (Type=Icon)
  media,        // node libre à la place de la boîte (avatar, image, spinner…)
  title = 'Title',
  description = 'Description',
  actions,      // node(s) à droite (Button size sm en général)
  header,       // node visuel pleine largeur au-dessus (h128, radius 6)
  footer,       // node pleine largeur en dessous
  // Interaction
  onClick,
  pinHover = false,
  // Escape hatches (mêmes props que Badge)
  className,
  style,
}) {
  const s = SIZES[size] || SIZES.md;
  const [hovered, setHovered] = useState(false);
  const interactive = typeof onClick === 'function';
  const showHover = pinHover || (interactive && hovered);

  const row = (
    <div style={{ display: 'flex', gap: s.gap, alignItems: 'flex-start', width: '100%' }}>
      {Icon && !media && (
        <div style={ICON_BOX_STYLE}>
          <Icon style={{ width: 16, height: 16 }} strokeWidth={1.75} />
        </div>
      )}
      {media && <div style={{ flexShrink: 0, display: 'flex' }}>{media}</div>}
      <div
        style={{
          flex: '1 0 0',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: s.contentGap,
          justifyContent: 'center',
          alignSelf: 'stretch',
        }}
      >
        {title && <div style={TITLE_STYLE}>{title}</div>}
        {description && <div style={DESCRIPTION_STYLE}>{description}</div>}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', alignSelf: 'stretch', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </div>
  );

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: s.gap,
        alignItems: 'flex-start',
        // Bord toujours réservé (transparent en default) : les deux variants
        // rendent la même hauteur totale que le Figma (stroke inside, 76px).
        padding: s.pad - 1,
        borderRadius: radius.xl, // Figma --radius 12
        backgroundColor: showHover ? colors.semantic.accent : 'transparent',
        border: variant === 'outline' ? `1px solid ${colors.semantic.border}` : '1px solid transparent',
        cursor: interactive ? 'pointer' : undefined,
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {header && (
        <div style={{ height: 128, width: '100%', borderRadius: radius.md, overflow: 'hidden', flexShrink: 0 }}>
          {header}
        </div>
      )}
      {row}
      {footer && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', width: '100%' }}>
          {footer}
        </div>
      )}
    </div>
  );
}

/**
 * ItemGroup — set Figma « Item Group » (33462:31422) : une pile d'Items
 * collés, sans espace (les hovers se lisent rangée par rangée).
 */
export function ItemGroup({ children, className, style }) {
  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', width: '100%', ...style }}
    >
      {children}
    </div>
  );
}
