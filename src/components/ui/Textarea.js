import React from 'react';
import { colors } from '../../design-system/tokens';

export default function Textarea({ value = '', placeholder, disabled, rows = 4, onChange, label, helperText, error }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: 480 }}>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 500, color: colors.semantic.foregroundTertiary }}>
          {label}
        </label>
      )}
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        onChange={onChange}
        style={{
          width: '100%', resize: 'vertical',
          padding: '8px 12px',
          fontSize: 14, lineHeight: '20px',
          color: colors.semantic.foreground,
          background: disabled ? colors.semantic.backgroundSubtle : colors.semantic.white,
          border: `1px solid ${error ? colors.badge.destructive.bg : colors.semantic.border}`,
          borderRadius: 8,
          outline: 'none',
          fontFamily: 'inherit',
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
