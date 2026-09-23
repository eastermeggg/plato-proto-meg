import React from 'react';
import { colors, radius, motion } from '../../design-system/tokens';

/**
 * Progress — Plato design system. Source of truth: Figma node 2819:29134
 * (page « Progress » : set 2768:27760, variants Progress=0%…100%).
 *
 * Barre de progression déterminée :
 *  - piste : hauteur 8, radius full, bg secondary (cream/100)
 *  - remplissage : bg primary, coins gauches full (les coins droits sont
 *    clippés par la piste, comme dans le Figma)
 *  - largeur Figma de référence : 400 (fluide en usage réel : `width="100%"`)
 *
 * La valeur anime en douceur (motion.duration.base) — état absent de la
 * maquette (statique), livré quand même.
 */

export default function Progress({
  value = 0, // premier variant du set Figma (Progress=0%)
  max = 100,
  width = 400, // largeur du variant Figma; passer '100%' pour un usage fluide
  label,
  // Escape hatches (mêmes props que Badge)
  className,
  style,
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={className}
      style={{
        height: 8,
        width,
        borderRadius: radius.full,
        backgroundColor: colors.semantic.secondary,
        overflow: 'hidden',
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: `${pct}%`,
          backgroundColor: colors.semantic.primary,
          borderRadius: `${radius.full} 0 0 ${radius.full}`,
          transition: `width ${motion.duration.base} ${motion.easing.out}`,
        }}
      />
    </div>
  );
}
