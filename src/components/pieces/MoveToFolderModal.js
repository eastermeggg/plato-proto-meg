import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import CategoryHeader from './CategoryHeader';

// Move selected pieces / folders into a destination folder. Tree picker with
// expand/collapse + search. `excludeIds` hides those nodes (used when moving a
// folder — can't drop inside itself or its descendants).
//
// Chrome mirrors AddPieceSearchModal (redaction) so the two pickers feel like
// one family: 640px white card, header + subtitle, search row, scrolling tree,
// footer with Annuler / primary action.

export default function MoveToFolderModal({
  open,
  onOpenChange,
  categories,
  excludeIds = [],
  onConfirm,
  selectionLabel,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [expanded, setExpanded] = useState(() => new Set());
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSelectedId(null);
      setQuery('');
      setExpanded(new Set(categories.filter(c => c.parentId === null).map(c => c.id)));
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, categories]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onOpenChange?.(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  // Hidden subtree when moving a folder into itself/descendants.
  const allExcluded = useMemo(() => {
    const out = new Set(excludeIds);
    const stack = [...excludeIds];
    while (stack.length) {
      const id = stack.pop();
      categories.forEach(c => {
        if (c.parentId === id && !out.has(c.id)) { out.add(c.id); stack.push(c.id); }
      });
    }
    return out;
  }, [excludeIds, categories]);

  // Search: keep folders whose name matches plus their ancestor path.
  const matchedIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null; // null = no filtering
    const byId = new Map(categories.map(c => [c.id, c]));
    const keep = new Set();
    categories.forEach(c => {
      if ((c.name || '').toLowerCase().includes(q)) {
        let cur = c;
        while (cur && !keep.has(cur.id)) { keep.add(cur.id); cur = cur.parentId ? byId.get(cur.parentId) : null; }
      }
    });
    return keep;
  }, [query, categories]);

  const childrenOf = useMemo(() => {
    const m = new Map();
    categories.forEach(c => {
      if (!m.has(c.parentId)) m.set(c.parentId, []);
      m.get(c.parentId).push(c);
    });
    m.forEach(list => list.sort((a, b) => a.order - b.order));
    return m;
  }, [categories]);

  const rootCategories = useMemo(
    () => categories.filter(c => c.parentId === null).sort((a, b) => a.order - b.order),
    [categories]
  );

  const toggleExpand = (id, e) => {
    e?.stopPropagation();
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const visible = (cat) => !allExcluded.has(cat.id) && (matchedIds === null || matchedIds.has(cat.id));

  // Folder rows reuse the GED `CategoryHeader` (selectable mode) so the picker
  // looks identical to the "Ajouter une pièce" tree.
  const renderNode = (cat, depth) => {
    if (!visible(cat)) return null;
    const kids = (childrenOf.get(cat.id) || []).filter(visible);
    const hasKids = kids.length > 0;
    const isExpanded = matchedIds !== null ? true : expanded.has(cat.id);
    return (
      <React.Fragment key={cat.id}>
        <CategoryHeader
          label={cat.name}
          depth={depth}
          hasChildren={hasKids}
          expanded={isExpanded}
          selected={selectedId === cat.id}
          selectable
          onToggle={() => toggleExpand(cat.id)}
          onSelectToggle={() => setSelectedId(cat.id)}
        />
        {hasKids && isExpanded && kids.map(child => renderNode(child, depth + 1))}
      </React.Fragment>
    );
  };

  if (!open) return null;

  const visibleRoots = rootCategories.filter(visible);
  const showRootOption = matchedIds === null; // "Aucun dossier" only when not searching
  const nothingToShow = visibleRoots.length === 0 && !showRootOption;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center"
      style={{ paddingTop: '8vh' }}
      onClick={() => onOpenChange?.(false)}
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
              Déplacer vers un dossier
            </h2>
            {selectionLabel && (
              <p style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 12, color: '#78716c', margin: '2px 0 0' }}>
                {selectionLabel}
              </p>
            )}
          </div>
          <button
            onClick={() => onOpenChange?.(false)}
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
              placeholder="Rechercher un dossier…"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, color: '#292524',
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

        {/* Folder tree */}
        <div style={{ maxHeight: '60vh', overflowY: 'auto', borderTop: '1px solid #e7e5e3' }}>
          {nothingToShow ? (
            <div className="py-14 px-4 text-center" style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: '#a8a29e' }}>
              Aucun dossier ne correspond à votre recherche.
            </div>
          ) : (
            <>
              {showRootOption && (
                <CategoryHeader
                  label="Aucun dossier (racine)"
                  depth={0}
                  hasChildren={false}
                  isEmpty
                  selected={selectedId === '__root__'}
                  selectable
                  onSelectToggle={() => setSelectedId('__root__')}
                />
              )}
              {visibleRoots.map(c => renderNode(c, 0))}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderTop: '1px solid #e7e5e3', backgroundColor: '#fafaf9' }}
        >
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#78716c' }}>
            {selectedId ? 'Destination sélectionnée' : 'Choisissez un dossier'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenChange?.(false)}
              className="inline-flex items-center px-3 h-9 rounded-[8px] text-[13px] font-medium text-[#44403c] hover:bg-[#f0efed] transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => { if (selectedId) { onConfirm?.(selectedId); onOpenChange?.(false); } }}
              disabled={!selectedId}
              className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-[8px] text-[13px] font-medium text-white transition-colors"
              style={{ backgroundColor: selectedId ? '#292524' : '#d6d3d1', cursor: selectedId ? 'pointer' : 'not-allowed' }}
            >
              Déplacer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
