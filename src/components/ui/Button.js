import React, { useState } from 'react';
import { colors } from '../../design-system/tokens';

const VARIANTS = {
  primary:     { bg: colors.semantic.foreground,      bgHover: colors.semantic.foregroundTertiary, fg: colors.semantic.white,      border: 'transparent' },
  secondary:   { bg: colors.semantic.cream,           bgHover: colors.semantic.border,             fg: colors.semantic.foregroundTertiary, border: 'transparent' },
  ghost:       { bg: 'transparent',                   bgHover: colors.semantic.background,         fg: colors.semantic.foregroundTertiary, border: 'transparent' },
  outline:     { bg: colors.semantic.white,           bgHover: colors.semantic.background,         fg: colors.semantic.foreground, border: colors.semantic.border },
  destructive: { bg: colors.icon.destructive,         bgHover: '#641515',                          fg: colors.semantic.white,      border: 'transparent' },
};

const SIZES = {
  sm: { padX: 10, padY: 5,  font: 12, line: 16, radius: 6,  iconSize: 14 },
  md: { padX: 14, padY: 7,  font: 14, line: 20, radius: 8,  iconSize: 16 },
  lg: { padX: 18, padY: 10, font: 14, line: 20, radius: 8,  iconSize: 18 },
};

export default function Button({ variant = 'primary', size = 'md', icon: Icon, iconPosition = 'leading', label, disabled, onClick, fullWidth }) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
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
      {Icon && iconPosition === 'leading'  && <Icon style={{ width: s.iconSize, height: s.iconSize }} strokeWidth={1.75} />}
      {label}
      {Icon && iconPosition === 'trailing' && <Icon style={{ width: s.iconSize, height: s.iconSize }} strokeWidth={1.75} />}
    </button>
  );
}
