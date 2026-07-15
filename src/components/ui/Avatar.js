import React from 'react';
import { colors } from '../../design-system/tokens';

// Build lookup from tokens.js avatar array: { green, blue, plum, orange, rose, cream }
const PALETTE = Object.fromEntries(colors.avatar.map(a => [a.name, { bg: a.bg, fg: a.fill }]));

const SIZES = { sm: 24, md: 32, lg: 40, xl: 56 };

export default function Avatar({ size = 'md', initials, image, color = 'cream', shape = 'circle' }) {
  const s = SIZES[size] || 32;
  const c = PALETTE[color] || PALETTE.cream;
  return (
    <span
      style={{
        width: s, height: s,
        borderRadius: shape === 'circle' ? s / 2 : 6,
        background: c.bg, color: c.fg,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.max(10, s * 0.36), fontWeight: 600,
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
        flexShrink: 0,
      }}
    >
      {!image && initials}
    </span>
  );
}
