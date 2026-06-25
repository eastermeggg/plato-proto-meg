import React, { useState } from 'react';
import { FileText, MoreVertical, Loader2, Check, Download, Scissors } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';

// Doc row aligned with Figma "Row Documents" — 64px tall.
// - Resting: file icon + name (with original filename subtitle) + type pill + date + invisible action slots.
// - Hover: Download + kebab fade in to the right.
// - Selected: file icon swaps to a filled stone checkbox; hover icons still appear.

const ROW_HEIGHT = 64;
const INDENT = 24;

export default function PieceRow({
  piece,
  depth = 0,
  italic = false,
  selected = false,
  onClick,
  onSelectToggle,
  onContextMenu,
  onOpenMenu,
}) {
  // Split parts (a découpé document's pieces / exploded pile segments) keep their
  // AI clean name and get the scissors marker; whole (non-split) documents show
  // their ORIGINAL filename instead. Drop-first rows carry `_docSplit`; seeded
  // bordereau pieces carry `splitIndex` / `siblings` — either signals a part.
  const isSplitDoc = piece._docSplit === 'split' || piece._docSplit === 'exploded'
    || piece.splitIndex != null || !!piece.siblings;
  const cleanLabel = piece.intitule || (piece.nom ? piece.nom.replace(/\.[^/.]+$/, '') : '');
  // Show the clean/renamed name (with the original as a subtitle) for split parts
  // OR docs the user renamed in the panel; otherwise a whole doc shows its original name.
  const showCleanName = isSplitDoc || !!piece._userRenamed;
  const label = showCleanName ? cleanLabel : (piece.nomOriginal || cleanLabel);
  const [hover, setHover] = useState(false);

  const handleClick = (e) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      onSelectToggle?.();
      return;
    }
    onClick?.();
  };
  const handleContextMenu = (e) => { e.preventDefault(); onContextMenu?.({ x: e.clientX, y: e.clientY }); };
  const handleKebab = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onOpenMenu?.({ x: rect.right - 4, y: rect.bottom });
  };

  const bg = selected
    ? colors.semantic.backgroundSubtle
    : (hover ? colors.semantic.backgroundHover : colors.semantic.white);

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: ROW_HEIGHT,
        backgroundColor: bg,
        borderBottom: `1px solid ${colors.semantic.border}`,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background-color 100ms',
      }}
    >
      {/* Indent spacer — mirrors the chevron/folder column width on folder rows so
          the file icon aligns under its parent folder. */}
      <span style={{ width: 40 + depth * INDENT, flexShrink: 0 }} />

      {/* Icon slot — file at rest, checkbox on hover or when selected; spinner during drop-first processing */}
      <div
        onClick={(e) => {
          if (!(hover || selected)) return;
          e.stopPropagation();
          onSelectToggle?.();
        }}
        style={{
          width: 24,
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 8,
          cursor: (hover || selected) ? 'pointer' : 'default',
          color: colors.semantic.foregroundMuted,
        }}
      >
        {(hover || selected) ? (
          <SelectionBox checked={selected} />
        ) : piece._processing ? (
          <Loader2 className="animate-spin" style={{ width: 15, height: 15 }} strokeWidth={1.5} />
        ) : isSplitDoc ? (
          <Scissors style={{ width: 15, height: 15 }} strokeWidth={1.5} />
        ) : (
          <FileText style={{ width: 15, height: 15 }} strokeWidth={1.5} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0, paddingRight: 12, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
        <span style={{
          fontFamily: typography.fontFamily.sans,
          fontSize: 14,
          fontWeight: 500,
          color: colors.semantic.foreground,
          fontStyle: italic ? 'italic' : 'normal',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
        {piece.nomOriginal && piece.nomOriginal !== label && piece.nomOriginal !== piece.nom && (
          <span
            title={`Nom d'origine : ${piece.nomOriginal}`}
            style={{
              fontFamily: typography.fontFamily.sans,
              fontSize: 12,
              color: colors.semantic.foregroundMuted,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
            {piece.nomOriginal}
          </span>
        )}
      </div>

      {/* Type badge dropped (front-only). The 130px slot is kept so rows stay
          aligned with the header's type spacer and the Date column. */}
      <div style={{ width: 130, flexShrink: 0, paddingRight: 12 }} />

      <div style={{
        width: 130,
        flexShrink: 0,
        paddingRight: 12,
        fontFamily: typography.fontFamily.sans,
        fontSize: 14,
        color: colors.semantic.foreground,
      }}>
        {piece.date || '—'}
      </div>

      <span
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 72,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 2,
          paddingRight: 12,
        }}
      >
        <HoverSlot visible={hover}>
          <BareIcon icon={Download} title="Télécharger" onClick={(e) => { e.stopPropagation(); /* stub */ }} />
        </HoverSlot>
        <HoverSlot visible={hover}>
          <BareIcon icon={MoreVertical} title="Plus d'actions" onClick={handleKebab} />
        </HoverSlot>
      </span>
    </div>
  );
}

function HoverSlot({ visible, children }) {
  return (
    <span style={{
      width: 28,
      height: 28,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: visible ? 1 : 0,
      visibility: visible ? 'visible' : 'hidden',
      transition: 'opacity 120ms ease-out',
    }}>
      {children}
    </span>
  );
}

function BareIcon({ icon: Icon, title, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      style={{
        width: 28,
        height: 28,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: colors.semantic.foregroundSecondary,
        padding: 0,
        transition: 'color 100ms',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = colors.semantic.foreground; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = colors.semantic.foregroundSecondary; }}
    >
      <Icon style={{ width: 16, height: 16 }} strokeWidth={1.5} />
    </button>
  );
}

function SelectionBox({ checked }) {
  return (
    <span style={{
      width: 16,
      height: 16,
      borderRadius: 3,
      border: `1.5px solid ${checked ? colors.semantic.foreground : colors.semantic.foregroundMuted}`,
      backgroundColor: checked ? colors.semantic.foreground : 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {checked && <Check style={{ width: 11, height: 11, color: 'white' }} strokeWidth={3} />}
    </span>
  );
}
