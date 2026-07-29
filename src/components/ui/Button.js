import React, { useState } from 'react';

// Plato Button — promoted faithfully from the validated preview in
// src/components/ui-kit/previews.jsx (same variants, sizes, and prop names so
// existing call sites stay compatible). See Button.md.
//
// Variants: primary · secondary · ghost · outline · destructive
// Sizes:    sm · md · lg
const VARIANTS = {
  primary:     { bg: '#292524', bgHover: '#44403c', fg: '#ffffff', border: 'transparent' },
  secondary:   { bg: '#eeece6', bgHover: '#e7e5e3', fg: '#44403c', border: 'transparent' },
  ghost:       { bg: 'transparent', bgHover: '#fafaf9', fg: '#44403c', border: 'transparent' },
  outline:     { bg: '#ffffff', bgHover: '#fafaf9', fg: '#292524', border: '#e7e5e3' },
  destructive: { bg: '#7f1d1d', bgHover: '#641515', fg: '#ffffff', border: 'transparent' },
};
const SIZES = {
  sm: { padX: 10, padY: 5,  font: 12,   line: 16, radius: 6, iconSize: 14 },
  md: { padX: 14, padY: 7,  font: 14,   line: 20, radius: 8, iconSize: 16 },
  lg: { padX: 18, padY: 10, font: 14,   line: 20, radius: 8, iconSize: 18 },
};

export default function Button({
  variant = 'primary', size = 'md', icon: Icon, iconPosition = 'leading',
  label, children, disabled, onClick, fullWidth, type = 'button', title,
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: `${s.padY}px ${s.padX}px`,
        fontSize: s.font, lineHeight: `${s.line}px`, fontWeight: 500,
        color: v.fg,
        background: hovered && !disabled ? v.bgHover : v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: s.radius,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'background 150ms ease',
        whiteSpace: 'nowrap',
      }}
    >
      {Icon && iconPosition === 'leading' && <Icon style={{ width: s.iconSize, height: s.iconSize }} strokeWidth={1.75} />}
      {label || children}
      {Icon && iconPosition === 'trailing' && <Icon style={{ width: s.iconSize, height: s.iconSize }} strokeWidth={1.75} />}
    </button>
  );
}
