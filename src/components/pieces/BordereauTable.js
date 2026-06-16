import React, { useMemo, useState, useCallback, useRef } from 'react';
import { Pencil, Download, Trash2, Move, FolderPlus, ArrowUp, ArrowDown, X, Sparkles, Plus, ChevronDown, FilePlus2 } from 'lucide-react';
import { colors, typography } from '../../design-system/tokens';
import { buildTreeViewRows } from '../../data/piecesModel';
import CategoryHeader from './CategoryHeader';
import PieceRow from './PieceRow';
import RowContextMenu from './RowContextMenu';
import MoveToFolderModal from './MoveToFolderModal';
import RenameFolderModal from './RenameFolderModal';
import RenamePieceModal from './RenamePieceModal';
import DeleteWarningModal from './DeleteWarningModal';
import CreateFolderModal from './CreateFolderModal';

const COL_HEADER_HEIGHT = 36;

const CAT_PREFIX = 'cat:';
const PIECE_PREFIX = 'piece:';

export default function BordereauTable({
  pieces,
  categories,
  setPieces,
  setCategories,
  onOpenPiecePreview,
  onAddFiles,
  onAskChato,
  reviewZone = null,
  forceExpandAll = false,
}) {
  const fileInputRef = useRef(null);
  const addButtonRef = useRef(null);
  const [addMenu, setAddMenu] = useState(null); // { x, y }
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [menu, setMenu] = useState(null);
  const [moveModal, setMoveModal] = useState(null);
  const [renameModal, setRenameModal] = useState(null);
  const [renamePieceModal, setRenamePieceModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [sort, setSort] = useState({ col: 'name', dir: 'asc' });

  const toggleSort = (col) => setSort(prev => {
    const nextDir = prev.col === col ? (prev.dir === 'asc' ? 'desc' : 'asc') : 'asc';
    return { col, dir: nextDir };
  });

  // When a search filter is active upstream, force every folder open so matches
  // inside collapsed folders are still visible. Falls back to user expansion
  // state once the search clears.
  const effectiveExpandedIds = useMemo(() => {
    if (!forceExpandAll) return expandedIds;
    return new Set(categories.map(c => c.id));
  }, [forceExpandAll, expandedIds, categories]);

  const rows = useMemo(
    () => buildTreeViewRows(pieces, categories, effectiveExpandedIds, sort),
    [pieces, categories, effectiveExpandedIds, sort]
  );

  const totalPieceCount = pieces.length;

  const toggleExpand = (categoryId) => setExpandedIds(prev => {
    const next = new Set(prev);
    if (next.has(categoryId)) next.delete(categoryId); else next.add(categoryId);
    return next;
  });

  // ── Selection helpers
  const selectionKeyForCategory = (id) => CAT_PREFIX + id;
  const selectionKeyForPiece = (id) => PIECE_PREFIX + id;

  const toggleInSelection = (key) => setSelectedIds(prev => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  const clearSelection = () => setSelectedIds(new Set());

  const affectedKeysFromAnchor = (anchorKey) => {
    if (selectedIds.has(anchorKey) && selectedIds.size > 1) return Array.from(selectedIds);
    return [anchorKey];
  };

  // ── Mutations
  const findPiece = useCallback((id) => pieces.find(p => p.id === id), [pieces]);
  const findCategory = useCallback((id) => categories.find(c => c.id === id), [categories]);

  const movePiecesTo = (pieceIds, destCategoryId) => {
    setPieces?.(prev => prev.map(p => {
      if (!pieceIds.includes(p.id)) return p;
      return { ...p, categoryId: destCategoryId === '__root__' ? null : destCategoryId };
    }));
  };

  const moveCategoryTo = (categoryId, destParentId) => {
    setCategories?.(prev => prev.map(c => {
      if (c.id !== categoryId) return c;
      return { ...c, parentId: destParentId === '__root__' ? null : destParentId };
    }));
  };

  const renameCategory = (categoryId, newName) => {
    setCategories?.(prev => prev.map(c => c.id === categoryId ? { ...c, name: newName } : c));
  };

  const createFolder = (name) => {
    setCategories?.(prev => {
      const siblings = prev.filter(c => c.parentId === null);
      const nextOrder = siblings.length
        ? Math.max(...siblings.map(c => c.order)) + 1
        : 0;
      const newCat = {
        id: `cat-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name,
        parentId: null,
        order: nextOrder,
      };
      return [...prev, newCat];
    });
  };

  const renamePiece = (pieceId, newName) => {
    setPieces?.(prev => prev.map(p => p.id === pieceId ? { ...p, intitule: newName, nom: newName } : p));
  };

  const triggerPieceRename = (pieceId) => {
    const p = findPiece(pieceId);
    if (!p) return;
    if (onOpenPiecePreview) onOpenPiecePreview(pieceId);
    else setRenamePieceModal({ piece: p });
  };

  const deletePieces = (pieceIds) => {
    setPieces?.(prev => prev.filter(p => !pieceIds.includes(p.id)));
  };

  const deleteCategories = (categoryIds) => {
    const allDoomed = new Set(categoryIds);
    const stack = [...categoryIds];
    while (stack.length) {
      const id = stack.pop();
      categories.forEach(c => { if (c.parentId === id && !allDoomed.has(c.id)) { allDoomed.add(c.id); stack.push(c.id); } });
    }
    setCategories?.(prev => prev.filter(c => !allDoomed.has(c.id)));
    setPieces?.(prev => prev.map(p => allDoomed.has(p.categoryId) ? { ...p, categoryId: null } : p));
  };

  // ── Action menus
  const buildCategoryActions = (categoryId) => {
    const cat = findCategory(categoryId);
    if (!cat) return [];
    const keys = affectedKeysFromAnchor(selectionKeyForCategory(categoryId));
    const isBulk = keys.length > 1;
    return [
      { icon: Pencil, label: isBulk ? 'Renommer (uniquement le dossier ciblé)' : 'Renommer',
        onClick: () => setRenameModal({ categoryId, currentName: cat.name }) },
      { icon: Move, label: isBulk ? `Déplacer ${keys.length} éléments` : 'Déplacer',
        onClick: () => openMoveModal(keys) },
      { icon: Download, label: 'Télécharger', onClick: () => { /* stub */ } },
      { separator: true },
      { icon: Trash2, label: isBulk ? `Supprimer ${keys.length} éléments` : 'Supprimer le dossier', destructive: true,
        onClick: () => openDeleteModal(keys) },
    ];
  };

  const buildPieceActions = (pieceId) => {
    const p = findPiece(pieceId);
    if (!p) return [];
    const keys = affectedKeysFromAnchor(selectionKeyForPiece(pieceId));
    const isBulk = keys.length > 1;
    return [
      { icon: Pencil, label: isBulk ? 'Renommer (uniquement la pièce ciblée)' : 'Renommer',
        onClick: () => triggerPieceRename(pieceId) },
      { icon: Move, label: isBulk ? `Déplacer ${keys.length} éléments` : 'Déplacer',
        onClick: () => openMoveModal(keys) },
      { separator: true },
      { icon: Trash2, label: isBulk ? `Supprimer ${keys.length} éléments` : 'Supprimer la pièce', destructive: true,
        onClick: () => openDeleteModal(keys) },
    ];
  };

  const openMoveModal = (keys) => {
    const pieceIds = keys.filter(k => k.startsWith(PIECE_PREFIX)).map(k => k.slice(PIECE_PREFIX.length));
    const categoryIds = keys.filter(k => k.startsWith(CAT_PREFIX)).map(k => k.slice(CAT_PREFIX.length));
    const labelParts = [];
    if (pieceIds.length) labelParts.push(`${pieceIds.length} pièce${pieceIds.length > 1 ? 's' : ''}`);
    if (categoryIds.length) labelParts.push(`${categoryIds.length} dossier${categoryIds.length > 1 ? 's' : ''}`);
    setMoveModal({
      pieceIds,
      categoryIds,
      excludeIds: categoryIds,
      label: labelParts.join(' et '),
    });
  };

  const openDeleteModal = (keys) => {
    const pieceIds = keys.filter(k => k.startsWith(PIECE_PREFIX)).map(k => k.slice(PIECE_PREFIX.length));
    const categoryIds = keys.filter(k => k.startsWith(CAT_PREFIX)).map(k => k.slice(CAT_PREFIX.length));

    const items = [];
    pieceIds.forEach(id => { const p = findPiece(id); if (p) items.push(p.intitule || p.nom || id); });
    categoryIds.forEach(id => { const c = findCategory(id); if (c) items.push(`Dossier : ${c.name}`); });

    let warning = null;
    if (categoryIds.length) {
      const doomed = new Set(categoryIds);
      const stack = [...categoryIds];
      while (stack.length) {
        const x = stack.pop();
        categories.forEach(c => { if (c.parentId === x && !doomed.has(c.id)) { doomed.add(c.id); stack.push(c.id); } });
      }
      const piecesInside = pieces.filter(p => doomed.has(p.categoryId));
      const subFolders = doomed.size - categoryIds.length;
      const parts = [];
      if (piecesInside.length) parts.push(`${piecesInside.length} pièce${piecesInside.length > 1 ? 's' : ''}`);
      if (subFolders) parts.push(`${subFolders} sous-dossier${subFolders > 1 ? 's' : ''}`);
      if (parts.length) warning = `Les pièces de ${categoryIds.length > 1 ? 'ces dossiers' : 'ce dossier'} (${parts.join(' et ')}) seront déplacées dans "Sans catégorie".`;
    }

    const title = pieceIds.length + categoryIds.length > 1
      ? `Supprimer ${pieceIds.length + categoryIds.length} éléments ?`
      : (pieceIds.length ? 'Supprimer cette pièce ?' : 'Supprimer ce dossier ?');

    setDeleteModal({
      items,
      title,
      warning,
      onConfirm: () => {
        if (pieceIds.length) deletePieces(pieceIds);
        if (categoryIds.length) deleteCategories(categoryIds);
        clearSelection();
      },
    });
  };

  // Opening the menu (kebab click or right-click) intentionally does NOT
  // mutate selection. The menu acts on whatever the anchor row resolves to
  // via affectedKeysFromAnchor: the current selection if the anchor row is
  // part of it, otherwise just that single row.
  const handleCategoryContextOrKebab = (categoryId, position) => {
    setMenu({ position, items: buildCategoryActions(categoryId) });
  };
  const handlePieceContextOrKebab = (pieceId, position) => {
    setMenu({ position, items: buildPieceActions(pieceId) });
  };

  const hasSelection = selectedIds.size > 0;
  const selectionHasFolder = useMemo(
    () => [...selectedIds].some(k => k.startsWith(CAT_PREFIX)),
    [selectedIds]
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 56, paddingTop: 8 }}>
        {hasSelection ? (
          <SelectionActionBar
            count={selectedIds.size}
            showAskChato={!selectionHasFolder}
            onMove={() => openMoveModal([...selectedIds])}
            onDelete={() => openDeleteModal([...selectedIds])}
            onDownload={() => { /* stub */ }}
            onClear={clearSelection}
            onAskChato={() => {
              if (!onAskChato) return;
              const items = [...selectedIds].map(key => {
                if (key.startsWith(PIECE_PREFIX)) {
                  const p = findPiece(key.slice(PIECE_PREFIX.length));
                  if (!p) return null;
                  return { id: p.id, name: p.intitule || p.nom || p.id, source: 'piece' };
                }
                if (key.startsWith(CAT_PREFIX)) {
                  const c = findCategory(key.slice(CAT_PREFIX.length));
                  if (!c) return null;
                  return { id: c.id, name: c.name, source: 'folder' };
                }
                return null;
              }).filter(Boolean);
              onAskChato(items);
              // Selection intentionally preserved: the user is still working
              // on these rows in the chat. They'll clear it themselves (×
              // button or unchecking) when they're done.
            }}
          />
        ) : (
          <>
            <div style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              fontFamily: typography.fontFamily.sans,
              fontSize: 14,
              fontWeight: 500,
              color: colors.semantic.foreground,
            }}>
              {totalPieceCount} pièce{totalPieceCount > 1 ? 's' : ''}
            </div>
            <button
              ref={addButtonRef}
              type="button"
              onClick={() => {
                const rect = addButtonRef.current?.getBoundingClientRect();
                if (rect) setAddMenu({ x: rect.right - 220, y: rect.bottom + 4 });
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                height: 36,
                padding: '0 14px',
                border: 'none',
                borderRadius: 6,
                background: colors.semantic.foreground,
                color: colors.semantic.white,
                cursor: 'pointer',
                fontFamily: typography.fontFamily.sans,
                fontSize: 13,
                fontWeight: 500,
                flexShrink: 0,
                transition: 'background-color 100ms',
                boxShadow: '0px 1px 2px rgba(26,26,26,0.06)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = colors.semantic.foregroundTertiary; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = colors.semantic.foreground; }}
            >
              <Plus style={{ width: 14, height: 14 }} strokeWidth={2} />
              Ajouter
              <ChevronDown style={{ width: 14, height: 14, marginLeft: 2, opacity: 0.8 }} strokeWidth={2} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) onAddFiles?.(e.target.files);
                e.target.value = '';
              }}
            />
          </>
        )}
      </div>

      {/* "À vérifier" zone — sits between the count/Ajouter header and the table. */}
      {reviewZone}

      <div style={{
        marginTop: 12,
        border: `1px solid ${colors.semantic.border}`,
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: colors.semantic.white,
      }}>
        {rows.length === 0 ? (
          <div style={{
            padding: '40px 16px',
            textAlign: 'center',
            fontFamily: typography.fontFamily.sans,
            fontSize: 13,
            color: colors.semantic.foregroundMuted,
            fontStyle: 'italic',
          }}>
            Aucune pièce.
          </div>
        ) : (
          <>
            <TreeColumnHeader sort={sort} onSort={toggleSort} />
            {rows.map((row) => {
              if (row.kind === 'category') {
                const catKey = selectionKeyForCategory(row.category.id);
                return (
                  <CategoryHeader
                    key={`cat-${row.category.id}`}
                    label={row.category.name}
                    depth={row.depth}
                    hasChildren={row.hasChildren}
                    expanded={row.expanded}
                    isEmpty={!row.hasChildren}
                    selected={selectedIds.has(catKey)}
                    onToggle={() => toggleExpand(row.category.id)}
                    onSelectToggle={() => toggleInSelection(catKey)}
                    onContextMenu={(pos) => handleCategoryContextOrKebab(row.category.id, pos)}
                    onOpenMenu={(pos) => handleCategoryContextOrKebab(row.category.id, pos)}
                  />
                );
              }
              if (row.kind === 'piece' || row.kind === 'sansCategoriePiece') {
                const piece = row.piece;
                const isSansCat = row.kind === 'sansCategoriePiece';
                const pieceKey = selectionKeyForPiece(piece.id);

                // ── Pile segment row — rendered as a normal classified piece.
                // No group bandeau: the source file shows as the row subtitle,
                // and re-splitting lives in the document preview ("Modifier le
                // découpage").
                if (piece._pileSegment) {
                  return (
                    <PieceRow
                      key={`pile-seg-${piece.id}`}
                      piece={piece}
                      depth={row.depth}
                      italic={isSansCat}
                      selected={selectedIds.has(pieceKey)}
                      onClick={() => triggerPieceRename(piece.id)}
                      onSelectToggle={() => toggleInSelection(pieceKey)}
                      onContextMenu={(pos) => handlePieceContextOrKebab(piece.id, pos)}
                      onOpenMenu={(pos) => handlePieceContextOrKebab(piece.id, pos)}
                    />
                  );
                }

                // ── Pile processing row ─────────────────────────────────
                if (piece._pileProcessing) {
                  return (
                    <PileProcessingRow
                      key={`pile-proc-${piece.id}`}
                      piece={piece}
                      depth={row.depth}
                    />
                  );
                }

                return (
                  <PieceRow
                    key={`piece-${piece.id}`}
                    piece={piece}
                    depth={row.depth}
                    italic={isSansCat}
                    selected={selectedIds.has(pieceKey)}
                    onClick={() => triggerPieceRename(piece.id)}
                    onSelectToggle={() => toggleInSelection(pieceKey)}
                    onContextMenu={(pos) => handlePieceContextOrKebab(piece.id, pos)}
                    onOpenMenu={(pos) => handlePieceContextOrKebab(piece.id, pos)}
                  />
                );
              }
              return null;
            })}
          </>
        )}
      </div>

      <RowContextMenu
        open={!!menu}
        position={menu?.position}
        items={menu?.items || []}
        onClose={() => setMenu(null)}
      />

      <MoveToFolderModal
        open={!!moveModal}
        onOpenChange={(o) => { if (!o) setMoveModal(null); }}
        categories={categories}
        excludeIds={moveModal?.excludeIds || []}
        selectionLabel={moveModal?.label}
        onConfirm={(destCategoryId) => {
          if (moveModal?.pieceIds?.length) movePiecesTo(moveModal.pieceIds, destCategoryId);
          if (moveModal?.categoryIds?.length) moveModal.categoryIds.forEach(id => moveCategoryTo(id, destCategoryId));
          clearSelection();
        }}
      />

      <RenameFolderModal
        open={!!renameModal}
        onOpenChange={(o) => { if (!o) setRenameModal(null); }}
        currentName={renameModal?.currentName || ''}
        onConfirm={(newName) => { if (renameModal) renameCategory(renameModal.categoryId, newName); }}
      />

      <RenamePieceModal
        open={!!renamePieceModal}
        onOpenChange={(o) => { if (!o) setRenamePieceModal(null); }}
        piece={renamePieceModal?.piece}
        onConfirm={(newName) => { if (renamePieceModal?.piece) renamePiece(renamePieceModal.piece.id, newName); }}
      />

      <DeleteWarningModal
        open={!!deleteModal}
        onOpenChange={(o) => { if (!o) setDeleteModal(null); }}
        title={deleteModal?.title}
        itemsSummary={deleteModal?.items}
        warning={deleteModal?.warning}
        onConfirm={deleteModal?.onConfirm}
      />

      <CreateFolderModal
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        parentLabel="Pièces"
        onConfirm={createFolder}
      />

      <RowContextMenu
        open={!!addMenu}
        position={addMenu}
        items={[
          { icon: FilePlus2,  label: 'Nouveau fichier', onClick: () => fileInputRef.current?.click() },
          { icon: FolderPlus, label: 'Nouveau dossier', onClick: () => setCreateFolderOpen(true) },
        ]}
        onClose={() => setAddMenu(null)}
      />
    </div>
  );
}

function TreeColumnHeader({ sort, onSort }) {
  return (
    <div style={{
      height: COL_HEADER_HEIGHT,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: colors.semantic.backgroundCanvas,
      borderBottom: `1px solid ${colors.semantic.border}`,
    }}>
      {/* Indent column + chevron/folder slot — matches the row layout. */}
      <span style={{ width: 40, flexShrink: 0 }} />
      <span style={{ width: 24, flexShrink: 0, marginRight: 8 }} />
      <SortCell label="Dossier" col="name" sort={sort} onSort={onSort} flex />
      <ColSpacer width={130} />
      <SortCell label="Date" col="date" sort={sort} onSort={onSort} width={130} />
      <ColSpacer width={72} />
    </div>
  );
}

function ColSpacer({ width }) {
  return <div style={{ width, flexShrink: 0 }} />;
}

function SortCell({ label, col, sort, onSort, width, flex }) {
  const active = sort.col === col;
  const Arrow = active && sort.dir === 'desc' ? ArrowDown : ArrowUp;
  const style = flex ? { flex: 1, minWidth: 0 } : { width, flexShrink: 0 };
  return (
    <button
      type="button"
      onClick={() => onSort(col)}
      style={{
        ...style,
        paddingRight: 12,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: typography.fontFamily.mono,
        fontSize: 11,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: active ? colors.semantic.foreground : colors.semantic.foregroundSecondary,
        textAlign: 'left',
      }}
    >
      <span>{label}</span>
      {active && <Arrow style={{ width: 12, height: 12 }} strokeWidth={2} />}
    </button>
  );
}

// "Command-bar inversion" — when selection is active, the chrome flips
// from passive cream to dark stone with cream typography. The mode shift
// itself is the bold gesture: this row now leads the page. Inset highlight
// gives the bar dimension; existing fade-slide-up entrance gives it weight.
function SelectionActionBar({ count, onMove, onDelete, onDownload, onClear, onAskChato, showAskChato }) {
  return (
    <div
      className="animate-fade-up"
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '0 10px 0 8px',
        height: 44,
        borderRadius: 6,
        background: colors.semantic.foreground, // #292524
        boxShadow: 'inset 0 1px 0 rgba(238, 236, 230, 0.08), 0 1px 2px rgba(26, 26, 26, 0.08), 0 2px 6px rgba(26, 26, 26, 0.06)',
      }}
    >
      <ActionIcon icon={X} title="Tout désélectionner" onClick={onClear} tone="dark" />

      <span style={{
        fontFamily: typography.fontFamily.mono,
        fontSize: 12,
        fontWeight: 500,
        color: colors.semantic.cream,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginLeft: 2,
        marginRight: 10,
        userSelect: 'none',
      }}>
        <span style={{ color: '#ffffff' }}>{count}</span>
        {' '}sélectionné{count > 1 ? 's' : ''}
      </span>

      {showAskChato && (
        <>
          {/* Vertical hairline divider — sets off Chato as a privileged action */}
          <span style={{
            width: 1,
            height: 18,
            background: 'rgba(238, 236, 230, 0.16)',
            marginRight: 6,
          }} />
          <AskChatoLink tone="dark" onClick={onAskChato} />
        </>
      )}

      <span style={{ flex: 1 }} />

      <ActionIcon icon={Download} title="Télécharger"     onClick={onDownload} tone="dark" />
      <ActionIcon icon={Move}     title="Déplacer vers…"  onClick={onMove}     tone="dark" />
      <ActionIcon icon={Trash2}   title="Supprimer"       onClick={onDelete}   tone="dark" destructive />
    </div>
  );
}

function ActionIcon({ icon: Icon, title, onClick, destructive, tone }) {
  const dark = tone === 'dark';
  let restColor, hoverColor;
  if (destructive) {
    restColor  = dark ? '#fca5a5' : '#991b1b';
    hoverColor = dark ? '#fecaca' : '#7f1d1d';
  } else if (dark) {
    restColor  = 'rgba(238, 236, 230, 0.72)';
    hoverColor = '#ffffff';
  } else {
    restColor  = colors.semantic.foregroundSecondary;
    hoverColor = colors.semantic.foreground;
  }
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        width: 32,
        height: 32,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        color: restColor,
        transition: 'color 120ms ease-out',
        padding: 0,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = hoverColor; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = restColor; }}
    >
      <Icon style={{ width: 16, height: 16 }} strokeWidth={1.75} />
    </button>
  );
}

// ── Pile processing row ──────────────────────────────────────────────────

function PileProcessingRow({ piece, depth }) {
  const indent = 40 + Math.max(0, depth) * 16;
  const label = piece._pileProcessing?.label || 'Analyse du document…';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', minHeight: 44,
      paddingLeft: indent, paddingRight: 12,
      borderBottom: `1px solid ${colors.semantic.border}`,
    }}>
      <span style={{
        display: 'inline-block', width: 14, height: 14, marginRight: 10,
        borderRadius: 999, border: `2px solid ${colors.semantic.foregroundMuted}`,
        borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: colors.semantic.foreground, fontFamily: typography.fontFamily.sans }}>
          {piece.intitule}
        </div>
        <div style={{ fontSize: 12, color: colors.semantic.foregroundMuted, marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function AskChatoLink({ tone, onClick }) {
  const dark = tone === 'dark';
  // On dark bg: light info-blue (#93c5fd) reads clearly; on light bg keep the existing info accent.
  const restColor  = dark ? '#93c5fd' : colors.banner.info.accent;
  const hoverColor = dark ? '#bfdbfe' : colors.banner.info.accentHover;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 30,
        padding: '0 8px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: typography.fontFamily.sans,
        fontSize: 13,
        fontWeight: 500,
        color: restColor,
        transition: 'color 120ms ease-out',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.color = hoverColor; }}
      onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.color = restColor; }}
    >
      <Sparkles style={{ width: 14, height: 14 }} strokeWidth={2} />
      <span>Demander à Chato</span>
    </button>
  );
}
