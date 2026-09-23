import React, { useState } from 'react';
import { FileText, EllipsisVertical, Trash2 } from 'lucide-react';
import { colors, typography } from '../../../design-system/tokens';

/**
 * ActRow — Plato design system, famille « Postes ». Source : Figma node
 * 36631:48943 (page ComponentTable, « ActRow »).
 *
 * Rangée d'acte (assignation, conclusions…). Colonnes : libellé (icône
 * file-text rouge « PDF » + titre medium + nom de fichier) · créé le (180px) ·
 * dernière modif. le (180px) · options. Particularité Figma : au hover,
 * l'action bascule d'ellipsis (gris) vers une corbeille (destructive).
 *
 * Variants Figma : Type = Header (40px) / Line (52px) × State = Default / Hover.
 * Hover réel (souris) + `pinHover` pour figer le visuel en démo.
 * NB fidélité Figma : la cellule libellé est intrinsèque (hug), les colonnes
 * dates fixes 180 — la ligne ne s'étire pas jusqu'au bord droit.
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

export default function ActRow({
  type = 'header',          // 'header' | 'line'
  state = 'default',        // 'default' | 'hover'
  pinHover = false,         // force le visuel hover (démo)
  width = '100%',           // Figma : 1152px
  titre = 'Assignation en référé-expertise - Dupont c/ Martin',
  fichier = 'Factures_Analyses-biologiques_Labo.pdf',
  creeLe = '03/02/2026',
  modifieLe = '03/02/2026',
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
          {/* Libellé : file-text rouge + titre medium + fichier (hug) */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: 12, height: '100%', boxSizing: 'border-box', flexShrink: 0,
          }}>
            <FileText style={{ width: 16, height: 16, flexShrink: 0 }} color={colors.doc.pdf} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
              <span style={{ ...bodyMedium, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{titre}</span>
              <span style={{ ...caption, color: colors.semantic.mutedForeground, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fichier}</span>
            </div>
          </div>
          {/* Créé le */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', justifyContent: 'center',
            width: 180, flexShrink: 0, height: '100%', padding: 12, boxSizing: 'border-box',
          }}>
            <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{creeLe}</span>
          </div>
          {/* Dernière modif. le */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start', justifyContent: 'center',
            width: 180, flexShrink: 0, height: '100%', padding: 12, boxSizing: 'border-box',
          }}>
            <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap' }}>{modifieLe}</span>
          </div>
          {/* Actions : ellipsis en repos, corbeille destructive au hover */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center',
            padding: '12px 16px 12px 12px', height: '100%', boxSizing: 'border-box', flexShrink: 0,
          }}>
            {hover ? (
              <Trash2 style={{ width: 16, height: 16 }} color={colors.feedback.destructive.base} />
            ) : (
              <EllipsisVertical style={{ width: 16, height: 16 }} color={colors.semantic.foregroundSecondary} />
            )}
          </div>
        </>
      ) : (
        <>
          <HeaderCell label="Libellé" flex />
          <HeaderCell label="Créé le" width={180} />
          <HeaderCell label="Dernière modif. le" width={180} />
          <HeaderCell width={44} />
        </>
      )}
    </div>
  );
}
