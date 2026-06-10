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
}) {
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      // Default-expand everything so all pieces are immediately visible.
      setExpandedIds(new Set(categories.map((c) => c.id)));
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, categories]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Search filter — applied to the piece list. When a query is set we also
  // force-expand every category so matches inside collapsed folders surface
  // (mirrors PiecesTab.forceExpandAll).
  const filteredPieces = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pieces;
    return pieces.filter((p) => {
      const fields = [p.nom, p.intitule, p.type, p.nomOriginal].filter(Boolean).map((s) => String(s).toLowerCase());
      return fields.some((f) => f.includes(q));
    });
  }, [pieces, query]);

  const effectiveExpanded = useMemo(() => {
    if (!query.trim()) return expandedIds;
    return new Set(categories.map((c) => c.id));
  }, [query, expandedIds, categories]);

  const rows = useMemo(
    () => buildTreeViewRows(filteredPieces, categories, effectiveExpanded),
    [filteredPieces, categories, effectiveExpanded],
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
                  alreadyAdded={alreadyAdded}
                  onPick={() => { onAdd?.(p); onClose?.(); }}
                />
              );
            })
          )}
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

// Wraps the Pièces-tab `PieceRow` so click = "add to bordereau", and pieces
// already in the bordereau are dimmed and disabled with a chip.
function PieceAddRow({ piece, depth, italic, alreadyAdded, onPick }) {
  return (
    <div
      style={{
        position: 'relative',
        opacity: alreadyAdded ? 0.55 : 1,
        cursor: alreadyAdded ? 'not-allowed' : undefined,
        pointerEvents: alreadyAdded ? 'none' : undefined,
      }}
    >
      <PieceRow
        piece={piece}
        depth={depth}
        italic={italic}
        onClick={onPick}
      />
      {alreadyAdded && (
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[5px]"
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: '#eeece6',
            color: '#78716c',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            pointerEvents: 'none',
          }}
        >
          <Check className="w-2.5 h-2.5" strokeWidth={2} />
          Déjà ajoutée
        </span>
      )}
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
