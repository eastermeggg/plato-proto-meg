import React, { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { colors, typography, shadows } from '../../design-system/tokens';

/**
 * DataTableHeader — Plato design system. Source : Figma node 2768:27447
 * (page ComponentTable, « DataTableHeader »).
 *
 * Cellule d'en-tête de colonne des tables custom Plato (h40, mono 11 medium
 * uppercase). Trois types × hover × alignement droite :
 *   text     — libellé simple (tronqué ellipsis)
 *   button   — libellé + icône de tri (arrow-up-down), cliquable
 *   checkbox — case « tout sélectionner » centrée (largeur 36)
 *
 * C'est aussi la brique de la bande « Section Captions » des cotisations
 * (PIÈCE · OPÉ. + libellé de colonne valeur aligné droite). Aucun composant
 * shadcn ne couvrait ce rôle : les tables Plato sont custom div-based
 * (docs/table-system.md) — d'où ce custom, sœur de DataTableCell.
 *
 * Fidélité Figma : au repos la cellule porte le filet bas 1px border ; au
 * hover le filet disparaît et le fond passe en crème éclaircie (voile blanc
 * 50 % sur muted). Tokens uniquement.
 */

const HEADER_TEXT = {
  fontFamily: typography.fontFamily.mono,
  fontSize: typography.scale['caption-header-cols'].size, // 11
  fontWeight: typography.scale['caption-header-cols'].weight, // 500
  lineHeight: 'normal',
  textTransform: 'uppercase',
  color: colors.semantic.mutedForeground,
};

// Voile blanc 50 % posé sur muted (#eeece6) — le rendu hover exact du Figma.
const HOVER_BG = `linear-gradient(rgba(255,255,255,0.5), rgba(255,255,255,0.5)), linear-gradient(${colors.semantic.muted}, ${colors.semantic.muted})`;

export default function DataTableHeader({
  type = 'text',        // 'text' | 'button' | 'checkbox'
  label = 'Header',
  rightAlign = false,
  checked = false,      // type checkbox
  onChange,             // type checkbox
  onClick,              // type button (tri)
  pinHover = false,     // force le visuel hover (démos)
  width,                // défaut : 144 (36 pour checkbox)
  style,
  className,
}) {
  const [hovered, setHovered] = useState(false);
  const hover = pinHover || hovered;
  const isCheckbox = type === 'checkbox';
  const isButton = type === 'button';

  const base = {
    display: 'flex',
    alignItems: 'center',
    height: 40,
    width: width ?? (isCheckbox ? 36 : 144),
    boxSizing: 'border-box',
    justifyContent: isCheckbox ? 'center' : rightAlign ? 'flex-end' : 'flex-start',
    padding: isCheckbox ? '16px 8px' : isButton ? '4px 8px' : 12,
    borderBottom: hover ? '1px solid transparent' : `1px solid ${colors.semantic.border}`,
    background: hover ? HOVER_BG : 'transparent',
    cursor: isButton || isCheckbox ? 'pointer' : 'default',
    ...style,
  };

  const interactive = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  if (isCheckbox) {
    return (
      <div
        className={className}
        style={base}
        {...interactive}
        onClick={() => onChange?.(!checked)}
        role="checkbox"
        aria-checked={checked}
      >
        <span style={{
          width: 16, height: 16, borderRadius: 4, boxSizing: 'border-box',
          background: checked ? colors.semantic.primary : colors.semantic.white,
          border: checked ? 'none' : `1px solid ${colors.semantic.input}`,
          boxShadow: shadows.xs,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {checked && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.semantic.primaryForeground} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </span>
      </div>
    );
  }

  if (isButton) {
    return (
      <button
        type="button"
        className={className}
        style={{ ...base, border: 'none', borderBottom: base.borderBottom, gap: 0 }}
        {...interactive}
        onClick={onClick}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ ...HEADER_TEXT, whiteSpace: 'nowrap' }}>{label}</span>
          <ArrowUpDown style={{ width: 16, height: 16, flexShrink: 0 }} strokeWidth={1.75} color={colors.semantic.mutedForeground} />
        </span>
      </button>
    );
  }

  return (
    <div className={className} style={base} {...interactive}>
      <span style={{
        ...HEADER_TEXT,
        flex: 1, minWidth: 0,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        textAlign: rightAlign ? 'right' : 'left',
      }}>
        {label}
      </span>
    </div>
  );
}
