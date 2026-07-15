import React from 'react';
import { colors } from '../../design-system/tokens';

export default function ScrollArea({ children, height = 200, width = '100%' }) {
  return (
    <div
      style={{
        height, width,
        overflow: 'auto',
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: 8,
        padding: 12,
        background: colors.semantic.white,
      }}
    >
      {children}
    </div>
  );
}
