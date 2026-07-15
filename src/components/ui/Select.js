import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { colors } from '../../design-system/tokens';

export default function Select({ value, options = [], onChange, placeholder = 'Select…', disabled }) {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.value === value);
  return (
    <div style={{ position: 'relative', maxWidth: 240 }}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          width: '100%',
          padding: '7px 12px',
          fontSize: 14, color: colors.semantic.foreground,
          background: disabled ? colors.semantic.backgroundSubtle : colors.semantic.white,
          border: `1px solid ${colors.semantic.border}`,
          borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <span style={{ color: current ? colors.semantic.foreground : colors.semantic.foregroundMuted }}>
          {current ? current.label : placeholder}
        </span>
        <span style={{ color: colors.semantic.foregroundMuted, fontSize: 10 }}>▼</span>
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
            background: colors.semantic.white,
            border: `1px solid ${colors.semantic.border}`,
            borderRadius: 8,
            boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 8px 10px rgba(0,0,0,0.05)',
            padding: 4, zIndex: 5,
          }}
        >
          {options.map(o => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                onClick={() => { onChange?.(o.value); setOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '6px 10px', borderRadius: 6, fontSize: 14,
                  color: colors.semantic.foreground,
                  background: active ? colors.semantic.cream : 'transparent',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                {o.label}
                {active && <Check style={{ width: 14, height: 14, color: colors.semantic.foreground }} strokeWidth={2} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
