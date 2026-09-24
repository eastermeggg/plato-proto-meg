import React, { useState } from 'react';
import { Folder, Download, EllipsisVertical } from 'lucide-react';
import { colors, typography } from '../../../design-system/tokens';

/**
 * RowFolders — Plato design system. Source : Figma node 36822:2760
 * (page ComponentTable, groupe « Documents » des familles de rangées).
 *
 * Rangée de l'onglet Dossiers (organisation des documents en dossiers) :
 *   type="header" (40px)  en-têtes de colonnes mono 11 uppercase :
 *                         Nom du dossier (flex-1) · # docs (140) ·
 *                         Dernier ajout le (140) · actions (70).
 *   type="row"    (44px)  dossier (icône Folder pleine bleue) + compteur +
 *                         date. Status Default (actions invisibles) / Hover
 *                         (fond background + Download + EllipsisVertical).
 *                         Hover réel (souris) ou forcé via pinHover.
 *
 * NB : la cellule dossier du Figma (icône pleine bleue duotone, rangée 44px)
 * diverge du type Folder de DataTableCell (FolderOpen filaire info, 52px) —
 * d'où le markup local. Tokens uniquement.
 */

const body = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.body.size,                 // 14
  lineHeight: `${typography.scale.body.lineHeight}px`,  // 20
  fontWeight: typography.scale.body.weight,             // 400
};
const bodyMedium = { ...body, fontWeight: typography.scale['body-medium'].weight }; // 500
const monoCol = {
  fontFamily: typography.fontFamily.mono,
  fontSize: typography.scale['caption-header-cols'].size, // 11
  fontWeight: typography.scale['caption-header-cols'].weight, // 500
  lineHeight: 'normal',
  textTransform: 'uppercase',
};

const CELL_PAD = 12;

export default function RowFolders({
  type = 'header',        // 'header' | 'row'
  status = 'default',     // 'default' | 'hover'
  pinHover = false,       // force le visuel hover (démo)
  width = '100%',
  // Contenu (défauts = exemples du Figma)
  name = 'Analyse biologiques',
  count = '130',
  date = '15/11/2023',
  columns = { name: 'Nom du dossier', count: '# docs', lastAdded: 'Dernier ajout le' },
  onOpen,
  onDownload,
  onMore,
  style,
}) {
  const [hovered, setHovered] = useState(false);
  const isHover = type === 'row' && (pinHover || status === 'hover' || hovered);

  // ── Header : en-têtes de colonnes (40px) ─────────────────────────────────
  if (type === 'header') {
    const headCell = (label, cellStyle) => (
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 40, padding: CELL_PAD, boxSizing: 'border-box',
        ...cellStyle,
      }}>
        <span style={{
          ...monoCol, color: colors.semantic.mutedForeground,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {label}
        </span>
      </div>
    );
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        width, boxSizing: 'border-box',
        background: colors.semantic.card,
        borderBottom: `1px solid ${colors.semantic.border}`,
        ...style,
      }}>
        {headCell(columns.name, { flex: '1 0 0', minWidth: 1 })}
        {headCell(columns.count, { width: 140, flexShrink: 0 })}
        {headCell(columns.lastAdded, { width: 140, flexShrink: 0 })}
        <div style={{ width: 70, height: 40, flexShrink: 0 }} />
      </div>
    );
  }

  // ── Row : dossier + compteur + date + actions (44px) ─────────────────────
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center',
        width, height: 44, boxSizing: 'border-box',
        background: isHover ? colors.semantic.background : colors.semantic.card,
        borderBottom: `1px solid ${colors.semantic.border}`,
        cursor: onOpen ? 'pointer' : 'default',
        ...style,
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        flex: '1 0 0', minWidth: 1, height: '100%', padding: CELL_PAD, boxSizing: 'border-box',
      }}>
        <Folder
          style={{ width: 16, height: 16, flexShrink: 0 }}
          strokeWidth={1.75}
          color={colors.chart[3]}
          fill={colors.chart[1]}
        />
        <span style={{
          ...bodyMedium, color: colors.semantic.foreground,
          minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', width: 140, flexShrink: 0, height: '100%', padding: CELL_PAD, boxSizing: 'border-box' }}>
        <span style={{ ...body, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{count}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', width: 140, flexShrink: 0, height: '100%', padding: CELL_PAD, boxSizing: 'border-box' }}>
        <span style={{ ...body, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{date}</span>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
        width: 70, flexShrink: 0, height: '100%',
        padding: '12px 16px 12px 12px', boxSizing: 'border-box',
      }}>
        {isHover && (
          <>
            <Download
              style={{ width: 16, height: 16, cursor: 'pointer' }}
              strokeWidth={1.75}
              color={colors.semantic.mutedForeground}
              onClick={(e) => { e.stopPropagation(); if (onDownload) onDownload(); }}
            />
            <EllipsisVertical
              style={{ width: 16, height: 16, cursor: 'pointer' }}
              strokeWidth={1.75}
              color={colors.semantic.mutedForeground}
              onClick={(e) => { e.stopPropagation(); if (onMore) onMore(); }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export const ROW_FOLDERS_TYPES = ['header', 'row'];
export const ROW_FOLDERS_STATUSES = ['default', 'hover'];
