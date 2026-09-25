import React from 'react';
import { colors } from '../../design-system/tokens';

/**
 * Skeleton — Plato design system. Promu depuis l'esquisse ui-kit/previews.jsx.
 *
 * Surface dérivée (pas de page dans le kit Figma : figmaTodo « a-dessiner ») :
 * placeholder de chargement, teinte `cream`, shimmer via la classe
 * `.animate-shimmer` (src/index.css). Empile `count` barres identiques.
 * Theme-aware via tokens.js.
 */

export default function Skeleton({ width = '100%', height = 14, radius = 4, count = 1, className, style }) {
  const bars = Array.from({ length: count });
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: width === '100%' ? '100%' : 'auto',
        ...style,
      }}
    >
      {bars.map((_, i) => (
        <div
          key={i}
          className="animate-shimmer"
          style={{
            width,
            height,
            borderRadius: radius,
            background: colors.semantic.cream,
          }}
        />
      ))}
    </div>
  );
}
