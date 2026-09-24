import React from 'react';
import { Loader2 } from 'lucide-react';
import { colors } from '../../design-system/tokens';

/**
 * Spinner — Plato design system. Source of truth: Figma node 33609:22857
 * (page « Spinner » : set 34338:4980, variants Rotation × Size).
 *
 * Indicateur de chargement : l'icône lucide loader-circle en rotation
 * continue (le set Figma fige 4 rotations 0/90/180/270 — en code, une seule
 * animation `animate-spin`).
 *
 * Tailles Figma Size=3/4/5/6/8 → xs 12 · sm 16 · md 20 · lg 24 · xl 32.
 * Couleur par défaut : foreground (relevé sur le set) ; hérite de n'importe
 * quel token passé via `color` (feedback.*, mutedForeground, white sur
 * bouton primaire…).
 */

// Figma Size=3 (12px) / 4 (16px) / 5 (20px) / 6 (24px) / 8 (32px)
const SIZES = { xs: 12, sm: 16, md: 20, lg: 24, xl: 32 };

export default function Spinner({
  size = 'sm', // défaut du set Figma : Size=4 (16px)
  color = colors.semantic.foreground,
  label = 'Chargement',
  // Escape hatches (mêmes props que Badge)
  className = '',
  style,
  title,
}) {
  const px = SIZES[size] || SIZES.sm;
  return (
    <Loader2
      role="status"
      aria-label={label}
      title={title}
      className={`animate-spin ${className}`}
      style={{ width: px, height: px, color, flexShrink: 0, ...style }}
      strokeWidth={2}
    />
  );
}
