import React, { useMemo, useState } from 'react';
import { FolderPlus, Plus, Search } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';
import BordereauTable from './BordereauTable';
import CreateFolderModal from './CreateFolderModal';
import FullCanvasDropZone from './FullCanvasDropZone';

// GED container: search + folder tree. The drop zone is invisible — the
// whole canvas accepts file drops via the container handlers.
// Barre d'outils (09/09) : nombre de fichiers + recherche + Nouveau dossier +
// Ajouter des documents. Le bordereau n'a plus d'entrée ici (il vit dans les
// actes / le chat).

// `banner` : slot optionnel rendu au-dessus de l'arborescence (ex. promo
// connecteur email quand aucune boîte n'est connectée).
export default function PiecesTab({ pieces, categories, setPieces, setCategories, onAddFiles, onImportEmails, onAskChato, banner = null }) {
  const [query, setQuery] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  const filteredPieces = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pieces;
    return pieces.filter(p => {
      const fields = [p.nom, p.intitule, p.type, p.nomOriginal].filter(Boolean).map(s => String(s).toLowerCase());
      return fields.some(f => f.includes(q));
    });
  }, [pieces, query]);

  // Même création qu'au menu « + » de l'arborescence : dossier de premier niveau.
  const createFolder = (name) => {
    setCategories?.(prev => {
      const siblings = prev.filter(c => c.parentId === null);
      const nextOrder = siblings.length
        ? Math.max(...siblings.map(c => c.order)) + 1
        : 0;
      return [...prev, {
        id: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name,
        parentId: null,
        order: nextOrder,
      }];
    });
  };

  const fileCount = pieces.length;

  return (
    <div
      className="flex flex-col -mx-8 -mt-6"
      style={{ flex: 1, minHeight: '100vh', position: 'relative' }}
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
          {/* Barre discrète bord à bord : recherche sans cadre + hairline,
              compteur + actions à droite (même pattern que l'onglet pièces
              drop-first - jamais de bande blanche sur le canvas). */}
          <div className="flex items-center gap-2 px-8 py-2.5 border-b border-border">
            <Search className="w-4 h-4 flex-shrink-0" style={{ color: colors.semantic.foregroundMuted }} strokeWidth={1.5} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une pièce…"
              className="flex-1 bg-transparent focus:outline-none"
              style={{
                border: 'none',
                fontFamily: typography.fontFamily.sans,
                fontSize: 14,
                color: colors.semantic.foreground,
              }}
            />
            <span
              className="flex-shrink-0"
              style={{
                fontFamily: typography.fontFamily.mono,
                fontSize: 11,
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: colors.semantic.foregroundTertiary,
                whiteSpace: 'nowrap',
              }}
            >
              {fileCount} fichier{fileCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setCreateFolderOpen(true)}
              className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-foreground-secondary bg-white border border-border rounded-md hover:bg-cream transition-colors flex-shrink-0"
            >
              <FolderPlus className="w-4 h-4" strokeWidth={1.5} />
              Nouveau dossier
            </button>
            <button
              onClick={() => onAddFiles?.()}
              className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-white bg-foreground rounded-md hover:bg-foreground-tertiary shadow-[0px_1px_2px_0px_rgba(26,26,26,0.05)] transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Ajouter des documents
            </button>
          </div>

          {/* Folder tree - re-padé sur la gouttière du workspace */}
          <div className="px-8 py-4">
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

          <CreateFolderModal
            open={createFolderOpen}
            onOpenChange={setCreateFolderOpen}
            parentLabel="Pièces"
            onConfirm={createFolder}
          />
        </>
      )}
    </div>
  );
}
