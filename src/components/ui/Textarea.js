import React from 'react';
import { colors, radius, typography } from '../../design-system/tokens';

/**
 * Textarea — Plato design system. Source of truth: Figma « Textarea »
 * (Plato---System 2819:31164). Promu depuis l'esquisse ui-kit/previews.jsx.
 *
 * Zone de texte multi-lignes, redimensionnable en hauteur. Label + helper
 * optionnels, état error. Miroir de Input (même palette : fond `card`,
 * bordure `border`, error `badge.destructive.bg`, helper `foregroundSecondary`).
 *
 * Toutes les valeurs viennent de tokens.js. Remplace les `<textarea>` bruts.
 */

export default function Textarea({
  value = '',
  placeholder,
  disabled = false,
  rows = 4,
  onChange,
  label,
  helperText,
  error = false,
  className,
  style,
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: 480 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: colors.semantic.foregroundTertiary }}>{label}</label>
      )}
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        className={className}
        style={{
          width: '100%',
          resize: 'vertical',
          padding: '8px 12px',
          fontFamily: typography.fontFamily.sans,
          fontSize: 14,
          lineHeight: '20px',
          color: colors.semantic.foreground,
          background: disabled ? colors.semantic.backgroundSubtle : colors.semantic.card,
          border: `1px solid ${error ? colors.badge.destructive.bg : colors.semantic.border}`,
          borderRadius: radius.lg,
          outline: 'none',
          ...style,
        }}
      />
      {helperText && (
        <span style={{ fontSize: 11, color: error ? colors.badge.destructive.bg : colors.semantic.foregroundSecondary }}>
          {helperText}
        </span>
      )}
    </div>
  );
}
