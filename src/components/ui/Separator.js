import React from 'react';
import { colors } from '../../design-system/tokens';

export default function Separator({ orientation = 'horizontal', label }) {
  if (orientation === 'vertical') {
    return (
      <span style={{ display: 'inline-block', width: 1, height: 16, background: colors.semantic.border, verticalAlign: 'middle' }} />
    );
  }
  if (label) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
        <span style={{ flex: 1, height: 1, background: colors.semantic.border }} />
        <span style={{ fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.05em', color: colors.semantic.foregroundMuted, fontWeight: 500 }}>
          {label}
        </span>
        <span style={{ flex: 1, height: 1, background: colors.semantic.border }} />
      </div>
    );
  }
  return <hr style={{ width: '100%', height: 1, background: colors.semantic.border, border: 'none', margin: 0 }} />;
}
