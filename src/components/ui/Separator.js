import React from 'react';
import { colors, typography } from '../../design-system/tokens';

/**
 * Separator — Plato design system. Source of truth: Figma « Separator »
 * (Plato---System 2819:30252). Promu depuis l'esquisse ui-kit/previews.jsx.
 *
 * Trois formes :
 *  - horizontal (défaut) : filet 1px pleine largeur (token border)
 *  - horizontal + label  : filet - libellé mono uppercase - filet
 *  - vertical            : filet 1px vertical (hauteur 16, aligné au texte)
 *
 * Toutes les valeurs viennent de src/design-system/tokens.js. Remplace les
 * `<hr>` bruts et les hairlines inline `bg-foreground/10`.
 */

export default function Separator({ orientation = 'horizontal', label, className, style }) {
  if (orientation === 'vertical') {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        className={className}
        style={{ display: 'inline-block', width: 1, height: 16, background: colors.semantic.border, verticalAlign: 'middle', ...style }}
      />
    );
  }

  if (label) {
    return (
      <div role="separator" className={className} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', ...style }}>
        <span style={{ flex: 1, height: 1, background: colors.semantic.border }} />
        <span
          style={{
            fontFamily: typography.fontFamily.mono,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.semantic.foregroundMuted,
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        <span style={{ flex: 1, height: 1, background: colors.semantic.border }} />
      </div>
    );
  }

  return (
    <hr
      className={className}
      style={{ width: '100%', height: 1, background: colors.semantic.border, border: 'none', margin: 0, ...style }}
    />
  );
}
