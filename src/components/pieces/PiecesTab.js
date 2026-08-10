import React, { useMemo, useState } from 'react';
import { Search, ListOrdered } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';
import BordereauTable from './BordereauTable';
import FullCanvasDropZone from './FullCanvasDropZone';

// GED container: search + folder tree. The drop zone is invisible — the
// whole canvas accepts file drops via the container handlers.

// `banner` : slot optionnel rendu au-dessus de l'arborescence (ex. promo
// connecteur email quand aucune boîte n'est connectée).
export default function PiecesTab({ pieces, categories, setPieces, setCategories, onAddFiles, onImportEmails, onAskChato, onGenerateBordereau, onQuickGenerateBordereau, banner = null }) {
  const [query, setQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const filteredPieces = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pieces;
    return pieces.filter(p => {
      const fields = [p.nom, p.intitule, p.type, p.nomOriginal].filter(Boolean).map(s => String(s).toLowerCase());
      return fields.some(f => f.includes(q));
    });
  }, [pieces, query]);

  return (
    <div
      className="flex flex-col -mx-4 -mt-4"
      style={{ backgroundColor: colors.semantic.backgroundCanvas, flex: 1, minHeight: '100vh', position: 'relative' }}
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes('Files')) return;
        e.preventDefault();
        if (!dragOver) setDragOver(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setDragOver(false);
      }}
      onDrop={(e) => {
        if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
        e.preventDefault();
        setDragOver(false);
        onAddFiles?.(e.dataTransfer.files);
      }}
    >
      {dragOver ? (
        <FullCanvasDropZone />
      ) : (
        <>
          {/* Search + actions */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${colors.semantic.border}`,
            backgroundColor: colors.semantic.white,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              border: `1px solid ${colors.semantic.border}`,
              borderRadius: 6,
              backgroundColor: colors.semantic.background,
              flex: 1,
            }}>
              <Search style={{ width: 16, height: 16, color: colors.semantic.foregroundMuted }} strokeWidth={1.75} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher une pièce…"
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: typography.fontFamily.sans,
                  fontSize: 14,
                  color: colors.semantic.foreground,
                }}
              />
            </div>
            {onGenerateBordereau && (
              <button
                onClick={onGenerateBordereau}
                className="flex items-center gap-2 h-9 px-3 text-sm font-medium text-foreground-tertiary bg-cream rounded-md hover:bg-border transition-colors flex-shrink-0"
              >
                <ListOrdered className="w-4 h-4" strokeWidth={1.5} />
                Nouveau bordereau
              </button>
            )}
            {onQuickGenerateBordereau && (
              <button
                onClick={onQuickGenerateBordereau}
                className="flex items-center gap-2 h-9 px-3 text-sm font-medium text-white bg-foreground rounded-md hover:bg-foreground-tertiary shadow-[0px_1px_2px_0px_rgba(26,26,26,0.05)] transition-colors flex-shrink-0"
              >
                <ListOrdered className="w-4 h-4" strokeWidth={1.5} />
                Générer un bordereau
              </button>
            )}
          </div>

          {/* Folder tree */}
          <div style={{ padding: '20px' }}>
            {banner}
            <BordereauTable
              pieces={filteredPieces}
              categories={categories}
              setPieces={setPieces}
              setCategories={setCategories}
              onAddFiles={onAddFiles}
              onImportEmails={onImportEmails}
              onAskChato={onAskChato}
              forceExpandAll={query.trim() !== ''}
            />
          </div>
        </>
      )}
    </div>
  );
}

