import React from 'react';
import { colors, radius, shadows, typography } from '../../design-system/tokens';

/**
 * Card — Plato design system. Base shadcn tokenisée, AUCUN design custom
 * (décision steward 24/09) : surface card bordée border, radius 12,
 * élévation sm ; slots Header (titre 16/24 semibold + description muted) /
 * Content / Footer, paddings shadcn (24, contenu pt-0).
 *
 * Code-first (pas de nœud Figma) — la référence est le vanilla shadcn Card
 * traduit en tokens. Cible : les ~53 surfaces cartes ad-hoc
 * (`bg-surface border rounded-lg p-…`) relevées par l'audit, plan de
 * migration dans .context/steward-review/CARD-MIGRATION-PLAN.md.
 */

export default function Card({ children, className, style }) {
  return (
    <div
      className={className}
      style={{
        background: colors.semantic.card,
        color: colors.semantic.cardForeground,
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: radius.xl,
        boxShadow: shadows.sm,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, style }) {
  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 24, paddingBottom: 0, ...style }}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, style }) {
  return (
    <h3
      className={className}
      style={{
        fontFamily: typography.fontFamily.sans,
        fontSize: 16,
        lineHeight: '24px',
        fontWeight: 600,
        color: colors.semantic.cardForeground,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, style }) {
  return (
    <p
      className={className}
      style={{
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 400,
        color: colors.semantic.mutedForeground,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className, style }) {
  return (
    <div className={className} style={{ padding: 24, ...style }}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, style }) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 24, paddingTop: 0, ...style }}>
      {children}
    </div>
  );
}
