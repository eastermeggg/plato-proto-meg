import React from 'react';
import { colors } from '../../design-system/tokens';

export default function Tabs({ value, options = [], onChange, variant = 'underline' }) {
  if (variant === 'pills') {
    return (
      <div style={{ display: 'inline-flex', padding: 3, background: colors.semantic.cream, borderRadius: 8, gap: 2 }}>
        {options.map(o => {
          const active = o.value === value;
          return (
            <button
              key={o.value}
              onClick={() => onChange?.(o.value)}
              style={{
                padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500,
                color: active ? colors.semantic.foreground : colors.semantic.foregroundSecondary,
                background: active ? colors.semantic.white : 'transparent',
                border: 'none', cursor: 'pointer',
                boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${colors.semantic.border}` }}>
      {options.map(o => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange?.(o.value)}
            style={{
              padding: '8px 14px', fontSize: 13, fontWeight: active ? 600 : 500,
              color: active ? colors.semantic.foreground : colors.semantic.foregroundSecondary,
              background: 'transparent', border: 'none',
              borderBottom: active ? `2px solid ${colors.semantic.foreground}` : '2px solid transparent',
              marginBottom: -1, cursor: 'pointer',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
