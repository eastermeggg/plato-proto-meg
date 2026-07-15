import React from 'react';
import { colors } from '../../design-system/tokens';

export default function RadioGroup({ value, options = [], onChange, name = 'radio' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map(opt => {
        const checked = value === opt.value;
        return (
          <label key={opt.value} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <span
              role="radio"
              aria-checked={checked}
              onClick={() => onChange?.(opt.value)}
              style={{
                width: 16, height: 16, borderRadius: 8,
                border: `1px solid ${checked ? colors.semantic.foreground : colors.semantic.border}`,
                background: colors.semantic.white,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {checked && <span style={{ width: 8, height: 8, borderRadius: 4, background: colors.semantic.foreground }} />}
            </span>
            <span style={{ fontSize: 14, color: colors.semantic.foreground }}>{opt.label}</span>
            <input type="radio" name={name} value={opt.value} checked={checked} onChange={() => onChange?.(opt.value)} style={{ display: 'none' }} />
          </label>
        );
      })}
    </div>
  );
}
