import React from 'react';
import { colors } from '../../design-system/tokens';

export default function Skeleton({ width = '100%', height = 14, radius = 4, count = 1 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: width === '100%' ? '100%' : 'auto' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-shimmer"
          style={{ width, height, borderRadius: radius, background: colors.semantic.cream }}
        />
      ))}
    </div>
  );
}
