import React, { useState } from 'react';
import { EllipsisVertical, CircleArrowUp, ArrowRight } from 'lucide-react';
import { colors, typography } from '../../../design-system/tokens';
import DataTableCell from '../DataTableCell';
import Badge from '../Badge';

/**
 * RowDFT — Plato design system, famille « Postes ». Source : Figma node
 * 36053:4822 (page ComponentTable, « Row DFT »).
 *
 * Rangée DFT (Déficit fonctionnel temporaire) — rangées par période avec
 * plage de dates, taux (badge), nombre de jours et montant calculé.
 * Colonnes : doc · période (date → date) · libellé · taux · nombre de jours ·
 * montant (revalorisation optionnelle) · options.
 *
 * Variants Figma : Header (40px) / Row (52px) × Default / Hover.
 * Hover réel (souris) + `pinHover` pour figer le visuel en démo.
 * Compose DataTableCell (DocSource) et Badge (secondary, md = px8/py4).
 * NB fidélité Figma : l'en-tête « Nombre de jours » est aligné à droite
 * alors que la valeur de la rangée est alignée à gauche (tel quel en maquette).
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

function HeaderCell({ label, width, flex = false, align = 'left' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      height: '100%', padding: 12, boxSizing: 'border-box',
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
// Cellule rangée horizontale (période, libellé) : flex-row items-center gap 8.
const rowCell = {
  display: 'flex', alignItems: 'center', gap: 8,
  flex: '1 0 0', minWidth: 1, height: '100%', padding: 12, boxSizing: 'border-box',
};

export default function RowDFT({
  type = 'header',          // 'header' | 'row'
  state = 'default',        // 'default' | 'hover'
  pinHover = false,         // force le visuel hover (démo)
  revalorisation = false,   // affiche l'ancien montant + flèche de revalorisation
  width = '100%',           // Figma : 1152px
  periodeDebut = '03/02/2026',
  periodeFin = '15/02/2026',
  libelle = 'Libellé',
  taux = '50%',
  jours = '13',
  montant = '50 €',
  ancienMontant = '23,50€',
  style,
}) {
  const [hovered, setHovered] = useState(false);
  const isRow = type === 'row';
  const hover = isRow && (pinHover || state === 'hover' || hovered);

  return (
    <div
      onMouseEnter={isRow ? () => setHovered(true) : undefined}
      onMouseLeave={isRow ? () => setHovered(false) : undefined}
      style={{
        display: 'flex', width, boxSizing: 'border-box',
        alignItems: isRow ? 'center' : 'stretch',
        height: isRow ? 52 : 40,
        background: hover ? colors.semantic.background : colors.semantic.white,
        borderBottom: `1px solid ${colors.semantic.border}`,
        ...style,
      }}
    >
      {isRow ? (
        <>
          {/* Doc : porte-icône DocSource (DataTableCell canonique) */}
          <DataTableCell type="DocSource" style={{ flexShrink: 0 }} />
          {/* Période : date → date */}
          <div style={rowCell}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ ...body, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{periodeDebut}</span>
              <ArrowRight style={{ width: 14, height: 14, flexShrink: 0 }} strokeWidth={2.28} color={colors.semantic.mutedForeground} />
              <span style={{ ...body, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{periodeFin}</span>
            </div>
          </div>
          {/* Libellé */}
          <div style={rowCell}>
            <span style={{ ...body, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{libelle}</span>
          </div>
          {/* Taux : Badge secondary (px8 / py4) */}
          <div style={colCell}>
            <Badge variant="secondary" size="md" label={taux} />
          </div>
          {/* Nombre de jours */}
          <div style={colCell}>
            <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{jours}</span>
          </div>
          {/* Montant (droite, medium, revalorisation optionnelle) */}
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
            <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{montant}</span>
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
          <HeaderCell label="Doc" width={50} />
          <HeaderCell label="Période" flex />
          <HeaderCell label="Libellé" flex />
          <HeaderCell label="Taux" flex />
          <HeaderCell label="Nombre de jours" flex align="right" />
          <HeaderCell label="Montant" flex align="right" />
          <HeaderCell width={44} />
        </>
      )}
    </div>
  );
}
