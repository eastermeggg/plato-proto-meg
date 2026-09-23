import React, { useState } from 'react';
import { EllipsisVertical, CircleArrowUp } from 'lucide-react';
import { colors, typography } from '../../../design-system/tokens';
import DataTableCell from '../DataTableCell';

/**
 * RowDSA — Plato design system, famille « Postes ». Source : Figma node
 * 35746:39906 (page ComponentTable, « Row DSA »).
 *
 * Rangée DSA (Dépenses de santé actuelles) — détail de poste VD.
 * Colonnes : doc (porte-icône) · libellé · date · montant · reste à charge
 * (avec revalorisation optionnelle) · options.
 *
 * Variants Figma : Type = Header (40px) / Line (52px) × State = Default / Hover.
 * Hover réel (souris) + `pinHover` pour figer le visuel en démo.
 * Compose DataTableCell (type DocSource) ; tokens uniquement.
 */

const sans = typography.fontFamily.sans;
const body = {
  fontFamily: sans,
  fontSize: typography.scale.body.size,                 // 14
  lineHeight: `${typography.scale.body.lineHeight}px`,  // 20
  fontWeight: typography.scale.body.weight,             // 400
};
const bodyMedium = { ...body, fontWeight: typography.scale['body-medium'].weight }; // 500
const caption = {
  fontFamily: sans,
  fontSize: typography.scale.caption.size,                 // 12
  lineHeight: `${typography.scale.caption.lineHeight}px`,  // 16
  fontWeight: 400,
  letterSpacing: `${typography.scale.caption.letterSpacing}px`,
};
const monoHeader = {
  margin: 0,
  fontFamily: typography.fontFamily.mono,
  fontSize: typography.scale['caption-header-cols'].size,  // 11
  fontWeight: 500,
  lineHeight: 'normal',
  textTransform: 'uppercase',
  color: colors.semantic.mutedForeground,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

// Cellule d'en-tête : h 40, mono 11 medium uppercase, padding 12 (Figma DataTableHeader).
function HeaderCell({ label, width, flex = false, align = 'left', padding = 12 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      height: '100%', padding, boxSizing: 'border-box',
      width, flexShrink: width != null ? 0 : undefined,
      flex: flex ? '1 0 0' : undefined, minWidth: flex ? 1 : undefined,
    }}>
      {label != null && (
        <p style={{ ...monoHeader, flex: '1 0 0', minWidth: 1, textAlign: align === 'right' ? 'right' : 'left' }}>
          {label}
        </p>
      )}
    </div>
  );
}

// Cellule colonne standard : flex-col justify-center, padding 12, gap 4.
const colCell = {
  display: 'flex', flexDirection: 'column', gap: 4,
  alignItems: 'flex-start', justifyContent: 'center',
  flex: '1 0 0', minWidth: 1, height: '100%', padding: 12, boxSizing: 'border-box',
};

export default function RowDSA({
  type = 'line',            // 'header' | 'line'
  state = 'default',        // 'default' | 'hover'
  pinHover = false,         // force le visuel hover (démo)
  revalorisation = false,   // affiche l'ancien montant + flèche de revalorisation
  width = '100%',           // Figma : 1152px
  libelle = 'Taxi médical',
  date = '03/02/2026',
  montant = '42 €',
  resteACharge = '24,12 €',
  ancienMontant = '23,50€',
  style,
}) {
  const [hovered, setHovered] = useState(false);
  const isLine = type === 'line';
  const hover = isLine && (pinHover || state === 'hover' || hovered);

  return (
    <div
      onMouseEnter={isLine ? () => setHovered(true) : undefined}
      onMouseLeave={isLine ? () => setHovered(false) : undefined}
      style={{
        display: 'flex', width, boxSizing: 'border-box',
        alignItems: isLine ? 'center' : 'stretch',
        height: isLine ? 52 : 40,
        background: hover ? colors.semantic.background : colors.semantic.white,
        borderBottom: `1px solid ${colors.semantic.border}`,
        ...style,
      }}
    >
      {isLine ? (
        <>
          {/* Doc : porte-icône DocSource (DataTableCell canonique) */}
          <DataTableCell type="DocSource" style={{ flexShrink: 0 }} />
          {/* Libellé */}
          <div style={colCell}>
            <span style={{ ...body, color: colors.semantic.foreground, width: '100%', wordBreak: 'break-word' }}>{libelle}</span>
          </div>
          {/* Date */}
          <div style={colCell}>
            <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{date}</span>
          </div>
          {/* Montant (droite, stone/700) */}
          <div style={{ ...colCell, alignItems: 'flex-end' }}>
            <span style={{ ...body, color: colors.semantic.foregroundTertiary, whiteSpace: 'nowrap' }}>{montant}</span>
          </div>
          {/* Reste à charge (droite, medium, revalorisation optionnelle) */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6,
            flex: '1 0 0', minWidth: 1, height: '100%', padding: 12, boxSizing: 'border-box',
          }}>
            {revalorisation && (
              <>
                <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{ancienMontant} ·</span>
                <CircleArrowUp style={{ width: 12, height: 12, flexShrink: 0 }} strokeWidth={2.66} color={colors.feedback.info.text} />
              </>
            )}
            <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{resteACharge}</span>
          </div>
          {/* Actions */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center',
            padding: '12px 16px 12px 12px', height: '100%', boxSizing: 'border-box', flexShrink: 0,
          }}>
            <EllipsisVertical style={{ width: 16, height: 16 }} color={colors.semantic.foregroundSecondary} />
          </div>
        </>
      ) : (
        <>
          <HeaderCell label="Doc" width={52} />
          <HeaderCell label="Libellé" flex />
          <HeaderCell label="Date" flex />
          <HeaderCell label="Montant" flex align="right" />
          <HeaderCell label="Reste à charge" flex align="right" padding="12px 8px" />
          <HeaderCell width={44} />
        </>
      )}
    </div>
  );
}
