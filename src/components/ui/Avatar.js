import React from 'react';
import { colors, typography } from '../../design-system/tokens';

/**
 * Avatar — Plato design system. Source of truth: Figma « Avatar »
 * (Plato---System 2814:11240). Promu depuis l'esquisse ui-kit/previews.jsx,
 * palettes tokenisées sur `colors.avatar` (le set partagé avec IVAvatar).
 *
 * Avatar GÉNÉRIQUE : initiales ou image, rond ou carré, 7 palettes
 * (green/blue/plum/orange/rose/cream/purple). Décision steward 24/09 :
 * les identités MÉTIER (victimes indirectes, chiffrage, client/défense/
 * adverse) restent `IVAvatar` (pièce d'échecs, domaine) — ici l'avatar
 * de personne « neutre » (membres du workspace, contacts).
 */

const SIZES = { sm: 24, md: 32, lg: 40, xl: 56 };

export default function Avatar({
  size = 'md',
  initials,
  name,
  image,
  color = 'cream',
  shape = 'circle',
  className,
  style,
  title,
}) {
  const s = typeof size === 'number' ? size : SIZES[size] || SIZES.md;
  const pal = colors.avatar.find((p) => p.name === color) || colors.avatar.find((p) => p.name === 'cream');
  const text = initials || (name ? name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() : '');
  return (
    <span
      className={className}
      title={title || name}
      style={{
        width: s,
        height: s,
        borderRadius: shape === 'circle' ? s / 2 : 6,
        background: pal.bg,
        color: pal.fill,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: typography.fontFamily.sans,
        fontSize: Math.max(10, Math.round(s * 0.36)),
        fontWeight: 600,
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        userSelect: 'none',
        ...style,
      }}
    >
      {!image && text}
    </span>
  );
}

// Palette cyclique par index (membres de listes) — même règle que les
// helpers historiques d'App.js.
export function avatarColorAt(index) {
  const i = ((index % colors.avatar.length) + colors.avatar.length) % colors.avatar.length;
  return colors.avatar[i].name;
}
