import React from 'react';
import { colors } from '../../design-system/tokens';

export default function Sidebar({ items = [], active, onChange, header }) {
  return (
    <div style={{ width: 220, padding: '16px 12px', background: colors.semantic.white, border: `1px solid ${colors.semantic.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {header && (
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 500, color: colors.semantic.foregroundMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, paddingLeft: 8 }}>
          {header}
        </div>
      )}
      {items.map(it => {
        const isActive = active === it.id;
        const Icon = it.icon;
        return (
          <button
            key={it.id}
            onClick={() => onChange?.(it.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 6,
              fontSize: 14, fontWeight: isActive ? 500 : 400,
              color: isActive ? colors.semantic.foreground : colors.semantic.foregroundSecondary,
              background: isActive ? colors.semantic.backgroundSubtle : 'transparent',
              border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%',
            }}
          >
            {Icon && <Icon style={{ width: 14, height: 14 }} strokeWidth={1.75} />}
            <span>{it.label}</span>
            {it.badge && (
              <span style={{ marginLeft: 'auto', fontSize: 11, color: colors.semantic.foregroundMuted, background: colors.semantic.cream, padding: '1px 6px', borderRadius: 10 }}>
                {it.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
