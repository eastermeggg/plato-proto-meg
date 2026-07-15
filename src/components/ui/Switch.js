import React from 'react';
import { colors } from '../../design-system/tokens';

export default function Switch({ checked = false, label, disabled, onChange }) {
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1 }}>
      <button
        type="button"
        onClick={() => !disabled && onChange?.(!checked)}
        style={{
          position: 'relative', width: 36, height: 20, padding: 0,
          borderRadius: 10, border: 'none',
          background: checked ? colors.semantic.foreground : colors.semantic.cream,
          transition: 'background 150ms ease',
          cursor: 'inherit',
          flexShrink: 0,
        }}
        role="switch"
        aria-checked={checked}
      >
        <span style={{
          position: 'absolute', top: 2, left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: 8,
          background: colors.semantic.white,
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transition: 'left 150ms ease',
        }} />
      </button>
      {label && <span style={{ fontSize: 14, color: colors.semantic.foreground }}>{label}</span>}
    </label>
  );
}
