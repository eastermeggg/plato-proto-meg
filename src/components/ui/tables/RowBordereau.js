import React, { useState } from 'react';
import { colors, typography } from '../../../design-system/tokens';
import DataTableCell from '../DataTableCell';
import { DocIcon } from './RowDocuments';

/**
 * RowBordereau — Plato design system. Source : Figma node 36448:16485
 * (page ComponentTable, groupe « Documents » des familles de rangées).
 *
 * Rangée du bordereau de pièces (sous-onglet Pièces d'un poste) :
 *   status="header"  (40px) en-têtes mono 11 uppercase : N° (46, centré) ·
 *                    Nom de la pièce (flex-1) · Date (106) + colonne d'actions
 *                    (visible dans le Figma, reprise telle quelle).
 *   status="section" (44px) bande de section fond background : titre mono 11
 *                    uppercase + nom de fichier en caption.
 *   status="default" (52px) numéro (DataTableCell Number) + nom de la pièce
 *                    medium / fichier en caption + date (icône document rouge
 *                    + fichier) + actions (DataTableCell Options).
 *   status="hover"   (52px) même contenu, fond background. Hover réel
 *                    (souris) ou forcé via pinHover. Le curseur factice de la
 *                    maquette n'est pas reproduit (cursor: pointer réel).
 *
 * Compose DataTableCell (types Number et Options) ; le nom + date restent
 * locaux (icône document pleine rouge + sous-ligne, non couverts par les
 * types existants). Tokens uniquement.
 */

const body = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.body.size,                 // 14
  lineHeight: `${typography.scale.body.lineHeight}px`,  // 20
  fontWeight: typography.scale.body.weight,             // 400
};
const bodyMedium = { ...body, fontWeight: typography.scale['body-medium'].weight }; // 500
const caption = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.caption.size,                // 12
  lineHeight: `${typography.scale.caption.lineHeight}px`, // 16
  fontWeight: typography.scale.caption.weight,            // 400
  letterSpacing: `${typography.scale.caption.letterSpacing}px`,
};
const monoCol = {
  fontFamily: typography.fontFamily.mono,
  fontSize: typography.scale['caption-header-cols'].size, // 11
  fontWeight: typography.scale['caption-header-cols'].weight, // 500
  lineHeight: 'normal',
  textTransform: 'uppercase',
};

const CELL_PAD = 12;

export default function RowBordereau({
  status = 'header',      // 'header' | 'section' | 'default' | 'hover'
  pinHover = false,       // force le visuel hover (démo)
  width = '100%',
  // Contenu (défauts = exemples du Figma)
  num = '1',
  name = 'Nom de la pièce',
  fileName = 'Factures_Analyses-biologiques_Labo.pdf',
  date = 'XX/XX/XXXX',
  dateFileName = 'Factures_Analyses-biologiques_Labo.pdf',
  sectionTitle = 'I - Nom de la section',
  sectionFileName = 'Factures_Analyses-biologiques_Labo.pdf',
  columns = { num: 'N°', name: 'Nom de la pièce', date: 'Date' },
  onOpen,
  style,
}) {
  const [hovered, setHovered] = useState(false);
  const isRow = status === 'default' || status === 'hover';
  const isHover = isRow && (pinHover || status === 'hover' || hovered);

  // ── Header : en-têtes de colonnes + colonne d'actions (40px) ─────────────
  if (status === 'header') {
    const headText = (label, extra) => (
      <span style={{
        ...monoCol, color: colors.semantic.mutedForeground,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        ...extra,
      }}>
        {label}
      </span>
    );
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        width, boxSizing: 'border-box',
        background: colors.semantic.card,
        borderBottom: `1px solid ${colors.semantic.border}`,
        ...style,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 46, flexShrink: 0, height: 40, padding: '12px 0', boxSizing: 'border-box' }}>
          {headText(columns.num, { textAlign: 'center', flex: '1 0 0', minWidth: 1 })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', flex: '1 0 0', minWidth: 1, height: 40, padding: CELL_PAD, boxSizing: 'border-box' }}>
          {headText(columns.name)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', width: 106, flexShrink: 0, height: 40, padding: CELL_PAD, boxSizing: 'border-box' }}>
          {headText(columns.date)}
        </div>
        <DataTableCell type="Options" width="auto" style={{ height: 40, flexShrink: 0 }} />
      </div>
    );
  }

  // ── Section : bande de section (44px) ────────────────────────────────────
  if (status === 'section') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        width, height: 44, boxSizing: 'border-box',
        background: colors.semantic.background,
        borderBottom: `1px solid ${colors.semantic.border}`,
        ...style,
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 4, justifyContent: 'center',
          flex: '1 0 0', minWidth: 1, padding: `0 ${CELL_PAD}px`, boxSizing: 'border-box',
        }}>
          <span style={{ ...monoCol, color: colors.semantic.foreground, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {sectionTitle}
          </span>
          {sectionFileName && (
            <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {sectionFileName}
            </span>
          )}
        </div>
      </div>
    );
  }

  // ── Default / Hover : rangée de pièce (52px) ─────────────────────────────
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center',
        width, height: 52, boxSizing: 'border-box',
        background: isHover ? colors.semantic.background : colors.semantic.card,
        borderBottom: `1px solid ${colors.semantic.border}`,
        cursor: onOpen || isHover ? 'pointer' : 'default',
        ...style,
      }}
    >
      <DataTableCell type="Number" text={num} width={46} style={{ flexShrink: 0 }} />
      <div style={{
        display: 'flex', alignItems: 'center',
        flex: '1 0 0', minWidth: 1, height: '100%', padding: CELL_PAD, boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 0 0', minWidth: 1 }}>
          <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {name}
          </span>
          {fileName && (
            <span style={{ ...caption, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {fileName}
            </span>
          )}
        </div>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0, height: '100%', padding: CELL_PAD, boxSizing: 'border-box',
      }}>
        <DocIcon />
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
          <span style={{ ...body, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{date}</span>
          {dateFileName && (
            <span style={{ ...caption, color: colors.semantic.mutedForeground, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {dateFileName}
            </span>
          )}
        </span>
      </div>
      <DataTableCell type="Options" width="auto" style={{ flexShrink: 0 }} />
    </div>
  );
}

export const ROW_BORDEREAU_STATUSES = ['header', 'section', 'default', 'hover'];
