import React, { useState } from 'react';
import { colors, radius, shadows } from '../../design-system/tokens';

/**
 * Tooltip — Plato design system. Promu depuis l'esquisse ui-kit/previews.jsx.
 *
 * Surface dérivée (pas de page dans le kit Figma : figmaTodo « a-dessiner ») :
 * bulle sombre `foreground` / texte `primaryForeground`, radius md, élévation
 * shadows.sm, révélée au survol ET au focus clavier du déclencheur.
 * Theme-aware via tokens.js. Un seul mot / une ligne courte ; pour un contenu
 * riche ou interactif → Popover.
 */

const OFFSET = 6;

const positions = {
  top: { bottom: `calc(100% + ${OFFSET}px)`, left: '50%', transform: 'translateX(-50%)' },
  bottom: { top: `calc(100% + ${OFFSET}px)`, left: '50%', transform: 'translateX(-50%)' },
  left: { right: `calc(100% + ${OFFSET}px)`, top: '50%', transform: 'translateY(-50%)' },
  right: { left: `calc(100% + ${OFFSET}px)`, top: '50%', transform: 'translateY(-50%)' },
};

export default function Tooltip({ content, side = 'top', children, className, style }) {
  const [show, setShow] = useState(false);
  if (!content) return children;
  return (
    <span
      className={className}
      style={{ position: 'relative', display: 'inline-flex', ...style }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            ...positions[side],
            padding: '5px 8px',
            borderRadius: radius.md,
            background: colors.semantic.foreground,
            color: colors.semantic.primaryForeground,
            fontSize: 12,
            lineHeight: '16px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 50,
            pointerEvents: 'none',
            boxShadow: shadows.sm,
          }}
        >
          {content}
        </span>
      )}
    </span>
  );
}
