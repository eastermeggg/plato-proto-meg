import React, { useState } from 'react';
import { FileText, File, Scissors, Pencil, EllipsisVertical } from 'lucide-react';
import { colors, typography, radius } from '../../../design-system/tokens';

/**
 * RowDocuments — Plato design system. Source : Figma node 36319:12668
 * (page ComponentTable, groupe « Documents » des familles de rangées).
 *
 * Rangée de l'onglet Documents d'un dossier :
 *   type="header"      (40px) en-têtes mono 11 uppercase : Nom du document
 *                      (flex-1) · Date d'emission (140) · actions (70).
 *   type="row"         (44px) document (FileText pleine rouge) + date.
 *     status="default"  actions invisibles.
 *     status="loading"  titre (File + nom de fichier) à 40% d'opacité +
 *                       squelette de date 64x18.
 *     status="hover"    fond background + Pencil + EllipsisVertical.
 *     status="selected" même visuel que hover, épinglé.
 *   type="rowSplitted" (44px) document découpé : Scissors (violet ai) +
 *                      libellé + nom de fichier source en caption.
 *
 * Hover réel (souris) ou forcé via pinHover. Le type Text de DataTableCell
 * (icône filaire foreground) ne couvre pas l'icône document pleine rouge de
 * cette famille - markup local, tokens uniquement.
 */

const body = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.body.size,                 // 14
  lineHeight: `${typography.scale.body.lineHeight}px`,  // 20
  fontWeight: typography.scale.body.weight,             // 400
};
const caption = {
  fontFamily: typography.fontFamily.sans,
  fontSize: typography.scale.caption.size,              // 12
  lineHeight: `${typography.scale.caption.lineHeight}px`, // 16
  fontWeight: typography.scale.caption.weight,          // 400
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

// Icône document « pleine » : page rouge, traits blancs (relevé Figma).
export function DocIcon({ icon: Icon = FileText }) {
  return (
    <Icon
      style={{ width: 16, height: 16, flexShrink: 0 }}
      strokeWidth={1.5}
      color={colors.semantic.white}
      fill={colors.doc.pdf}
    />
  );
}

export default function RowDocuments({
  type = 'header',        // 'header' | 'row' | 'rowSplitted'
  status = 'default',     // 'default' | 'loading' | 'hover' | 'selected'
  pinHover = false,       // force le visuel hover (démo)
  width = '100%',
  // Contenu (défauts = exemples du Figma)
  name = 'Analyse biologiques',
  fileName = 'Factures_Analyses-biologiques_Labo.pdf',
  date = '15/11/2023',
  columns = { name: 'Nom du document', date: "Date d'emission" },
  onOpen,
  onEdit,
  onMore,
  style,
}) {
  const [hovered, setHovered] = useState(false);
  const isRow = type === 'row' || type === 'rowSplitted';
  const isLoading = isRow && status === 'loading';
  const showActions = isRow && !isLoading
    && (pinHover || status === 'hover' || status === 'selected' || hovered);
  const hoverBg = isRow && !isLoading && showActions;

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
        {headCell(columns.date, { width: 140, flexShrink: 0 })}
        <div style={{ width: 70, height: 40, flexShrink: 0 }} />
      </div>
    );
  }

  // ── Row loading : ingestion en cours (44px) ──────────────────────────────
  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        width, height: 44, boxSizing: 'border-box',
        background: colors.semantic.card,
        borderBottom: `1px solid ${colors.semantic.border}`,
        ...style,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          flex: '1 0 0', minWidth: 1, height: '100%', padding: CELL_PAD, boxSizing: 'border-box',
          opacity: 0.4,
        }}>
          <File style={{ width: 16, height: 16, flexShrink: 0 }} strokeWidth={1.75} color={colors.semantic.foreground} />
          <span style={{ ...body, color: colors.semantic.mutedForeground, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {fileName}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', width: 140, flexShrink: 0, height: '100%', padding: CELL_PAD, boxSizing: 'border-box' }}>
          <div style={{
            width: 64, height: 18, borderRadius: radius.sm,
            background: colors.semantic.backgroundSubtle, opacity: 0.96,
          }} />
        </div>
        <div style={{ width: 70, flexShrink: 0, height: '100%', padding: '12px 16px 12px 12px', boxSizing: 'border-box' }} />
      </div>
    );
  }

  // ── Row / Row Splitted (44px) ────────────────────────────────────────────
  const isSplitted = type === 'rowSplitted';
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center',
        width, height: 44, boxSizing: 'border-box',
        background: hoverBg ? colors.semantic.background : colors.semantic.card,
        borderBottom: `1px solid ${colors.semantic.border}`,
        cursor: onOpen ? 'pointer' : 'default',
        ...style,
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        flex: '1 0 0', minWidth: 1, height: '100%', padding: CELL_PAD, boxSizing: 'border-box',
      }}>
        {isSplitted ? (
          <Scissors style={{ width: 16, height: 16, flexShrink: 0 }} strokeWidth={1.75} color={colors.feedback.ai.base} />
        ) : (
          <DocIcon />
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0 }}>
          <span style={{ ...body, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{name}</span>
          {isSplitted && fileName && (
            <span style={{ ...caption, color: colors.semantic.mutedForeground, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {fileName}
            </span>
          )}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', width: 140, flexShrink: 0, height: '100%', padding: CELL_PAD, boxSizing: 'border-box' }}>
        <span style={{ ...body, color: colors.semantic.foreground, whiteSpace: 'nowrap' }}>{date}</span>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
        width: 70, flexShrink: 0, height: '100%',
        padding: '12px 16px 12px 12px', boxSizing: 'border-box',
      }}>
        {showActions && (
          <>
            <Pencil
              style={{ width: 16, height: 16, cursor: 'pointer' }}
              strokeWidth={1.75}
              color={colors.semantic.mutedForeground}
              onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(); }}
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

export const ROW_DOCUMENTS_TYPES = ['header', 'row', 'rowSplitted'];
export const ROW_DOCUMENTS_STATUSES = ['default', 'loading', 'hover', 'selected'];
