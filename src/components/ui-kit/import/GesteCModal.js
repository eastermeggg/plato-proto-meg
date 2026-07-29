// Geste C (spec §3) - « Ajouter des pièces à un dossier existant ». Modale
// deux colonnes : à gauche on choisit (colonne mail), à droite on vérifie
// (panier). Le suivi ne se décide qu'ici via les toggles « Suivre » du panier
// (défaut conservateur : OFF) ; le CTA devient « Ajouter et suivre » dès
// qu'un suivi est actif.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import Button from '../../ui/Button';
import { ModalOverlay, Droppable, usePhase2 } from './atoms';
import MailColumn from './MailColumn';
import Panier from './Panier';
import {
  buildStagedItems, localFileToItem, MOCK_LOCAL_FILES, approxPieces,
  decoupableKeys, PIECES_NODES, nodeLabel,
} from './labData';

const MAIL_W = 440;

// Sélecteur « Ajouter dans : … » (question ouverte n°1 de la spec - tranchée
// ici : défaut = dossier courant de l'arborescence, modifiable près du CTA).
function DestinationSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium text-foreground bg-white border border-border hover:bg-background-canvas transition-colors"
      >
        {nodeLabel(value)}
        <ChevronDown className="w-3 h-3 text-foreground-muted" strokeWidth={2} />
      </button>
      {open && (
        <>
          <span className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <span className="absolute z-50 bottom-8 left-0 bg-white border border-border rounded-lg shadow-xl overflow-hidden py-1 flex flex-col" style={{ minWidth: 180 }}>
            {PIECES_NODES.map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => { onChange(n.id); setOpen(false); }}
                className={`text-left px-3 h-8 text-[13px] transition-colors ${n.id === value ? 'bg-cream text-foreground font-medium' : 'text-foreground-secondary hover:bg-background-canvas'}`}
              >
                {n.label}
              </button>
            ))}
          </span>
        </>
      )}
    </span>
  );
}

// `habituels` : la section n'existe que si le dossier a DÉJÀ importé depuis la
// boîte mail (la frecency se construit) - premier import → boîte nue.
export default function GesteCModal({ onClose, onCommit, connected, onConnect, dejaSuiviFolderIds, dejaSuiviThreadIds, dossierLabel = 'Leblanc c/ AXA', habituels = true }) {
  const phase2 = usePhase2();
  const [items, setItems] = useState([]);
  const [decoupe, setDecoupe] = useState(() => new Set());
  const [suivre, setSuivre] = useState(() => new Set());
  const [selection, setSelection] = useState({ folders: new Set(), threads: new Set() });
  const [includePJ, setIncludePJ] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [destination, setDestination] = useState('correspondance');
  const fileCursor = useRef(0);
  const timers = useRef([]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const t = timers.current;
    return () => { window.removeEventListener('keydown', onKey); t.forEach(clearTimeout); };
  }, [onClose]);

  // Upload simulé : progression par ligne, le CTA attend la fin.
  const settle = (ids) => {
    const t = setTimeout(() => {
      setItems(prev => prev.map(i => (ids.includes(i.id) && i.status === 'uploading' ? { ...i, status: 'ready' } : i)));
    }, 1400);
    timers.current.push(t);
  };

  const addLocalFiles = (n = 1) => {
    const added = Array.from({ length: n }, () => {
      const mock = MOCK_LOCAL_FILES[fileCursor.current++ % MOCK_LOCAL_FILES.length];
      return localFileToItem(mock);
    });
    setItems(prev => [...prev, ...added]);
    settle(added.map(i => i.id));
  };

  const addFromTray = (picked) => {
    setItems(prev => [...prev, ...buildStagedItems(picked, prev)]);
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSuivre(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const toggleDecoupe = (key) => setDecoupe(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  const allKeys = useMemo(() => items.flatMap(decoupableKeys).map(k => k.key), [items]);
  const toggleAllDecoupe = () => setDecoupe(prev => {
    const allOn = allKeys.length > 0 && allKeys.every(k => prev.has(k));
    return allOn ? new Set() : new Set(allKeys);
  });
  const toggleSuivre = (id) => setSuivre(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const stagedFolderIds = useMemo(() => new Set(items.filter(i => i.kind === 'folder').map(i => i.folder.folderId)), [items]);
  const stagedThreadIds = useMemo(() => new Set(items.filter(i => i.kind === 'thread' && i.thread.threadId).map(i => i.thread.threadId)), [items]);

  // Récap footer
  const nPieces = approxPieces(items, decoupe);
  const nFiles = items.filter(i => i.kind === 'file').length;
  const nThreads = items.filter(i => i.kind === 'thread').length;
  const nFolders = items.filter(i => i.kind === 'folder').length;
  const nZips = items.filter(i => i.kind === 'zip').length;
  const nDecoupes = decoupe.size;
  const nSuivis = phase2 ? suivre.size : 0;
  const uploading = items.some(i => i.status === 'uploading');
  const canCommit = items.length > 0 && !uploading;
  const ctaLabel = nSuivis > 0 ? 'Ajouter et suivre' : 'Ajouter au dossier';

  const recap = items.length === 0 ? 'Aucune pièce ajoutée' : [
    `≈ ${nPieces} pièce${nPieces > 1 ? 's' : ''}`,
    nFiles ? `${nFiles} fichier${nFiles > 1 ? 's' : ''}` : null,
    nThreads ? `${nThreads} échange${nThreads > 1 ? 's' : ''}` : null,
    nFolders ? `${nFolders} dossier${nFolders > 1 ? 's' : ''} Outlook` : null,
    nZips ? `${nZips} export` : null,
    nDecoupes ? `${nDecoupes} découpé${nDecoupes > 1 ? 's' : ''}` : null,
    nSuivis ? `${nSuivis} suivi${nSuivis > 1 ? 's' : ''}` : null,
  ].filter(Boolean).join(' · ');

  const commit = () => {
    if (!canCommit) return;
    onCommit({ items, decoupe, suivre: phase2 ? suivre : new Set(), destinationId: destination });
  };

  return (
    <ModalOverlay onClose={onClose}>
      <Droppable onFiles={() => addLocalFiles(2)} className="bg-white rounded-md w-full h-full flex flex-col overflow-hidden" style={{ boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-[15px] border-b border-border flex-shrink-0">
          <div className="flex items-baseline gap-2.5 min-w-0">
            <h2 className="text-foreground flex-shrink-0" style={{ fontFamily: 'Georgia, serif', fontSize: 18, lineHeight: '20px', letterSpacing: '-0.5px' }}>
              Ajouter des pièces au dossier
            </h2>
            <span className="text-[13px] text-foreground-muted truncate">{dossierLabel} · destination</span>
          </div>
          <button type="button" onClick={onClose} className="inline-flex items-center justify-center w-[26px] h-[26px] rounded bg-cream text-foreground-tertiary hover:text-foreground transition-colors flex-shrink-0" title="Fermer">
            <X className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 min-h-0 flex">
          {/* Colonne mail - repli en largeur, jamais démontée : la sélection survit. */}
          <div
            className="relative flex-shrink-0 h-full"
            style={{ width: collapsed ? 0 : MAIL_W, overflow: 'hidden', transition: 'width 320ms cubic-bezier(0.4,0,0.2,1)' }}
            aria-hidden={collapsed || undefined}
          >
            <div className="absolute inset-y-0 left-0" style={{ width: MAIL_W }}>
              <MailColumn
                width={MAIL_W}
                selection={selection}
                onSelectionChange={setSelection}
                includePJ={includePJ}
                onIncludePJ={setIncludePJ}
                onAddToBasket={addFromTray}
                stagedFolderIds={stagedFolderIds}
                stagedThreadIds={stagedThreadIds}
                dejaSuiviFolderIds={dejaSuiviFolderIds}
                dejaSuiviThreadIds={dejaSuiviThreadIds}
                habituels={habituels}
                connected={connected}
                onConnect={onConnect}
                onCollapse={() => setCollapsed(true)}
              />
            </div>
          </div>

          <Panier
            items={items}
            onRemove={removeItem}
            decoupe={decoupe}
            onToggleDecoupe={toggleDecoupe}
            onToggleAllDecoupe={toggleAllDecoupe}
            suivre={suivre}
            onToggleSuivre={toggleSuivre}
            onAddFiles={() => addLocalFiles(1)}
            collapsed={collapsed}
            onExpand={() => setCollapsed(false)}
            expandBadge={selection.folders.size + selection.threads.size}
            introCopy="Les pièces ajoutées rejoindront le dossier. Vous pourrez les découper et les ranger ensuite."
          />
        </div>

        {/* Footer global */}
        <div className="px-5 pt-3 pb-3.5 border-t border-border flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <p className="text-[13px] text-foreground-secondary truncate">{recap}</p>
            {items.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-foreground-muted flex-shrink-0">
                Ajouter dans :
                <DestinationSelect value={destination} onChange={setDestination} />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <Button variant="secondary" size="md" label="Annuler" onClick={onClose} />
            <Button variant="primary" size="md" label={uploading ? 'Import en cours…' : ctaLabel} onClick={commit} disabled={!canCommit} />
          </div>
        </div>
      </Droppable>
    </ModalOverlay>
  );
}
