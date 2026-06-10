import React, { useState } from 'react';
import { ListOrdered, Sparkles, Plus, GripVertical } from 'lucide-react';
import { numberEntries, entriesPieceIds } from '../../data/bordereauModel';
import AddPieceSearchModal from './AddPieceSearchModal';

// Read-only canvas for a `kind: 'bordereau'` artefact.
//
// Renders the bordereau as a bordered table (matches the Pièces tab visual
// language and the Figma RowBordereau component, 36448:16485). Entries can be
// flat (1, 2, 3…) or organised into thematic sections with hierarchical
// numbering (I, I-1, I-2, II, II-1…) — the numbering algorithm lives in
// bordereauModel.numberEntries.
//
// P1A: read-only. Manipulation (DnD reorder, inline rename, remove, add) lands
// in P1B. Title + export live in the acte sub-header (App.js), not here.
//
// Props:
//   entries — heterogeneous: section markers + pieces
//   onGenerate — optional. When the bordereau is empty AND this callback is
//                provided, the empty state shows a primary "Générer mon
//                bordereau" button that launches the generation flow.
//   generateSource — 'acte' | 'dossier' (controls the button copy)
//   dossierPieces      — array of dossier pieces, used by the "Ajouter une
//                        pièce" search modal. Omit to hide the add button.
//   dossierCategories  — folder arbo from the same dossier; the modal renders
//                        the same tree as the Pièces tab so users can browse
//                        and search in parity.
//   onAddPiece(piece)  — called when the user picks a piece in the modal.
//   onReorder(fromEntriesIdx, toEntriesIdx) — called when the user drops a
//                        piece row at a new position. Indices are over the
//                        original `entries` array (sections included).
export default function ActeBordereauCanvas({
  entries = [],
  onGenerate,
  generateSource = 'acte',
  dossierPieces,
  dossierCategories = [],
  onAddPiece,
  onReorder,
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const numbered = numberEntries(entries);
  const pieceCount = numbered.filter((e) => e.kind === 'piece').length;
  const canAdd = Array.isArray(dossierPieces) && !!onAddPiece;
  const existingIds = entriesPieceIds(entries);

  return (
    <div className="h-full overflow-y-auto" style={{ backgroundColor: '#f8f7f5' }}>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 32px' }}>
        {pieceCount === 0 ? (
          <EmptyState onGenerate={onGenerate} source={generateSource} />
        ) : (
          <>
            {canAdd && (
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 h-9 rounded-[8px] text-[13px] font-medium transition-colors"
                  style={{
                    backgroundColor: 'white',
                    color: '#44403c',
                    border: '1px solid #e7e5e3',
                    boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.04)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fafaf9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={1.75} />
                  Ajouter une pièce
                </button>
              </div>
            )}
            <BordereauTable rows={numbered} onReorder={onReorder} />
          </>
        )}
      </div>
      {canAdd && (
        <AddPieceSearchModal
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
          pieces={dossierPieces}
          categories={dossierCategories}
          existingPieceIds={existingIds}
          onAdd={onAddPiece}
        />
      )}
    </div>
  );
}

// ─── Table ──────────────────────────────────────────────────────────
const COL_NUM_W = 72;
const COL_DATE_W = 130;

function BordereauTable({ rows, onReorder }) {
  // Alternating-row index across pieces only (sections don't count).
  let pieceIdx = -1;
  const dndEnabled = !!onReorder;

  // DnD state: source row index (in `rows`), hover row index, drop position
  // ('above' | 'below') relative to the hover row.
  const [dragIdx, setDragIdx] = useState(null);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [hoverPos, setHoverPos] = useState(null);

  const handleDragStart = (idx) => (e) => {
    setDragIdx(idx);
    // Firefox needs data to start a drag.
    try { e.dataTransfer.setData('text/plain', String(idx)); } catch {}
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (idx) => (e) => {
    if (dragIdx == null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    const pos = e.clientY < mid ? 'above' : 'below';
    if (hoverIdx !== idx || hoverPos !== pos) {
      setHoverIdx(idx);
      setHoverPos(pos);
    }
  };

  const handleDrop = (idx) => (e) => {
    if (dragIdx == null) return;
    e.preventDefault();
    const targetIdx = hoverPos === 'below' ? idx + 1 : idx;
    // Adjust for the source being removed before insertion when moving forward.
    const finalIdx = dragIdx < targetIdx ? targetIdx - 1 : targetIdx;
    if (finalIdx !== dragIdx) onReorder(dragIdx, finalIdx);
    setDragIdx(null);
    setHoverIdx(null);
    setHoverPos(null);
  };

  const handleDragEnd = () => {
    setDragIdx(null);
    setHoverIdx(null);
    setHoverPos(null);
  };

  return (
    <div
      style={{
        border: '1px solid #e7e5e3',
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: 'white',
      }}
    >
      <ColumnHeader />
      {rows.map((row, i) => {
        if (row.kind === 'section') {
          return <SectionHeader key={`s-${i}`} number={row.number} name={row.name} />;
        }
        pieceIdx += 1;
        const isLast = i === rows.length - 1;
        return (
          <PieceRow
            key={`p-${i}-${row.pieceId || row.intitule}`}
            number={row.number}
            intitule={row.intitule}
            date={row.date}
            description={row.description}
            alternate={pieceIdx % 2 === 1}
            isLast={isLast}
            draggable={dndEnabled}
            dragging={dragIdx === i}
            dropAbove={dndEnabled && hoverIdx === i && hoverPos === 'above' && dragIdx !== i}
            dropBelow={dndEnabled && hoverIdx === i && hoverPos === 'below' && dragIdx !== i}
            onDragStart={handleDragStart(i)}
            onDragOver={handleDragOver(i)}
            onDrop={handleDrop(i)}
            onDragEnd={handleDragEnd}
          />
        );
      })}
    </div>
  );
}

function ColumnHeader() {
  const mono = "'IBM Plex Mono', monospace";
  const cell = {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: 500,
    color: '#78716c',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
  };
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 36,
        borderBottom: '1px solid #e7e5e3',
        backgroundColor: '#f8f7f5',
      }}
    >
      <div style={{ ...cell, width: COL_NUM_W, justifyContent: 'center', flexShrink: 0 }}>N°</div>
      <div style={{ ...cell, flex: 1, minWidth: 0 }}>Nom de la pièce</div>
      <div style={{ ...cell, width: COL_DATE_W, flexShrink: 0 }}>Date</div>
    </div>
  );
}

function SectionHeader({ number, name }) {
  const mono = "'IBM Plex Mono', monospace";
  const font = "'Inter', system-ui, sans-serif";
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 40,
        backgroundColor: 'white',
        borderBottom: '1px solid #e7e5e3',
        borderTop: '1px solid #e7e5e3',
      }}
    >
      <div
        style={{
          width: COL_NUM_W,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 11,
            fontWeight: 600,
            color: '#44403c',
            letterSpacing: '0.04em',
          }}
        >
          {number}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: '0 12px',
          fontFamily: font,
          fontSize: 13,
          fontWeight: 600,
          color: '#292524',
          textTransform: 'uppercase',
          letterSpacing: '0.03em',
        }}
      >
        {name}
      </div>
    </div>
  );
}

function PieceRow({
  number,
  intitule,
  date,
  description,
  alternate,
  isLast,
  draggable,
  dragging,
  dropAbove,
  dropBelow,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}) {
  const font = "'Inter', system-ui, sans-serif";
  const mono = "'IBM Plex Mono', monospace";
  const [hover, setHover] = useState(false);

  return (
    <div
      draggable={!!draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        minHeight: 52,
        backgroundColor: alternate ? '#fafaf9' : 'white',
        borderBottom: isLast ? 'none' : '1px solid #e7e5e3',
        opacity: dragging ? 0.4 : 1,
        cursor: draggable ? 'grab' : 'default',
        transition: 'opacity 120ms',
      }}
    >
      {/* Drop indicator — a 2px stone line above/below the row when the user
          drags another row to this position. */}
      {dropAbove && (
        <div
          style={{
            position: 'absolute',
            top: -1,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: '#292524',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      )}
      {dropBelow && (
        <div
          style={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: '#292524',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* N° badge — grip glyph reveals on hover when DnD is enabled */}
      <div
        style={{
          width: COL_NUM_W,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {draggable && (
          <GripVertical
            style={{
              width: 12,
              height: 12,
              color: '#a8a29e',
              position: 'absolute',
              left: 8,
              opacity: hover ? 1 : 0,
              transition: 'opacity 120ms',
              pointerEvents: 'none',
            }}
            strokeWidth={1.5}
          />
        )}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 38,
            height: 22,
            padding: '0 6px',
            borderRadius: 6,
            backgroundColor: '#eeece6',
            fontFamily: mono,
            fontSize: 11,
            fontWeight: 600,
            color: '#78716c',
            letterSpacing: '0.02em',
            whiteSpace: 'nowrap',
          }}
        >
          {number}
        </span>
      </div>
      {/* Intitulé + description */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: '10px 12px',
          fontFamily: font,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#292524',
            lineHeight: '20px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {intitule}
        </div>
        {description && (
          <div
            style={{
              fontSize: 12,
              color: '#78716c',
              lineHeight: '16px',
              marginTop: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {description}
          </div>
        )}
      </div>
      {/* Date */}
      <div
        style={{
          width: COL_DATE_W,
          flexShrink: 0,
          padding: '0 12px',
          fontFamily: mono,
          fontSize: 12,
          color: '#44403c',
          letterSpacing: '0.02em',
        }}
      >
        {date || '—'}
      </div>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────
function EmptyState({ onGenerate, source }) {
  const font = "'Inter', system-ui, sans-serif";
  const fromActe = source === 'acte';
  const title = onGenerate
    ? (fromActe
      ? 'Générez le bordereau depuis les pièces citées'
      : 'Générez le bordereau depuis les pièces du dossier')
    : 'Aucune pièce communiquée';
  const subtitle = onGenerate
    ? (fromActe
      ? "L'agent reprend les pièces citées dans l'acte, dans l'ordre d'apparition, et les numérote."
      : 'L\'agent reprend les pièces du dossier et les regroupe par thème.')
    : 'Ajoutez des pièces depuis le chat pour démarrer.';

  return (
    <div
      style={{
        border: '1px solid #e7e5e3',
        borderRadius: 6,
        backgroundColor: 'white',
        padding: '56px 24px',
        textAlign: 'center',
      }}
    >
      <div
        className="inline-flex items-center justify-center mb-4"
        style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#f5f4f0' }}
      >
        <ListOrdered className="w-5 h-5 text-[#a8a29e]" strokeWidth={1.5} />
      </div>
      <p style={{ fontFamily: font, fontSize: 15, fontWeight: 600, color: '#292524', margin: 0 }}>
        {title}
      </p>
      <p style={{ fontFamily: font, fontSize: 13, color: '#78716c', margin: '6px 0 0', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto', lineHeight: '18px' }}>
        {subtitle}
      </p>
      {onGenerate && (
        <button
          onClick={onGenerate}
          className="inline-flex items-center gap-2 px-4 h-10 rounded-[8px] text-[14px] font-medium text-white bg-[#292524] hover:bg-[#44403c] transition-colors mt-5"
          style={{ boxShadow: '0px 1px 2px 0px rgba(26,26,26,0.08)' }}
        >
          <Sparkles className="w-4 h-4" strokeWidth={1.75} />
          Générer mon bordereau
        </button>
      )}
    </div>
  );
}
