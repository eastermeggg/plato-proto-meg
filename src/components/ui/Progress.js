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
 *
 * Extensions code-first (steward, SIGNALEMENTS §16 + arbitrage 24/09/2026) :
 *  - `size` : md (8, Figma) · sm (4, jauges compactes type quota sidebar)
 *  - `tone` : default (primary) · caution (pré-alerte ≥70 %, proposition
 *    sémantique - un token de marque ne porte pas d'état) · warn (alerte,
 *    feedback.warning.base sur piste warning.subtle) · muted (progression
 *    discrète en contexte dense, fill foregroundMuted)
 */

const SIZES = { md: 8, sm: 4 };
const TONES = {
  default: { fill: colors.semantic.primary, track: colors.semantic.secondary },
  caution: { fill: colors.banner.warning.accent, track: colors.semantic.secondary },
  warn:    { fill: colors.feedback.warning.base, track: colors.feedback.warning.subtle },
  muted:   { fill: colors.semantic.foregroundMuted, track: colors.semantic.secondary },
};

export default function Progress({
  value = 0, // premier variant du set Figma (Progress=0%)
  max = 100,
  width = 400, // largeur du variant Figma; passer '100%' pour un usage fluide
  size = 'md',
  tone = 'default',
  label,
  // Escape hatches (mêmes props que Badge)
  className,
  style,
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const t = TONES[tone] || TONES.default;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={className}
      style={{
        height: SIZES[size] || SIZES.md,
        width,
        borderRadius: radius.full,
        backgroundColor: t.track,
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
          backgroundColor: t.fill,
          borderRadius: `${radius.full} 0 0 ${radius.full}`,
          transition: `width ${motion.duration.base} ${motion.easing.out}`,
        }}
      />
    </div>
  );
}
