import React, { useState } from 'react';
import { Folder, ChevronRight, ChevronDown, MoreVertical, Check, Download } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';

// Folder row for the tree view.
// - Chevron (right when collapsed, down when expanded) appears only when the
//   folder has children. Clicking the chevron — or the row body — toggles
//   expansion. The folder icon swaps to a stone checkbox on hover/selection.
// - Indented by `depth * INDENT` so nested folders nest visually.
// - DOCUMENTS/DATE columns are intentionally empty on folder rows (the tree
//   view shows that data only on pieces); the slots are kept for alignment.

const ROW_HEIGHT = 44;
const INDENT = 24;

export default function CategoryHeader({
  label,
  depth = 0,
  hasChildren = false,
  expanded = false,
  isEmpty = false,
  selected = false,
  browseOnly = false,
  selectable = false,
  onToggle,
  onSelectToggle,
  onContextMenu,
  onDownload,
  onOpenMenu,
}) {
  const [hover, setHover] = useState(false);

  // browseOnly: folder is for navigation only — no selection checkbox, no
  //   row actions (used by "Ajouter une pièce" where only files are addable).
  // selectable: the folder itself is the target — row click selects it, the
  //   chevron expands; no row actions (used by "Déplacer vers un dossier").
  const handleClick = (e) => {
    if (selectable) {
      e.preventDefault();
      onSelectToggle?.();
      return;
    }
    if (!browseOnly && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSelectToggle?.();
      return;
    }
    if (hasChildren) onToggle?.();
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

  const Chevron = expanded ? ChevronDown : ChevronRight;

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
        cursor: (selectable || hasChildren) ? 'pointer' : 'default',
        transition: 'background-color 100ms',
      }}
    >
      {/* Indent + chevron + folder/checkbox occupy the leading column. */}
      <span style={{
        width: 40 + depth * INDENT,
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: 4,
      }}>
        <span
          onClick={selectable && hasChildren ? (e) => { e.stopPropagation(); onToggle?.(); } : undefined}
          style={{
            width: 20,
            height: 20,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.semantic.foregroundSecondary,
            visibility: hasChildren ? 'visible' : 'hidden',
            cursor: selectable && hasChildren ? 'pointer' : undefined,
          }}
        >
          <Chevron style={{ width: 14, height: 14 }} strokeWidth={2} />
        </span>
      </span>

      <span
        onClick={(e) => {
          if (browseOnly || !(selectable || hover || selected)) return;
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
          cursor: (!browseOnly && (selectable || hover || selected)) ? 'pointer' : 'inherit',
          color: isEmpty ? colors.semantic.foregroundMuted : colors.semantic.foregroundTertiary,
        }}
      >
        {/* selectable: always show the checkbox (it's the target). default:
            checkbox on hover/selected, folder icon at rest. */}
        {(!browseOnly && (selectable || hover || selected)) ? (
          <SelectionBox checked={selected} />
        ) : (
          <Folder style={{ width: 16, height: 16 }} strokeWidth={1.5} />
        )}
      </span>

      <span style={{
        flex: 1,
        minWidth: 0,
        paddingRight: 12,
      }}>
        <span style={{
          fontFamily: typography.fontFamily.sans,
          fontWeight: 500,
          fontSize: 14,
          color: isEmpty ? colors.semantic.foregroundMuted : colors.semantic.foreground,
          fontStyle: isEmpty ? 'italic' : 'normal',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block',
        }}>
          {label}
        </span>
      </span>

      {/* DOCUMENTS column — empty on folder rows */}
      <span style={{ width: 130, flexShrink: 0 }} />

      {/* DATE column — empty on folder rows */}
      <span style={{ width: 130, flexShrink: 0 }} />

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
        {!browseOnly && !selectable && (
          <>
            <HoverSlot visible={hover}>
              <BareIcon icon={Download} title="Télécharger" onClick={(e) => { e.stopPropagation(); onDownload?.(); }} />
            </HoverSlot>
            <HoverSlot visible={hover}>
              <BareIcon icon={MoreVertical} title="Plus d'actions" onClick={handleKebab} />
            </HoverSlot>
          </>
        )}
      </span>
    </div>
  );
}

// 28×28 reserved slot. Children render only while `visible`, but the slot itself
// always occupies space → no layout shift on hover.
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
