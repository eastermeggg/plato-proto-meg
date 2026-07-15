import React from 'react';
import { Check } from 'lucide-react';
import { colors } from '../../design-system/tokens';

export default function Checkbox({ checked = false, label, disabled, onChange }) {
  return (
    <label
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none',
      }}
    >
      <button
        type="button"
        onClick={() => !disabled && onChange?.(!checked)}
        style={{
          width: 16, height: 16, padding: 0,
          borderRadius: 4,
          border: `1px solid ${checked ? colors.semantic.foreground : colors.semantic.border}`,
          background: checked ? colors.semantic.foreground : colors.semantic.white,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'inherit',
        }}
        aria-checked={checked}
        role="checkbox"
      >
        {checked && <Check style={{ width: 11, height: 11, color: colors.semantic.white }} strokeWidth={3} />}
      </button>
      {label && <span style={{ fontSize: 14, color: colors.semantic.foreground }}>{label}</span>}
    </label>
  );
}
