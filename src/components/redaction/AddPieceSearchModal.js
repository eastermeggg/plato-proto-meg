import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Check } from 'lucide-react';
import { buildTreeViewRows } from '../../data/piecesModel';
import CategoryHeader from '../pieces/CategoryHeader';
import PieceRow from '../pieces/PieceRow';

// "Ajouter une pièce" — reuses the Pièces tab's tree (same `buildTreeViewRows`
// engine, same `CategoryHeader` and `PieceRow` components) so the browsing
// experience matches the tree the avocat already knows. Search filters the
// pieces and force-expands all folders. Folders default to expanded on open
// so every piece is visible without clicks.
//
// P1 scope (project_jp_scope_separation memory): matter pieces only — no
// cabinet library, no OCR.
//
// Props:
//   open             — modal visibility
//   onClose          — close handler
//   pieces           — dossier pieces array
//   categories       — dossier folder arbo
//   existingPieceIds — Set<pieceId> already in the bordereau
//   onAdd(piece)     — selection handler; modal closes after
export default function AddPieceSearchModal({
  open,
  onClose,
  pieces = [],
  categories = [],
  existingPieceIds = new Set(),
  onAdd,
  onAddMany,
}) {
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIds(new Set());
      // Default-expand everything so all pieces are immediately visible.
      setExpandedIds(new Set(categories.map((c) => c.id)));
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, categories]);

  const toggleSelect = (pieceId) => {
    // Already-added pieces are locked (shown checked, can't toggle).
    if (existingPieceIds.has(pieceId)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(pieceId)) next.delete(pieceId); else next.add(pieceId);
      return next;
    });
  };

  const confirmAdd = () => {
    // Only the newly-selected pieces (never the already-added, locked ones).
    const chosen = pieces.filter((p) => selectedIds.has(p.id) && !existingPieceIds.has(p.id));
    if (chosen.length === 0) return;
    if (onAddMany) onAddMany(chosen);
    else chosen.forEach((p) => onAdd?.(p));
    onClose?.();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Search filter — applied to the whole piece list. Already-added pieces stay
  // visible (shown pre-checked + locked, no tag); they're just not re-addable.
  const filteredPieces = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pieces;
    return pieces.filter((p) => {
      const fields = [p.nom, p.intitule, p.type, p.nomOriginal].filter(Boolean).map((s) => String(s).toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }, [pieces, query]);

  // While searching, prune the tree to only the folders that contain a match
  // (plus their ancestor path) so empty branches don't clutter the results.
  const visibleCategories = useMemo(() => {
    if (!query.trim()) return categories;
    const byId = new Map(categories.map((c) => [c.id, c]));
    const keep = new Set();
    filteredPieces.forEach((p) => {
      let cid = p.categoryId;
      while (cid != null && !keep.has(cid)) {
        keep.add(cid);
        cid = byId.get(cid)?.parentId ?? null;
      }
    });
    return categories.filter((c) => keep.has(c.id));
  }, [query, categories, filteredPieces]);

  const effectiveExpanded = useMemo(() => {
    if (!query.trim()) return expandedIds;
    return new Set(visibleCategories.map((c) => c.id));
  }, [query, expandedIds, visibleCategories]);

  const rows = useMemo(
    () => buildTreeViewRows(filteredPieces, visibleCategories, effectiveExpanded),
    [filteredPieces, visibleCategories, effectiveExpanded],
  );

  const toggleExpand = (catId) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId); else next.add(catId);
      return next;
    });
  };

  if (!open) return null;

  const totalPieces = pieces.length;
  const totalShown = filteredPieces.length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center"
      style={{ paddingTop: '8vh' }}
      onClick={onClose}
    >
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(26,26,26,0.32)' }} />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[640px] bg-white rounded-[12px] overflow-hidden"
        style={{
          boxShadow: '0px 8px 16px -4px rgba(26,26,26,0.10), 0px 16px 40px -8px rgba(26,26,26,0.14)',
          border: '1px solid #e7e5e3',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <div>
            <h2 style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 15, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
              Ajouter une pièce
            </h2>
            <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, color: '#78716c', margin: '2px 0 0' }}>
              {totalPieces} pièce{totalPieces > 1 ? 's' : ''} dans le dossier
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[#78716c] hover:bg-[#fafaf9] hover:text-[#292524] transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div
            className="flex items-center gap-2 px-3 h-10 rounded-[8px]"
            style={{ border: '1px solid #e7e5e3', backgroundColor: '#fafaf9' }}
          >
            <Search className="w-4 h-4 text-[#a8a29e]" strokeWidth={1.75} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une pièce ou un dossier…"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 14,
                color: '#292524',
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-[12px] text-[#78716c] hover:text-[#292524] transition-colors"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Effacer
              </button>
            )}
          </div>
        </div>

        {/* Tree (reuses the Pièces-tab visual via CategoryHeader / PieceRow) */}
        <div
          style={{
            maxHeight: '60vh',
            overflowY: 'auto',
            borderTop: '1px solid #e7e5e3',
          }}
        >
          {totalPieces === 0 ? (
            <EmptyState message="Aucune pièce n'a encore été ajoutée à ce dossier." />
          ) : totalShown === 0 ? (
            <EmptyState message="Aucune pièce ne correspond à votre recherche." />
          ) : (
            rows.map((row) => {
              if (row.kind === 'sansCategorieHeader') {
                return <SansCatBand key="sans-cat" count={row.count} />;
              }
              if (row.kind === 'category') {
                return (
                  <CategoryHeader
                    key={`cat-${row.category.id}`}
                    label={row.category.name}
                    depth={row.depth}
                    hasChildren={row.hasChildren}
                    expanded={row.expanded}
                    isEmpty={!row.hasChildren}
                    browseOnly
                    onToggle={() => toggleExpand(row.category.id)}
                  />
                );
              }
              // piece or sansCategoriePiece
              const p = row.piece;
              const alreadyAdded = existingPieceIds.has(p.id);
              return (
                <PieceAddRow
                  key={`p-${p.id}`}
                  piece={p}
                  depth={row.depth}
                  italic={row.kind === 'sansCategoriePiece'}
                  // Already-added pieces show as checked + locked, no tag.
                  selected={alreadyAdded || selectedIds.has(p.id)}
                  locked={alreadyAdded}
                  onToggle={() => toggleSelect(p.id)}
                />
              );
            })
          )}
        </div>

        {/* Footer — selection count + confirm */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: '1px solid #e7e5e3', backgroundColor: '#fafaf9' }}
        >
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#78716c' }}>
            {selectedIds.size === 0
              ? 'Sélectionnez des pièces à ajouter'
              : `${selectedIds.size} pièce${selectedIds.size > 1 ? 's' : ''} sélectionnée${selectedIds.size > 1 ? 's' : ''}`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex items-center px-3 h-9 rounded-[8px] text-[13px] font-medium text-[#44403c] hover:bg-[#f0efed] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={confirmAdd}
              disabled={selectedIds.size === 0}
              className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-[8px] text-[13px] font-medium text-white transition-colors"
              style={{
                backgroundColor: selectedIds.size === 0 ? '#d6d3d1' : '#292524',
                cursor: selectedIds.size === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <Check className="w-3.5 h-3.5" strokeWidth={2} />
              {selectedIds.size > 0 ? `Ajouter (${selectedIds.size})` : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rows ──────────────────────────────────────────────────────────
function SansCatBand({ count }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-1.5"
      style={{
        backgroundColor: '#fafaf9',
        borderBottom: '1px solid #f5f4f0',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        fontWeight: 500,
        color: '#78716c',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
      }}
    >
      <span>Sans catégorie</span>
      <span style={{ color: '#a8a29e' }}>{count}</span>
    </div>
  );
}

// Wraps the Pièces-tab `PieceRow` so click = "toggle selection". Already-added
// pieces render checked + locked (no tag) — `locked` slightly mutes them and
// blocks toggling. Selected pieces are committed together via the footer.
function PieceAddRow({ piece, depth, italic, selected, locked, onToggle }) {
  return (
    <div style={{ position: 'relative', opacity: locked ? 0.6 : 1 }}>
      <PieceRow
        piece={piece}
        depth={depth}
        italic={italic}
        selected={selected}
        hideType
        onClick={locked ? undefined : onToggle}
        onSelectToggle={locked ? undefined : onToggle}
      />
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div
      className="py-14 px-4 text-center"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 13,
        color: '#a8a29e',
      }}
    >
      {message}
    </div>
  );
}
